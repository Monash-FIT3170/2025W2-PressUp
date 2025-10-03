import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Mongo } from "meteor/mongo";
import {
  Order,
  OrdersCollection,
  OrderMenuItem,
  OptionSelections,
  OrderModifier,
} from "./OrdersCollection";
import { requireLoginMethod } from "../accounts/wrappers";
import { IdType } from "../database";
import { Roles } from "meteor/alanning:roles";
import { RoleEnum } from "../accounts/roles";
import { Random } from "meteor/random";
import {
  MenuItemsCollection,
  MenuItem,
} from "../menuItems/MenuItemsCollection";

function sameKey(it: any, key: string): boolean {
  const lineId = typeof it?.lineId === "string" ? it.lineId : undefined;
  const menuItemId = it?.menuItemId != null ? String(it.menuItemId) : undefined; // ObjectId -> string
  const legacyId = it?._id != null ? String(it._id) : undefined;

  return lineId === key || menuItemId === key || legacyId === key;
}

/** ---------- helpers ---------- **/

// Normalize selections: Sort keys and sort values in each group
function normalizeSelections(
  sel: OptionSelections = {},
): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const gid of Object.keys(sel).sort()) {
    const v = sel[gid] ?? [];
    const arr = Array.isArray(v) ? v : [String(v)];
    out[gid] = [...arr].map(String).sort();
  }
  return out;
}

// Deep comparison (compare after normalization)
function equalSelections(
  a: OptionSelections = {},
  b: OptionSelections = {},
): boolean {
  return (
    JSON.stringify(normalizeSelections(a)) ===
    JSON.stringify(normalizeSelections(b))
  );
}

function equalBaseKeys(a?: string[], b?: string[]) {
  const sa = [...new Set(a ?? [])].sort().join("|");
  const sb = [...new Set(b ?? [])].sort().join("|");
  return sa === sb;
}

function buildSnapshot(
  menu: MenuItem,
  selections: OptionSelections = {},
  baseIncludedKeys?: string[],
) {
  const baseDefs = menu.baseIngredients ?? [];

  const defaultBaseKeys = baseDefs
    .filter((b) => (b.removable === false ? true : !!b.default))
    .map((b) => b.key);

  const baseSet = new Set(
    baseIncludedKeys && baseIncludedKeys.length > 0
      ? baseIncludedKeys
      : defaultBaseKeys,
  );

  const baseLabels = baseDefs
    .filter((b) => b.removable === false || baseSet.has(b.key))
    .map((b) => b.label);

  const modifiers: OrderModifier[] = [];

  for (const b of baseDefs) {
    const included = b.removable === false || baseSet.has(b.key);
    if (included && typeof b.priceDelta === "number" && b.priceDelta !== 0) {
      modifiers.push({ key: b.key, label: b.label, priceDelta: b.priceDelta });
    }
  }

  const optionLabels: string[] = [];

  // Updated loop for option groups
  for (const g of menu.optionGroups ?? []) {
    const baseKey = g.id.split("-")[0];
    const baseExists = baseDefs.some((b) => b.key === baseKey);
    const baseIncluded =
      !baseExists ||
      baseSet.has(baseKey) ||
      (baseExists &&
        baseDefs.find((b) => b.key === baseKey)!.removable === false);

    let selectedKeys = selections[g.id];

    if (!baseIncluded) {
      // Base is off → force empty, no defaults
      selectedKeys = [];
    } else {
      // Base is on → apply defaults if nothing is provided
      if (!selectedKeys || selectedKeys.length === 0) {
        const defaults = g.options.filter((o) => o.default).map((o) => o.key);
        if (defaults.length > 0) selectedKeys = defaults;
        else if (g.type === "single" && g.options.length > 0 && g.required) {
          selectedKeys = [g.options[0].key];
        } else {
          selectedKeys = [];
        }
      }
    }

    const chosen = g.options.filter((o) => selectedKeys!.includes(o.key));
    for (const o of chosen) {
      optionLabels.push(o.label);
      if (typeof o.priceDelta === "number" && o.priceDelta !== 0) {
        modifiers.push({
          key: o.key,
          label: o.label,
          priceDelta: o.priceDelta,
        });
      }
    }
  }

  const ingredients = [...baseLabels, ...optionLabels];
  const priceDeltaSum = modifiers.reduce((s, m) => s + (m.priceDelta || 0), 0);
  const unitPrice = (menu.price ?? 0) + priceDeltaSum;

  return {
    ingredients,
    modifiers,
    unitPrice,
    basePrice: menu.price ?? 0,
  };
}

function computeTotals(order: Order) {
  const base = (order.menuItems ?? []).reduce(
    (s, it) => s + (it.price ?? 0) * (it.quantity ?? 1),
    0,
  );
  const p = order.discountPercent ?? 0;
  const a = order.discountAmount ?? 0;
  const final = Math.max(0, base - base * (p / 100) - a);
  return { originalPrice: base, totalPrice: final };
}

async function recomputeTotals(orderId: IdType | Mongo.ObjectID) {
  const updated = (await OrdersCollection.findOneAsync({
    _id: orderId,
  } as any)) as Order | undefined;
  if (!updated) return;
  const totals = computeTotals(updated);
  await OrdersCollection.updateAsync({ _id: orderId } as any, { $set: totals });
}

/** ---------- methods ---------- **/
Meteor.methods({
  "orders.updateOrder": requireLoginMethod(async function (
    orderId: IdType,
    update: Partial<Order>,
  ) {
    if (!orderId || !update)
      throw new Meteor.Error(
        "invalid-arguments",
        "Order ID and update are required",
      );

    const existingOrder = await OrdersCollection.findOneAsync(
      orderId as IdType,
    );
    if (!existingOrder)
      throw new Meteor.Error("order-not-found", "Order not found");

    if (existingOrder.isLocked) {
      if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.MANAGER]))) {
        throw new Meteor.Error(
          "order-locked",
          "Order is locked and cannot be edited",
        );
      }
    }

    const n = await OrdersCollection.updateAsync(orderId, { $set: update });
    await recomputeTotals(orderId);
    return n;
  }),

  "orders.addOrder": requireLoginMethod(async function (order: Partial<Order>) {
    if (!order)
      throw new Meteor.Error("invalid-arguments", "Order data is required");

    if (!order.orderNo) {
      const lastOrder = await OrdersCollection.find(
        {},
        { sort: { orderNo: -1 }, limit: 1 },
      ).fetchAsync();
      let nextOrderNo = 1001;
      if (lastOrder.length > 0 && typeof lastOrder[0].orderNo === "number") {
        nextOrderNo = lastOrder[0].orderNo + 1;
      }
      order.orderNo = nextOrderNo;
    }
    return await OrdersCollection.insertAsync(order as Order);
  }),

  "orders.getAll": requireLoginMethod(async function () {
    return OrdersCollection.find().fetch();
  }),

  "orders.setMenuItemServed": requireLoginMethod(async function (
    orderId: IdType,
    index: number,
    served: boolean,
  ) {
    check(orderId, String);
    check(index, Number);
    check(served, Boolean);

    const n = await OrdersCollection.updateAsync(orderId, {
      $set: { [`menuItems.${index}.served`]: served },
    });
    await recomputeTotals(orderId);
    return n;
  }),

  "orders.setAllMenuItemsServed": requireLoginMethod(async function (
    orderId: IdType,
    served: boolean,
  ) {
    check(orderId, String);
    check(served, Boolean);

    const n = await OrdersCollection.updateAsync(orderId, {
      $set: { "menuItems.$[].served": served },
    });
    await recomputeTotals(orderId);
    return n;
  }),

  "orders.removeOrder": requireLoginMethod(async function (orderId: IdType) {
    if (!orderId)
      throw new Meteor.Error("invalid-arguments", "Order ID is required");
    return await OrdersCollection.removeAsync(orderId);
  }),

  "orders.setLocked": requireLoginMethod(async function (
    orderId: IdType,
    locked: boolean,
  ) {
    check(orderId, String);
    check(locked, Boolean);

    if (!(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.MANAGER]))) {
      throw new Meteor.Error(
        "invalid-permissions",
        "No permissions to edit locked state.",
      );
    }
    return await OrdersCollection.updateAsync(orderId, {
      $set: { isLocked: locked },
    });
  }),

  /** -------- Add Menu Item to Order (including lineId) -------- **/
  "orders.addMenuItemFromMenu": requireLoginMethod(async function (
    orderId,
    menuItemId,
    quantity = 1,
    selections: OptionSelections = {},
  ) {
    check(orderId, Match.OneOf(String, Mongo.ObjectID));
    check(menuItemId, Match.OneOf(String, Mongo.ObjectID));
    check(quantity, Number);

    const order = await OrdersCollection.findOneAsync(orderId);
    if (!order) throw new Meteor.Error("order-not-found", "Order not found");
    if (
      order.isLocked &&
      !(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.MANAGER]))
    ) {
      throw new Meteor.Error(
        "order-locked",
        "Order is locked and cannot be edited",
      );
    }

    const menu = await MenuItemsCollection.findOneAsync(menuItemId);
    if (!menu) throw new Meteor.Error("menu-not-found", "Menu item not found");

    const defaultBaseKeys = (menu.baseIngredients ?? [])
      .filter((b) => (b.removable === false ? true : !!b.default))
      .map((b) => b.key);

    const idx = (order.menuItems ?? []).findIndex(
      (it: any) =>
        String(it?.menuItemId) === String(menuItemId) &&
        equalSelections(it?.optionSelections ?? {}, selections ?? {}) &&
        equalBaseKeys(it?.baseIncludedKeys ?? [], defaultBaseKeys),
    );

    if (idx >= 0) {
      await OrdersCollection.updateAsync(orderId, {
        $inc: { [`menuItems.${idx}.quantity`]: quantity },
      } as any);
      await recomputeTotals(orderId);
      return;
    }

    const snap = buildSnapshot(menu, selections, defaultBaseKeys);
    const item: OrderMenuItem = {
      lineId: Random.id(),
      menuItemId: menuItemId as IdType,
      name: menu.name,
      quantity,
      basePrice: snap.basePrice,
      price: snap.unitPrice,
      ingredients: snap.ingredients,
      modifiers: snap.modifiers,
      optionSelections: selections,
      baseIncludedKeys: defaultBaseKeys,
    };

    await OrdersCollection.updateAsync(orderId, { $push: { menuItems: item } });
    await recomputeTotals(orderId);
  }),

  /** -------- Update Menu Item Selections -------- **/
  "orders.updateMenuItemSelections": requireLoginMethod(async function (
    orderId: IdType,
    itemIndex: number,
    selections: OptionSelections,
    baseIncludedKeys?: string[],
  ) {
    check(orderId, Match.OneOf(String, Mongo.ObjectID));
    check(itemIndex, Number);

    const order = await OrdersCollection.findOneAsync(orderId as any);
    if (!order) throw new Meteor.Error("order-not-found", "Order not found");
    if (
      order.isLocked &&
      !(await Roles.userIsInRoleAsync(this.userId, [RoleEnum.MANAGER]))
    ) {
      throw new Meteor.Error(
        "order-locked",
        "Order is locked and cannot be edited",
      );
    }

    const item = order.menuItems[itemIndex];
    if (!item) throw new Meteor.Error("item-not-found", "Order item not found");

    let menu = await MenuItemsCollection.findOneAsync({
      _id: item.menuItemId,
    } as any);
    if (!menu && item?.name) {
      menu = await MenuItemsCollection.findOneAsync({ name: item.name } as any);
    }
    if (!menu) throw new Meteor.Error("menu-not-found", "Menu item not found");

    const defaultBaseKeys = (menu.baseIngredients ?? [])
      .filter((b) => (b.removable === false ? true : !!b.default))
      .map((b) => b.key);

    const hasArgBase = typeof baseIncludedKeys !== "undefined";

    const effectiveBaseKeys = hasArgBase
      ? (baseIncludedKeys as string[])
      : Array.isArray(item.baseIncludedKeys)
        ? (item.baseIncludedKeys as string[])
        : defaultBaseKeys;

    const snap = buildSnapshot(menu, selections, effectiveBaseKeys);

    await OrdersCollection.updateAsync({ _id: orderId } as any, {
      $set: {
        [`menuItems.${itemIndex}.price`]: snap.unitPrice,
        [`menuItems.${itemIndex}.basePrice`]: snap.basePrice,
        [`menuItems.${itemIndex}.ingredients`]: snap.ingredients,
        [`menuItems.${itemIndex}.modifiers`]: snap.modifiers,
        [`menuItems.${itemIndex}.optionSelections`]: selections,
        [`menuItems.${itemIndex}.baseIncludedKeys`]: effectiveBaseKeys,
      },
    });
    await recomputeTotals(orderId);
  }),

  /** -------- Fallback: Delete by index -------- **/
  "orders.removeMenuItemAt": requireLoginMethod(async function (
    orderId: IdType,
    index: number,
  ) {
    check(orderId, Match.OneOf(String, Mongo.ObjectID));
    check(index, Number);

    const order = await OrdersCollection.findOneAsync({ _id: orderId } as any);
    if (!order) throw new Meteor.Error("order-not-found", "Order not found");

    await OrdersCollection.updateAsync(
      { _id: orderId } as any,
      { $unset: { [`menuItems.${index}`]: 1 } } as any,
    );
    // ▼ TypeScript does not allow null, so cast it
    await OrdersCollection.updateAsync(
      { _id: orderId } as any,
      { $pull: { menuItems: null as any } } as any,
    );

    await recomputeTotals(orderId);
  }),

  /** -------- Delete by lineId (recommended) -------- **/
  "orders.removeMenuItemByLineId": requireLoginMethod(async function (
    orderId: IdType,
    lineId: string,
  ) {
    check(orderId, Match.OneOf(String, Mongo.ObjectID));
    check(lineId, String);

    const n = await OrdersCollection.updateAsync(orderId, {
      $pull: { menuItems: { lineId } },
    });
    await recomputeTotals(orderId);
    return n;
  }),

  /** -------- Increase Quantity by 1 (lineId preferred, menuItemId fallback) -------- **/
  "orders.incQtyByKey": requireLoginMethod(async function (
    orderId: IdType,
    key: string,
  ) {
    check(orderId, String);
    check(key, String);

    const order = await OrdersCollection.findOneAsync(orderId);
    if (!order) throw new Meteor.Error("order-not-found", "Order not found");

    const idx = (order.menuItems ?? []).findIndex((it: any) =>
      sameKey(it, key),
    );
    if (idx < 0)
      throw new Meteor.Error("item-not-found", "Order item not found");

    await OrdersCollection.updateAsync(orderId, {
      $inc: { [`menuItems.${idx}.quantity`]: 1 },
    } as any);

    await recomputeTotals(orderId);
  }),

  /** -------- Decrease Quantity by 1 (delete if 0) -------- **/
  "orders.decQtyByKey": requireLoginMethod(async function (
    orderId: IdType,
    key: string,
  ) {
    check(orderId, String);
    check(key, String);

    const order = await OrdersCollection.findOneAsync(orderId);
    if (!order) throw new Meteor.Error("order-not-found", "Order not found");

    const idx = (order.menuItems ?? []).findIndex((it: any) =>
      sameKey(it, key),
    );
    if (idx < 0)
      throw new Meteor.Error("item-not-found", "Order item not found");

    const curQty = order.menuItems[idx]?.quantity ?? 1;

    if (curQty <= 1) {
      await OrdersCollection.updateAsync(orderId, {
        $unset: { [`menuItems.${idx}`]: 1 },
      } as any);
      await OrdersCollection.updateAsync(orderId, {
        $pull: { menuItems: null as any },
      } as any);
    } else {
      await OrdersCollection.updateAsync(orderId, {
        $inc: { [`menuItems.${idx}.quantity`]: -1 },
      } as any);
    }

    await recomputeTotals(orderId);
  }),
});

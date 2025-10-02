import React, { useEffect, useMemo, useState } from "react";
import { useSubscribe, useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";
import {
  Dialog as MuiDialog,
  DialogTitle as MuiDialogTitle,
  DialogContent as MuiDialogContent,
  DialogActions as MuiDialogActions,
  List as MuiList,
  ListItem as MuiListItem,
  //   ListItemText as MuiListItemText,
  Typography as MuiTypography,
  Button as MuiButton,
  Divider as MuiDivider,
  FormControlLabel,
  Radio,
  RadioGroup,
  Checkbox,
  Chip,
  Box,
} from "@mui/material";

import { MenuItemsCollection } from "/imports/api/menuItems/MenuItemsCollection";
import { MenuItem } from "/imports/api";
import { OrderMenuItem } from "/imports/api/orders/OrdersCollection";

type BaseIngredient = {
  key: string;
  label: string;
  default: boolean;
  removable?: boolean;
  priceDelta?: number;
};

type Option = {
  key: string;
  label: string;
  priceDelta?: number;
  default?: boolean;
};

type OptionGroup = {
  id: string;
  label: string;
  type: "single" | "multiple";
  required?: boolean;
  options: Option[];
};

type CanonicalMenuItem = MenuItem & {
  baseIngredients?: BaseIngredient[];
  optionGroups?: OptionGroup[];
};

type Props = {
  open: boolean;
  item: (MenuItem | OrderMenuItem) | null;
  orderId?: string;
  itemIndex?: number;
  locked?: boolean;
  onClose: () => void;
};

const Money: React.FC<{ delta?: number }> = ({ delta }) => {
  if (typeof delta !== "number" || delta === 0) return null;
  const sign = delta > 0 ? "+" : "";
  return (
    <Chip
      variant="outlined"
      size="small"
      label={`${sign}$${Math.abs(delta).toFixed(2)}`}
      sx={{ ml: 1 }}
    />
  );
};

const MenuItemIngredientsDialog: React.FC<Props> = ({
  open,
  item,
  orderId,
  itemIndex,
  locked = false,
  onClose,
}) => {
  // Use the function signature for useSubscribe to ensure stability
  const isLoading = useSubscribe("menuItems")();

  // Fetch the canonical MenuItem from the database
  const canonical = useTracker<CanonicalMenuItem | null>(() => {
    if (isLoading || !item?.name) return null;
    return (
      (MenuItemsCollection.findOne({ name: item.name }) as CanonicalMenuItem) ??
      null
    );
  }, [isLoading, item?.name]);

  const baseIngredients = useMemo(
    () => (canonical?.baseIngredients ?? []) as BaseIngredient[],
    [canonical?._id],
  );
  const optionGroups = useMemo(
    () => (canonical?.optionGroups ?? []) as OptionGroup[],
    [canonical?._id],
  );

  const hasNew = baseIngredients.length > 0 || optionGroups.length > 0;

  // State for managing selections
  const [includedBase, setIncludedBase] = useState<Record<string, boolean>>({});
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string | Set<string>>
  >({});
  const savedBaseKeys = (item as OrderMenuItem)?.baseIncludedKeys; // undefined | string[]
  const hasSavedBase = Array.isArray(savedBaseKeys);

  // 2) Initialization effect: Only when the document changes or the dialog opens
  useEffect(() => {
    if (!open || !canonical?._id) return;

    const baseInit: Record<string, boolean> = {};
    baseIngredients.forEach((b) => {
      if (b.removable === false) {
        baseInit[b.key] = true;
      } else if (hasSavedBase) {
        baseInit[b.key] = (savedBaseKeys as string[]).includes(b.key);
      } else {
        baseInit[b.key] = !!b.default;
      }
    });

    const optInit: Record<string, string | Set<string>> = {};
    optionGroups.forEach((g) => {
      const defaults = g.options.filter((o) => o.default).map((o) => o.key);
      const saved = (item as OrderMenuItem)?.optionSelections?.[g.id];

      if (g.type === "single") {
        const savedOne = Array.isArray(saved) ? saved[0] : undefined;
        optInit[g.id] =
          savedOne ??
          defaults[0] ??
          (g.required && g.options[0] ? g.options[0].key : "");
      } else {
        const savedMany = Array.isArray(saved) ? saved : undefined;
        optInit[g.id] = new Set(savedMany ?? defaults);
      }
    });

    setIncludedBase(baseInit);
    setSelectedOptions(optInit);
    // 3) Only set state when the value actually changes (prevent unnecessary renders)
    // setIncludedBase(prev => {
    //   const sameLen = Object.keys(prev).length === Object.keys(baseInit).length;
    //   const same =
    //     sameLen && Object.keys(baseInit).every(k => prev[k] === baseInit[k]);
    //   return same ? prev : baseInit;
    // });

    // setSelectedOptions(prev => {
    //   const keysA = Object.keys(prev);
    //   const keysB = Object.keys(optInit);
    //   const sameLen = keysA.length === keysB.length;
    //   const same =
    //     sameLen &&
    //     keysB.every(k => {
    //       const a = optInit[k], b = prev[k];
    //       if (a instanceof Set && b instanceof Set) {
    //         if (a.size !== b.size) return false;
    //         for (const v of a) if (!b.has(v)) return false;
    //         return true;
    //       }
    //       return a === b;
    //     });
    //   return same ? prev : optInit;
    // });
  }, [open, canonical?._id, itemIndex]);

  // Group options by base ingredient key
  const groupsByBaseKey = useMemo(() => {
    const map: Record<string, OptionGroup[]> = {};
    const baseKeys = new Set(baseIngredients.map((b) => b.key));
    optionGroups.forEach((g) => {
      const baseKey = g.id.split("-")[0];
      if (baseKeys.has(baseKey)) {
        (map[baseKey] ||= []).push(g);
      } else {
        (map["_ungrouped"] ||= []).push(g);
      }
    });
    return map;
  }, [baseIngredients, optionGroups]);

  const buildSelections = (): Record<string, string[]> => {
    const sel: Record<string, string[]> = {};
    for (const g of optionGroups) {
      const v = selectedOptions[g.id];
      sel[g.id] =
        g.type === "single"
          ? typeof v === "string" && v
            ? [v]
            : []
          : Array.from((v as Set<string>) ?? []);
    }
    return sel;
  };

  const [saving, setSaving] = useState(false);

  const buildBaseIncludedKeys = (): string[] => {
    return baseIngredients
      .filter((b) => (b.removable === false ? true : !!includedBase[b.key]))
      .map((b) => b.key);
  };

  const handleSave = () => {
    if (!orderId || itemIndex == null || locked) {
      onClose();
      return;
    }
    setSaving(true);

    const selections = buildSelections();
    const baseIncludedKeys = buildBaseIncludedKeys();

    Meteor.call(
      "orders.updateMenuItemSelections",
      orderId,
      itemIndex,
      selections,
      baseIncludedKeys,
      (err: any) => {
        setSaving(false);
        if (err) {
          console.error(err);
          alert("Failed to save options.");
          return;
        }
        onClose();
      },
    );
  };

  // Handlers
  const toggleBase = (b: BaseIngredient) => {
    if (b.removable === false) return;
    setIncludedBase((prev) => ({ ...prev, [b.key]: !prev[b.key] }));
  };

  const handleSingleChange = (groupId: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [groupId]: value }));
  };

  const handleMultiToggle = (groupId: string, key: string) => {
    setSelectedOptions((prev) => {
      const cur = prev[groupId] as Set<string>;
      const next = new Set(cur ?? []);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return { ...prev, [groupId]: next };
    });
  };

  // Calculate total price delta
  const totalDelta = useMemo(() => {
    let sum = 0;
    baseIngredients.forEach((b) => {
      if (includedBase[b.key] && typeof b.priceDelta === "number") {
        sum += b.priceDelta;
      }
    });
    optionGroups.forEach((g) => {
      if (g.type === "single") {
        const sel = selectedOptions[g.id] as string;
        const opt = g.options.find((o) => o.key === sel);
        if (opt?.priceDelta) sum += opt.priceDelta;
      } else {
        const set = selectedOptions[g.id] as Set<string>;
        (set ? Array.from(set) : []).forEach((k) => {
          const opt = g.options.find((o) => o.key === k);
          if (opt?.priceDelta) sum += opt.priceDelta;
        });
      }
    });
    return sum;
  }, [baseIngredients, optionGroups, includedBase, selectedOptions]);

  return (
    <MuiDialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <MuiDialogTitle>{item?.name ?? "Ingredients"}</MuiDialogTitle>
      <MuiDialogContent dividers>
        {isLoading ? (
          <MuiTypography variant="body2" color="text.secondary">
            Loading…
          </MuiTypography>
        ) : hasNew ? (
          <>
            {/* Base Ingredients */}
            {baseIngredients.map((b) => (
              <Box key={b.key}>
                <MuiListItem disableGutters>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!includedBase[b.key]}
                        onChange={() => toggleBase(b)}
                        disabled={b.removable === false}
                        size="small"
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <MuiTypography variant="body2">{b.label}</MuiTypography>
                        <Money delta={b.priceDelta} />
                      </Box>
                    }
                  />
                </MuiListItem>
                {/* Nested options */}
                {(groupsByBaseKey[b.key] || []).map((g) => (
                  <Box key={g.id} sx={{ pl: 4 }}>
                    <MuiTypography variant="body2" sx={{ fontWeight: 600 }}>
                      {g.label}
                    </MuiTypography>
                    {g.type === "single" ? (
                      <RadioGroup
                        value={(selectedOptions[g.id] as string) ?? ""}
                        onChange={(e) =>
                          handleSingleChange(g.id, e.target.value)
                        }
                      >
                        {g.options.map((o) => (
                          <FormControlLabel
                            key={o.key}
                            value={o.key}
                            control={<Radio size="small" />}
                            label={
                              <Box display="flex" alignItems="center">
                                <MuiTypography variant="body2">
                                  {o.label}
                                </MuiTypography>
                                <Money delta={o.priceDelta} />
                              </Box>
                            }
                          />
                        ))}
                      </RadioGroup>
                    ) : (
                      <MuiList dense>
                        {g.options.map((o) => (
                          <MuiListItem key={o.key} disableGutters>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={(
                                    (selectedOptions[g.id] as Set<string>) ??
                                    new Set()
                                  ).has(o.key)}
                                  onChange={() =>
                                    handleMultiToggle(g.id, o.key)
                                  }
                                  size="small"
                                />
                              }
                              label={
                                <Box display="flex" alignItems="center">
                                  <MuiTypography variant="body2">
                                    {o.label}
                                  </MuiTypography>
                                  <Money delta={o.priceDelta} />
                                </Box>
                              }
                            />
                          </MuiListItem>
                        ))}
                      </MuiList>
                    )}
                  </Box>
                ))}
              </Box>
            ))}
            {/* Total price delta */}
            <MuiDivider sx={{ my: 2 }} />
            <Box display="flex" justifyContent="space-between">
              <MuiTypography variant="body2">Options subtotal</MuiTypography>
              <MuiTypography variant="body2" fontWeight="bold">
                {totalDelta >= 0 ? "+" : "-"}${Math.abs(totalDelta).toFixed(2)}
              </MuiTypography>
            </Box>
          </>
        ) : (
          <MuiTypography variant="body2" color="text.secondary">
            No ingredients listed.
          </MuiTypography>
        )}
      </MuiDialogContent>
      <MuiDialogActions>
        <MuiButton onClick={onClose} variant="outlined">
          Close
        </MuiButton>
        <MuiButton
          onClick={handleSave}
          variant="contained"
          disabled={saving || locked}
        >
          Save
        </MuiButton>
      </MuiDialogActions>
    </MuiDialog>
  );
};

export default MenuItemIngredientsDialog;

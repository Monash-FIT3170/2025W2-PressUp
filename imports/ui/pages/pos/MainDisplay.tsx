import { MenuItemsCollection, OrdersCollection } from "/imports/api";
import { TablesCollection } from "/imports/api";
import { PosItemCard } from "../../components/PosItemCard";
import { useTracker, useSubscribe } from "meteor/react-meteor-data";
import { PosSideMenu } from "../../components/PosSideMenu";
import { Meteor } from "meteor/meteor";
import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import {
  Order,
  OrderStatus,
  OrderMenuItem,
} from "/imports/api/orders/OrdersCollection";
import { MenuItem } from "/imports/api/menuItems/MenuItemsCollection";
import { IdType } from "/imports/api/database";

export const MainDisplay = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("POS System - Orders");
  }, [setPageTitle]);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  useSubscribe("menuItems");
  useSubscribe("orders");
  useSubscribe("tables");

  const tables = useTracker(() => TablesCollection.find().fetch());
  const orders = useTracker(() => OrdersCollection.find().fetch());
  const posItems = useTracker(() => MenuItemsCollection.find().fetch());
  // Fetch the current order for the selected table
  const order = useTracker(
    () =>
      selectedTable
        ? OrdersCollection.find({ tableNo: selectedTable }).fetch()[0]
        : null,
    [selectedTable],
  );

  const filteredItems = posItems.filter((item) => {
    const matchesName = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategories.length === 0 ||
      (item.category &&
        item.category.some((cat) => selectedCategories.includes(cat)));
    const isAvailable = item.available === true;
    return matchesName && matchesCategory && isAvailable;
  });

  useEffect(() => {
    if (selectedTable !== null) return; // Only set on initial load

    if (orders.length > 0) {
      // Find the unpaid order with the lowest table number
      const unpaidOrders = orders.filter((ord) => !ord.paid);
      if (unpaidOrders.length > 0) {
        const lowestUnpaidTableNo = Math.min(
          ...unpaidOrders.map((o) => o.tableNo),
        );
        setSelectedTable(lowestUnpaidTableNo);
        return;
      }
    }
  }, [tables, orders, selectedTable]);

  // Update order status (accept partial updates)
  const updateOrderInDb = (updatedFields: Partial<Order>) => {
    if (!order || !order._id) return;
    // Always include discount fields if present
    const discountFields = {
      discountPercent: order.discountPercent ?? 0,
      discountAmount: order.discountAmount ?? 0,
      originalPrice: order.originalPrice ?? order.totalPrice ?? 0,
    };
    Meteor.call("orders.updateOrder", order._id, {
      ...discountFields,
      ...updatedFields,
    });
  };

  const handleIncrease = (itemId: IdType) => {
    if (!order) return;
    if (order.isLocked) return; // respect locked state in UI
    const updatedItems = (order.menuItems as OrderMenuItem[]).map((i) =>
      i._id === itemId ? { ...i, quantity: i.quantity + 1 } : i,
    );
    const newTotal = updatedItems.reduce(
      (sum, i) => sum + i.quantity * i.price,
      0,
    );
    // Recalculate discounted total if discount is present
    const dp = order.discountPercent ?? 0;
    const da = order.discountAmount ?? 0;
    let discountedTotal = newTotal;
    if (dp > 0) {
      discountedTotal = newTotal - newTotal * (dp / 100) - da;
    } else if (da > 0) {
      discountedTotal = newTotal - da;
    }
    updateOrderInDb({
      menuItems: updatedItems,
      totalPrice: parseFloat(discountedTotal.toFixed(2)),
      discountPercent: order.discountPercent || 0,
      discountAmount: order.discountAmount || 0,
      originalPrice: parseFloat(newTotal.toFixed(2)),
      orderStatus: OrderStatus.Pending,
    });
  };

  const handleDecrease = (itemId: IdType) => {
    if (!order) return;
    if (order.isLocked) return; // respect locked state in UI
    const updatedItems = (order.menuItems as OrderMenuItem[])
      .map((i) => (i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
      .filter((i) => i.quantity > 0);
    const newTotal = updatedItems.reduce(
      (sum, i) => sum + i.quantity * i.price,
      0,
    );
    const dp = order.discountPercent ?? 0;
    const da = order.discountAmount ?? 0;
    let discountedTotal = newTotal;
    if (dp > 0) {
      discountedTotal = newTotal - newTotal * (dp / 100) - da;
    } else if (da > 0) {
      discountedTotal = newTotal - da;
    }
    updateOrderInDb({
      menuItems: updatedItems,
      totalPrice: parseFloat(discountedTotal.toFixed(2)),
      discountPercent: order.discountPercent || 0,
      discountAmount: order.discountAmount || 0,
      originalPrice: parseFloat(newTotal.toFixed(2)),
    });
  };

  const handleDelete = (itemId: IdType) => {
    if (!order) return;
    if (order.isLocked) return; // respect locked state in UI
    const updatedItems = (order.menuItems as OrderMenuItem[]).filter(
      (i) => i._id !== itemId,
    );
    const newTotal = updatedItems.reduce(
      (sum, i) => sum + i.quantity * i.price,
      0,
    );
    const dp = order.discountPercent ?? 0;
    const da = order.discountAmount ?? 0;
    let discountedTotal = newTotal;
    if (dp > 0) {
      discountedTotal = newTotal - newTotal * (dp / 100) - da;
    } else if (da > 0) {
      discountedTotal = newTotal - da;
    }
    updateOrderInDb({
      menuItems: updatedItems,
      totalPrice: parseFloat(discountedTotal.toFixed(2)),
      discountPercent: order.discountPercent || 0,
      discountAmount: order.discountAmount || 0,
      originalPrice: parseFloat(newTotal.toFixed(2)),
    });
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleItemClick = (item: MenuItem) => {
    if (!order) return;
    if (order.isLocked) return; // prevent adding items to locked orders
    const existing = (order.menuItems as OrderMenuItem[]).find(
      (i) => i._id === item._id,
    );
    let updatedItems;
    if (existing) {
      updatedItems = (order.menuItems as OrderMenuItem[]).map((i) =>
        i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i,
      );
    } else {
      // convert MenuItem -> OrderMenuItem shape (keep _id, name, price, ingredients, available, category, image)
      const newOrderItem: OrderMenuItem = {
        _id: item._id,
        name: item.name,
        quantity: 1,
        ingredients: item.ingredients || [],
        available: item.available,
        price: item.price,
        category: item.category,
        image: item.image,
      };
      updatedItems = [...(order.menuItems as OrderMenuItem[]), newOrderItem];
    }
    const newTotal = updatedItems.reduce(
      (sum, i) => sum + i.quantity * i.price,
      0,
    );
    const dp2 = order.discountPercent ?? 0;
    const da2 = order.discountAmount ?? 0;
    let discountedTotal = newTotal;
    if (dp2 > 0) {
      discountedTotal = newTotal - newTotal * (dp2 / 100) - da2;
    } else if (da2 > 0) {
      discountedTotal = newTotal - da2;
    }
    updateOrderInDb({
      menuItems: updatedItems,
      totalPrice: parseFloat(discountedTotal.toFixed(2)),
      discountPercent: order.discountPercent ?? 0,
      discountAmount: order.discountAmount ?? 0,
      originalPrice: parseFloat(newTotal.toFixed(2)),
      orderStatus: OrderStatus.Pending,
    });
  };

  return (
    <div className="flex flex-1 overflow-auto">
      {/* Main Left Section */}
      <div className="flex-1 p-4">
        {/* Search & Filter Section */}
        <div className="mb-4 space-y-2">
          {/* Search Bar */}
          <div id="search-bar">
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[#1e032e]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-5 h-5 text-gray-400 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-sm placeholder-gray-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex space-x-4">
            {["Food", "Drink", "Dessert"].map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-4 py-2 rounded-full font-semibold text-sm transition-colors duration-200 ${
                  selectedCategories.includes(cat)
                    ? "bg-[#6f597b] text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* POS Cards */}
        <div
          id="pos-display"
          className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
        >
          {filteredItems.map((item) => (
            <div className="" key={item._id.toString()}>
              <PosItemCard item={item} onClick={handleItemClick} />
            </div>
          ))}
        </div>
      </div>

      {/* Side Panel */}
      <div id="pos-side-panel" className="p-4">
        <PosSideMenu
          tableNo={order?.tableNo || selectedTable}
          items={order?.menuItems || []}
          total={order?.totalPrice || 0}
          orderId={order?._id}
          onIncrease={handleIncrease}
          onDecrease={handleDecrease}
          onDelete={handleDelete}
          onUpdateOrder={updateOrderInDb}
          selectedTable={selectedTable} // pass down
          setSelectedTable={setSelectedTable} // pass down
        />
      </div>
    </div>
  );
};

import { useEffect } from "react";
import { Outlet } from "react-router";
import { usePageTitle } from "../../hooks/PageTitleContext";
import Sidebar from "../../components/AddItemSidebar";
import { MenuItemsCollection } from "/imports/api";
import { MenuManagementCard } from "../../components/MenuManagmentCards";
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

export const Menu = () => {
  // Set title
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Menu Management System");
  }, [setPageTitle]);

  // Subscribe to menu items
  const isLoadingPosItems = useSubscribe("menuItems");
  const posItems = useTracker(() => MenuItemsCollection.find().fetch());

  const handleItemClick = (itemId) => {
    // You might want different behavior in the menu management system
    // For now, we'll just use the same function as in MainDisplay
    Meteor.call("menuItems.updateQuantity", itemId, 1);
  };

  return (
    <div id="pos" className="flex flex-1 overflow-auto">
      {/* Main content area */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posItems.map((item) => (
            <div key={item._id} className="min-w-[160px]">
              <MenuManagementCard item={item} onClick={handleItemClick} />
            </div>
          ))}
        </div>
        
        <Outlet />
      </div>
      
      {/* Sidebar positioned on the right */}
      <Sidebar />
    </div>
  );
};
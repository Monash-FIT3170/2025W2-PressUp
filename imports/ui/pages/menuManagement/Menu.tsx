import { useState, useEffect } from "react";
import { Outlet } from "react-router";
import { usePageTitle } from "../../hooks/PageTitleContext";
import Sidebar from "../../components/AddItemSidebar";
import { MenuItemsCollection } from "/imports/api";
import { MenuManagementCard } from "../../components/MenuManagmentCards";
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { MenuItem } from "/imports/api/menuItems/MenuItemsCollection";
import { EditItemModal } from "../../components/EditItemModal";

export const Menu = () => {
  // Set title
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Menu Management System");
  }, [setPageTitle]);

  // Subscribe to menu items
  const isLoadingPosItems = useSubscribe("menuItems");
  const posItems:MenuItem[] = useTracker(() => MenuItemsCollection.find().fetch());

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  const handleItemClick = (item: MenuItem) => {
    Meteor.call("menuItems.updateQuantity", item._id , 1);
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  return (
    <div id="pos" className="flex flex-1 overflow-auto">
      {/* Main content area */}
      <div className="flex-1 overflow-auto p-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {posItems.map((item) => (
            <div 
            key={item._id?.toString()} 
            className={`"min-w-[160px] rounded-lg transition duration-150
            ${selectedItem?._id === item._id ? "ring-2 ring-rose-500 bg-rose-50" : ""}
            w-full
            h-full
            p-4
            `}
            >
              <MenuManagementCard item={item} onClick={handleItemClick} />
            </div>
          ))}
        </div>
        
         <EditItemModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedItem(null);
        }}
        item={selectedItem}
        onSave={handleSave}
      />

        <Outlet />
      </div>
      
      {/* Sidebar positioned on the right */}
      <Sidebar />
    </div>
  );
};

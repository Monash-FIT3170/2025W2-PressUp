import React, { useEffect, useState } from 'react';
import { Meteor } from "meteor/meteor";
import Sidebar from "../../components/AddItemSidebar";
import { MenuItem } from '/imports/api/MenuItemsCollection';

export const MenuPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    Meteor.call('menuItems.getAll', (error: Meteor.Error | null, result: MenuItem[]) => {
      if (error) {
        console.error('Error fetching menu items:', error);
      } else {
        setMenuItems(result);
      }
    });
  }, []);


  return (
  <>
    <header className="header"></header>
    <main className="main" style={{ display: "flex", justifyContent: "flex-end" }}>
      <div>
        <Sidebar />
      </div>
    </main>
  </>
);
}
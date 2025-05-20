import { MenuItemsCollection } from "/imports/api";
import { PosItemCard } from "../../components/PosItemCard";
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { PosSideMenu } from "../../components/PosSideMenu";
import { Meteor } from 'meteor/meteor';
import { useState } from "react";

export const MainDisplay = () => {
    const isLoadingPosItems = useSubscribe("menuItems")
    const posItems = useTracker( () => MenuItemsCollection.find().fetch());

    // Current order, hard coded table number at the moment
    const [order, setOrder] = useState({
      menuItems: [],
      totalPrice: 0,
      tableNo: 1,
    });

    const handleItemClick = (item) => {

      const existing = order.menuItems.find((i) => i._id === item._id);
      let updatedItems;

      // If item is already in order, increment quantity, otherwise add normally
      if (existing) {
        updatedItems = order.menuItems.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updatedItems = [...order.menuItems, { ...item, quantity: 1 }];
      }

      // Calculate total price of order
      const newTotal = updatedItems.reduce(
        (sum, i) => sum + i.quantity * i.price,
        0
      );

      // Update order status
      setOrder({
        ...order,
        menuItems: updatedItems,
        totalPrice: parseFloat(newTotal.toFixed(2)),
      });
    };

  return (  
    <div className="grid grid-cols-5 sm:grid-cols-2 md:grid-cols-5 gap-4 p-4 items-start overflow-auto">
      <div id="pos-main-display" className="col-span-4">
        <div id="pos-display" className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {posItems.map((item) => (
              <div className="min-w-[160px]" key={item._id.toString()}>
                <PosItemCard item={item} onClick={handleItemClick} />
              </div>
            ))}
          
          </div>
      </div>
      <div id="pos-side-panel" className="col-span-1 ">
        <PosSideMenu items={order.menuItems} total={order.totalPrice}></PosSideMenu>
      </div>
    </div>
    
  );
};

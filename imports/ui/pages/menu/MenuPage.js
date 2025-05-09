import { MenuItem, MenuItemsCollection } from "../../../api/MenuItemsCollection";
import { PosItemCard } from "../../components/PosItemCard";
import { Meteor } from 'meteor/meteor';
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { useEffect } from "react";

export const MenuPage = () => {
  const isLoadingPosItems = useSubscribe("menuItems")
      const items = useTracker( () => MenuItemsCollection.find().fetch());

  // useEffect(() => {
  //   Meteor.call('menuItems.getAll', (error: Meteor.Error | null, result: MenuItem[]) => {
  //     if (error) {
  //       console.error('Error fetching menu items:', error);
  //     } else {
  //       setMenuItems(result);
  //     }
  //   });
  // }, []);

   const handleItemClick = (itemId) => {
        Meteor.call("menuItems.updateQuantity", itemId, 1);
      };


  return (
  <>
    <header className="header"></header>
    <main className="main" style={{ display: "flex", justifyContent: "flex-end" }}>
      <div id="pos-display" className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {items.map((item) => (
              <div className="min-w-[160px]">
                <PosItemCard item={item} onClick={handleItemClick} />
              </div>
            ))}
          
          </div>
    </main>
  </>
);
}

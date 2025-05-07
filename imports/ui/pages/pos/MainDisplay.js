import { MenuItem, MenuItemsCollection } from "../../../api/MenuItemsCollection";
import { PosItemCard } from "../../components/PosItemCard";
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { PosSideMenu } from "../../components/PosSideMenu";
import { Meteor } from 'meteor/meteor';

export const MainDisplay = () => {
    const isLoadingPosItems = useSubscribe("menuItems")
    const posItems = useTracker( () => MenuItemsCollection.find().fetch());

    console.log(posItems)

    const handleItemClick = (itemId) => {
      Meteor.call("menuItems.updateQuantity", itemId, 1);
    };

  return (  
    <div className="grid grid-cols-5 sm:grid-cols-2 md:grid-cols-5 gap-4 p-4 items-start overflow-auto">
      <div id="pos-main-display" className="col-span-4">
        <div id="pos-display" className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
            {posItems.map((item) => (
              <div className="min-w-[160px]">
                <PosItemCard item={item} onClick={handleItemClick} />
              </div>
            ))}
          
          </div>
      </div>
      <div id="pos-side-panel" className="col-span-1 ">
        <PosSideMenu items={posItems}></PosSideMenu>
      </div>
    </div>
    
  );
};
import { MenuItem, MenuItemsCollection } from "../../../api/MenuItemsCollection";
import { PosItemCard } from "../../components/PosItemCard";
import { useTracker, useSubscribe } from 'meteor/react-meteor-data';
import { PosSideMenu } from "../../components/PosSideMenuCard";

export const MainDisplay = () => {
    const isLoadingPosItems = useSubscribe("menuItems")
    const posItems = useTracker( () => MenuItemsCollection.find().fetch());

    console.log(posItems)

    const handleItemClick = (item) => {
      item.quantity += 1; // 
      alert(`Selected Menu: ${item.name} ($${item.price.toFixed(2)}) - Quantity: ${item.quantity}`);
  };

  return (
    <div id="pos-display" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 items-start">
      {posItems.map((item) => (
        <div className="min-w-[160px]">
          <PosItemCard item={item} onClick={handleItemClick} />
        </div>
      ))}
    </div>
    
  );
};
import { mainPosItems, MenuItem } from "../../../api/MenuItemsCollection";
import { PosItemCard } from "../../components/PosItemCard";


export const MainDisplay = () => {
    const posItems: MenuItem[] = mainPosItems(9); 

    const handleItemClick = (item: MenuItem) => {
      item.amount += 1; // 
      alert(`Selected Menu: ${item.name} ($${item.price.toFixed(2)}) - Quantity: ${item.amount}`);
  };

  return (
    <div id="pos-display" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 items-start">
      {posItems.map((item) => (
        <div className="min-w-[160px]" key={item._id}>
          <PosItemCard item={item} onClick={handleItemClick} />
        </div>
      ))}
    </div>
  );
};
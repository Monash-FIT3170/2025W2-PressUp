import { mainPosItems, PosItem } from "/imports/api/pos_items";
import { PosItemCard } from "../../components/PosItemCard";


export const MainDisplay = () => {
    const posItems: PosItem[] = mainPosItems(9); 

    const handleItemClick = (item: PosItem) => {
      alert(`Selected Menu: ${item.name} ($${item.price.toFixed(2)})`);
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

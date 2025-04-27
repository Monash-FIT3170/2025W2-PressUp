import { mainPosItems, PosItem } from "/imports/api/pos_items";
import { PosItemCard } from "../../components/PosItemCard";

export const MainDisplay = () => {
    const posItems: PosItem[] = mainPosItems(9); 

    return (
      <div id="pos-display" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 items-start">
        {posItems.map((item) => (
          <PosItemCard key={item._id} item={item} />
        ))}
      </div>
    );
};

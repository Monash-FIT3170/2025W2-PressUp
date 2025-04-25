import { mainPosItems, PosItem } from "/imports/api/pos_items";
import { PosItemCard } from "../../components/PosItemCard";

export const MainDisplay = () => {
    const posItems: PosItem[] = mainPosItems(12); 

    return (
      <div id="pos-display" className="grid grid-cols-3 gap-4 p-4">
        {posItems.map((item) => (
          <PosItemCard key={item._id} item={item} />
        ))}
      </div>
    );
};

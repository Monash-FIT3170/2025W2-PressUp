import { Receipt } from "../../components/Receipt";

export const ReceiptPage = () => {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-auto">
        <Receipt></Receipt>
      </div>
    </div>
  );
};

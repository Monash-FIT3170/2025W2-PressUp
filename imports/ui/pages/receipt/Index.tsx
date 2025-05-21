import { Outlet } from "react-router";

export const ReceiptIndex = () => {
  return (
    <div id="inventory" className="flex flex-1">
      <Outlet />
    </div>
  );
};

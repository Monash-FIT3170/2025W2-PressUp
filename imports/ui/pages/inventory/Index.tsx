import { Outlet } from "react-router";

export const InventoryIndex = () => {
  return (
    <div id="inventory" className="flex flex-1">
      <Outlet />
    </div>
  );
};

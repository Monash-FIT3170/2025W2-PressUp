import { Outlet } from "react-router";

export const MenuIndex = () => {
  return (
    <div id="pos" className="flex flex-1 overflow-auto">
      <Outlet />
    </div>
  );
};
import { Outlet } from "react-router";

export const PosIndex = () => {
  return (
    <div id="pos" className="flex flex-1">
      <Outlet />
    </div>
  );
};
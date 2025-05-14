import { useEffect } from "react";
import { Outlet } from "react-router";
import { usePageTitle } from "../../hooks/PageTitleContext";
import Sidebar from "../../components/AddItemSidebar";

export const Menu = () => {
  // Set title
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Menu Management System");
  }, [setPageTitle]);

  return (
    <div id="pos" className="flex flex-1 overflow-auto">
      {/* Add the Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};
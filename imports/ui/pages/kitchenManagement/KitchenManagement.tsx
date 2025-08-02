import { useState, useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import Sidebar from "../../components/AddItemSidebar";

export const Menu = () => {
  // Set title
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Kitchen Management");
  }, [setPageTitle]);

 
  return (
    <div className="flex flex-1 overflow-auto">
      {/* Sidebar positioned on the right */}
      <Sidebar />
    </div>
  );
};

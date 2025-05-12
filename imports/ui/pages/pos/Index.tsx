import { useEffect } from "react";
import { Outlet } from "react-router";
import { usePageTitle } from "../../hooks/PageTitleContext";

export const PosIndex = () => {
  // Set title
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("POS System");
  }, [setPageTitle]);

  return (
    <div id="pos" className="flex flex-1 overflow-auto">
      <Outlet />
    </div>
  );
};

import { useEffect } from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";

export const TrainingPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Staff Management - Training");
  }, [setPageTitle]);
  return <div className="w-full"></div>;
};

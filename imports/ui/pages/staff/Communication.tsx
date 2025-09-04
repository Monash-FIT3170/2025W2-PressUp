import { useEffect } from "react";
import ForumPage from "../../components/ForumPage";
import { usePageTitle } from "../../hooks/PageTitleContext";

export const CommunicationPage = () => {
  const [_, setPageTitle] = usePageTitle();
  useEffect(() => {
    setPageTitle("Staff Management - Forum");
  }, [setPageTitle]);
  return (
    <div className="w-full">
      <ForumPage></ForumPage>
    </div>
  );
};

import { Outlet } from "react-router";

// TODO: Global nav could live here
export const RootPage = () => (
  <>
    <div>Nav</div>
    <Outlet />
  </>
);

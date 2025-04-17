import { Outlet } from "react-router";

// TODO: Global Nav
export const RootPage = () => (
  <>
    <header className="header">Nav</header>
    <main className="main">
      <Outlet />
    </main>
  </>
);

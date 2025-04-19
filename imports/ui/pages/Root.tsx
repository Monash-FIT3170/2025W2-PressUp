import { Outlet } from "react-router";
import NavBar from "../components/NavBar";

// TODO: Global Nav
export const RootPage = () => (
  <>
    <header className="header">
      <NavBar/>
    </header>
    <main className="main">
      <Outlet />
    </main>
  </>
);

import { Outlet } from "react-router";
import NavBar from "../components/NavBar";

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

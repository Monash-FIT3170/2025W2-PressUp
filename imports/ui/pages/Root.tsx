import { Outlet } from "react-router";
import NavBar from "../components/NavBar";

export const RootPage = () => (
  <>
    <nav className="nav">
      <NavBar/>
    </nav>
    <main className="main">
      <Outlet />
    </main>
  </>
);

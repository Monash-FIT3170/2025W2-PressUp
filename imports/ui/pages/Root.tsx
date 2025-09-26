import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { Header } from "../components/navigation/Header";
import { NavigationMenu } from "../components/navigation/NavigationMenu";
import { PageTitleProvider } from "../hooks/PageTitleContext";
import { Meteor } from "meteor/meteor";

export const RootPage = () => {
  const [menuOpen, setMenuOpen] = useState(true);
  const location = useLocation();

  // Logged in check
  if (Meteor.userId() === null)
    return <Navigate replace to={"/login"} state={{ from: location }} />;

  return (
    <PageTitleProvider>
      <header>
        <Header onHamburgerClick={() => setMenuOpen(!menuOpen)} />
      </header>
      <div className="flex-1 flex flex-row overflow-hidden">
        <nav>
          <NavigationMenu show={menuOpen} />
        </nav>
        <main className="flex flex-1 flex-col ps-8 pt-4">
          <Outlet />
        </main>
      </div>
    </PageTitleProvider>
  );
};

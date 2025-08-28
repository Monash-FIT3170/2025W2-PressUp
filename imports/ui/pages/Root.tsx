import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { Header } from "../components/Header";
import { NavigationMenu } from "../components/NavigationMenu";
import { PageTitleProvider } from "../hooks/PageTitleContext";
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

export const RootPage = () => {
  const [menuOpen, setMenuOpen] = useState(true);
  const location = useLocation();

  const loggingIn = useTracker(() => Meteor.loggingIn());
  const userId = useTracker(() => Meteor.userId());
  if (loggingIn) return null; //
  if (userId === null)
    return <Navigate replace to={"/login"} state={{ from: location }} />;

  return (
    <PageTitleProvider>
      <header>
        <Header onHamburgerClick={() => setMenuOpen(!menuOpen)} />
      </header>
      <div className="flex-1 flex flex-rows overflow-hidden">
        <nav>
          <NavigationMenu show={menuOpen} />
        </nav>
        <main className="flex flex-1 ps-8 pt-4">
          <Outlet />
        </main>
      </div>
    </PageTitleProvider>
  );
};

import { useState } from "react";
import { Outlet } from "react-router";
import { Header } from "../components/Header";
import { NavigationMenu } from "../components/NavigationMenu";
import { PageTitleProvider } from "../hooks/PageTitleContext";

export const RootPage = () => {
  const [menuOpen, setMenuOpen] = useState(true);

  return (
    <PageTitleProvider>
      <header>
        <Header
          onHamburgerClick={() => setMenuOpen(!menuOpen)}
        />
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

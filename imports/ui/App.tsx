import { createBrowserRouter, RouterProvider } from "react-router";
import { RootPage } from "./pages/Root";
import { StockPage } from "./pages/inventory/Stock";
import { InventoryIndex } from "./pages/inventory/Index";
import { MenuPage } from "./pages/menu";

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootPage,
    children: [
      {
        path: "inventory",
        Component: InventoryIndex,
        children: [{ path: "stock", Component: StockPage }],
      },
      {
        path: "menu",
        Component: MenuPage
      },
    ],
  },
]);

export const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
};

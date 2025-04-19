import { createBrowserRouter, RouterProvider } from "react-router";
import { RootPage } from "./pages/Root";
import { StockPage } from "./pages/inventory/Stock";
import { InventoryIndex } from "./pages/inventory/Index";

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

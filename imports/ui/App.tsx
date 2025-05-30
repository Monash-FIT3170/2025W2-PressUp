import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { RootPage } from "./pages/Root";
import { StockPage } from "./pages/inventory/Stock";
import { SuppliersPage } from "./pages/inventory/Suppliers";
import { InventoryIndex } from "./pages/inventory/Index";
import { Menu } from "./pages/menuManagement/Menu";

// pos system
import { MainDisplay } from "./pages/pos/MainDisplay";
import { PosIndex } from "./pages/pos/Index";
import { ReceiptIndex } from "./pages/receipt/Index";
import { ReceiptPage } from "./pages/receipt/Receipt";

const router = createBrowserRouter([
  {
    path: "/",
    Component: RootPage,
    children: [
      {
        path: "inventory",
        children: [
          { index: true, Component: () => <Navigate replace to={"stock"} /> },
          { path: "stock", Component: StockPage },
          { path: "suppliers", Component: SuppliersPage },
        ],
      },
      {
        path: "pos",
        Component: PosIndex,
        children: [{ path: "display", Component: MainDisplay }],
      },
      {
        path: "menuManagement",
        Component: Menu,
      },
      {
        path: "receipt",
        Component: ReceiptIndex,
        children: [{ path: "", Component: ReceiptPage }],
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

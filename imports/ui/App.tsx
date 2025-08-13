import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { RootPage } from "./pages/Root";
import { StockPage } from "./pages/inventory/Stock";
import { SuppliersPage } from "./pages/inventory/Suppliers";
import { Menu } from "./pages/menuManagement/Menu";
import { ProfitLossPage } from "./pages/finance/ProfitLossPage";
import { TaxPage } from "./pages/finance/TaxPage";
import { KitchenManagement } from "./pages/kitchenManagement/KitchenManagement";
// pos system
import { MainDisplay } from "./pages/pos/MainDisplay";
import { TablesPage } from "./pages/pos/Tables";
import { ReceiptIndex } from "./pages/receipt/Index";
import { ReceiptPage } from "./pages/receipt/Receipt";
import { LoginPage } from "./pages/Login";
import { Accounts } from "./pages/accounts/Accounts";

const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: RootPage,
    children: [
      {
        path: "finance",
        children: [
          { index: true, Component: () => <Navigate replace to={"profit-loss"} /> },
          { path: "profit-loss", Component: ProfitLossPage},
          { path: "tax", Component: TaxPage},
        ],
      },
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
        children: [
          { index: true, Component: () => <Navigate replace to={"orders"} /> },
          { path: "orders", Component: MainDisplay },
          { path: "tables", Component: TablesPage }
        ],
      },
      {
        path: "menuManagement",
        Component: Menu,
      },
      {
        path: "kitchenManagement",
        Component: KitchenManagement,
      },
      {
        path: "receipt",
        Component: ReceiptIndex,
        children: [{ path: "", Component: ReceiptPage }],
      },
      {
        path: "accounts",
        Component: Accounts,
      }
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

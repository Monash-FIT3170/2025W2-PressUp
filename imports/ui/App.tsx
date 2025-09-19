import { createBrowserRouter, RouterProvider, Navigate } from "react-router";
import { RootPage } from "./pages/Root";
import { StockPage } from "./pages/inventory/Stock";
import { SuppliersPage } from "./pages/inventory/Suppliers";
import { Menu } from "./pages/menuManagement/Menu";
import { ProfitLossPage } from "./pages/finance/ProfitLossPage";
import { TaxPage } from "./pages/finance/TaxPage";
import { ExpensesPage } from "./pages/finance/ExpensesPage";
import { AnalyticsPage } from "./pages/analytics/Analytics";
import { KitchenManagement } from "./pages/kitchenManagement/KitchenManagement";
import { OrderHistoryPage } from "./pages/kitchenManagement/OrderHistoryPage";
import { MainDisplay } from "./pages/pos/MainDisplay";
import { TablesPage } from "./pages/pos/Tables";
import { ReceiptIndex } from "./pages/receipt/Index";
import { ReceiptPage } from "./pages/receipt/Receipt";
import { LoginPage } from "./pages/Login";
import { UserManagementPage } from "./pages/userManagement/userManagement";
import { RosterPage } from "./pages/staff/Roster";
import { CommunicationPage } from "./pages/staff/Communication";
import { DebugPage } from "./pages/debug/Debug";
import { CompanySettings } from "./pages/company/CompanySettings";
import { GlobalProvider } from "./hooks/GlobalDataContext";

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
          {
            index: true,
            Component: () => <Navigate replace to={"profit-loss"} />,
          },
          { path: "profit-loss", Component: ProfitLossPage },
          { path: "tax", Component: TaxPage },
          { path: "expenses", Component: ExpensesPage },
          { path: "analytics", Component: AnalyticsPage },
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
          { path: "tables", Component: TablesPage },
        ],
      },
      {
        path: "menuManagement",
        Component: Menu,
      },
      {
        path: "kitchenManagement",
        children: [
          { index: true, Component: () => <Navigate replace to={"tickets"} /> },
          { path: "tickets", Component: KitchenManagement },
          { path: "history", Component: OrderHistoryPage },
        ],
      },
      {
        path: "receipt",
        Component: ReceiptIndex,
        children: [{ path: "", Component: ReceiptPage }],
      },
      {
        path: "accounts",
        Component: UserManagementPage,
      },
      {
        path: "staff",
        children: [
          { index: true, Component: () => <Navigate replace to={"roster"} /> },
          { path: "roster", Component: RosterPage },
          { path: "communication", Component: CommunicationPage },
        ],
      },
      {
        path: "company",
        Component: CompanySettings,
      },
      {
        path: "debug",
        Component: DebugPage,
      },
    ],
  },
]);

export const App = () => {
  return (
    <GlobalProvider>
      <RouterProvider router={router} />
    </GlobalProvider>
  );
};

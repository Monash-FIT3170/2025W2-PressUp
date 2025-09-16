import React from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Pill } from "../Pill";
import { ArrowLeft } from "../symbols/navigation/Arrows";
import {
  PencilIcon,
  StockIcon,
  SupplierIcon,
} from "../symbols/navigation/Inventory";
import { MonitorIcon, BookIcon, TableIcon } from "../symbols/navigation/POS";
import { CoffeeIcon } from "../symbols/navigation/Coffee";
import {
  Calendar,
  Clipboard,
  Clock3Icon,
  DollarSign,
  Folder,
  HistoryIcon,
  MessageSquare,
  PenTool,
  ReceiptText,
  Users,
} from "lucide-react";

interface NavigationMenuProps {
  show: boolean;
}

export const NavigationMenu = ({ show }: NavigationMenuProps) => {
  return (
    <div
      className={`bg-press-up-purple min-h-full transition-all ease-in-out duration-300 ${
        show ? "w-[20vw]" : "w-0"
      } overflow-hidden flex flex-col h-60`}
    >
      <div className="flex-1 overflow-y-auto p-6 text-lg">
        <NavigationEntry
          icon={<DollarSign />}
          name="Finance"
          path="/finance"
          selectionType={NavigationEntrySelection.HIGHLIGHT}
        >
          <NavigationEntry
            icon={<Clipboard />}
            name="P/L Reporting"
            path="/finance/profit-loss"
            selectionType={NavigationEntrySelection.ARROW}
          />

          <NavigationEntry
            icon={<PenTool />}
            name="Tax Management"
            path="/finance/tax"
            selectionType={NavigationEntrySelection.ARROW}
          />

          <NavigationEntry
            icon={<Folder />}
            name="Expense Tracking"
            path="/finance/Expenses"
            selectionType={NavigationEntrySelection.ARROW}
          />
        </NavigationEntry>
        <NavigationEntry
          icon={<PencilIcon fill="var(--color-press-up-grey)" />}
          name="Inventory Management"
          path="/inventory"
          selectionType={NavigationEntrySelection.HIGHLIGHT}
        >
          <NavigationEntry
            icon={<StockIcon fill="var(--color-press-up-grey)" />}
            name="Stock"
            path="/inventory/stock"
            selectionType={NavigationEntrySelection.ARROW}
          />

          <NavigationEntry
            icon={<SupplierIcon fill="var(--color-press-up-grey)" />}
            name="Suppliers"
            path="/inventory/suppliers"
            selectionType={NavigationEntrySelection.ARROW}
          />
        </NavigationEntry>

        <NavigationEntry
          icon={<MonitorIcon fill="var(--color-press-up-grey)" />}
          name="POS System"
          path="/pos"
          selectionType={NavigationEntrySelection.HIGHLIGHT}
        >
          <NavigationEntry
            icon={<BookIcon fill="var(--color-press-up-grey)" />}
            name="Orders"
            path="/pos/orders"
            selectionType={NavigationEntrySelection.ARROW}
          />

          <NavigationEntry
            icon={<TableIcon fill="var(--color-press-up-grey)" />}
            name="Tables"
            path="/pos/tables"
            selectionType={NavigationEntrySelection.ARROW}
          />
        </NavigationEntry>

        <NavigationEntry
          icon={<Clock3Icon />}
          name="Kitchen Management"
          path="/kitchenManagement"
          selectionType={NavigationEntrySelection.HIGHLIGHT}
        >
          <NavigationEntry
            icon={<ReceiptText />}
            name="Current Tickets"
            path="/kitchenManagement/tickets"
            selectionType={NavigationEntrySelection.ARROW}
          ></NavigationEntry>
          <NavigationEntry
            icon={<HistoryIcon />}
            name="Order History"
            path="/kitchenManagement/history"
            selectionType={NavigationEntrySelection.ARROW}
          />
        </NavigationEntry>

        <NavigationEntry
          icon={<CoffeeIcon fill="var(--color-press-up-grey)" />}
          name="Menu Management"
          path="/menuManagement"
          selectionType={NavigationEntrySelection.HIGHLIGHT}
        />

        <NavigationEntry
          icon={<SupplierIcon fill="var(--color-press-up-grey)" />}
          name="Accounts"
          path="/accounts"
          selectionType={NavigationEntrySelection.HIGHLIGHT}
        />
        <NavigationEntry
          icon={<Users />}
          name="Staff Management"
          path="/staff"
          selectionType={NavigationEntrySelection.HIGHLIGHT}
        >
          <NavigationEntry
            icon={<Calendar />}
            name="Roster"
            path="/staff/roster"
            selectionType={NavigationEntrySelection.ARROW}
          />
          <NavigationEntry
            icon={<MessageSquare />}
            name="Communication"
            path="/staff/communication"
            selectionType={NavigationEntrySelection.ARROW}
          />
        </NavigationEntry>
      </div>
    </div>
  );
};

enum NavigationEntrySelection {
  HIGHLIGHT,
  ARROW,
}

interface NavigationEntryProps {
  children?: React.ReactNode;
  icon: React.ReactNode;
  name: string;
  path: string;
  selectionType: NavigationEntrySelection;
}

const NavigationEntry = ({
  children,
  icon,
  name,
  path,
  selectionType,
}: NavigationEntryProps) => {
  const location = useLocation();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(location.pathname.startsWith(path));
  }, [location, path]);

  const ActiveContent = () => {
    switch (selectionType) {
      case NavigationEntrySelection.ARROW:
        return (
          <div className="items-center flex">
            <div className="ps-3 content-center">{name}</div>
            <ArrowLeft />
          </div>
        );
      case NavigationEntrySelection.HIGHLIGHT:
        return (
          <div className="p-1 content-center">
            <Pill
              bgColour="bg-press-up-grey"
              borderColour="border-press-up-grey"
              textColour="text-press-up-purple"
            >
              {name}
            </Pill>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col text-nowrap truncate">
      <Link to={path}>
        <div className="flex flex-row text-press-up-grey border-b-[0.15em] border-press-up-grey min-w-full items mb-2">
          <div className="flex-0 content-center min-h-[2.3em]">{icon}</div>
          {active ? (
            <ActiveContent />
          ) : (
            <div className="px-3 content-center">{name}</div>
          )}
        </div>
      </Link>
      <div className="grid grid-cols-12 text-[0.8em]">
        {React.Children.map(children, (child, index) => (
          <>
            <div key={`${index}-empty`} />
            <div className="col-span-11" key={`${index}-navelement`}>
              {child}
            </div>
          </>
        ))}
      </div>
    </div>
  );
};

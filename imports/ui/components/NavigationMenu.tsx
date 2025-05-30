import React from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Pill } from "./Pill";
import { ArrowLeft } from "./symbols/navigation/Arrows";
import {
  PencilIcon,
  StockIcon,
  SupplierIcon,
} from "./symbols/navigation/Inventory";
import { MonitorIcon } from "./symbols/navigation/POS";
import { CoffeeIcon } from "./symbols/navigation/Coffee";

interface NavigationMenuProps {
  show: boolean;
}

export const NavigationMenu = ({ show }: NavigationMenuProps) => {
  // NOTE: The shown width of the menu is related to how much the global header title is indented.
  // If you want to change the width here you should also make a change there.
  return (
    <div
      className={`bg-press-up-purple min-h-full transition-all ease-in-out duration-300 ${
        show ? "w-[20vw]" : "w-0"
      } overflow-hidden`}
    >
      <div className="flex flex-col p-6 text-lg">
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
          path="/pos/display"
          selectionType={NavigationEntrySelection.HIGHLIGHT}
        ></NavigationEntry>
        <NavigationEntry
          icon={<CoffeeIcon fill="var(--color-press-up-grey)" />}
          name="Menu Management"
          path="/menuManagement"
          selectionType={NavigationEntrySelection.HIGHLIGHT}
        ></NavigationEntry>
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
  }, [location]);

  const ActiveContent = () => {
    switch (selectionType) {
      case NavigationEntrySelection.ARROW:
        return (
          <>
            <div className="ps-3 content-center">{name}</div>
            <ArrowLeft />
          </>
        );
      case NavigationEntrySelection.HIGHLIGHT:
        return (
          <div className="p-1">
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
          <div className="flex-0 content-center">{icon}</div>
          {active ? <ActiveContent /> : <div className="px-3 content-center">{name}</div>}
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

import React from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Pill } from "./Pill";
import { ArrowLeft } from "./symbols/navigation/Arrows";
import { PencilIcon, StockIcon } from "./symbols/navigation/Inventory";
import { MonitorIcon } from "./symbols/navigation/POS";

interface NavigationMenuProps {
  show: boolean;
}

export const NavigationMenu = ({ show }: NavigationMenuProps) => {
  // NOTE: The shown width of the menu is related to how much the global header title is indented.
  // If you want to change the width here you should also make a change there.
  return (
    <div
      className={`bg-primary min-h-full transition-all ease-in-out duration-300 ${show ? "w-[20vw]" : "w-0"} overflow-hidden`}
    >
      <div className="flex flex-col p-6 text-xl">
        <NavigationEntry
          icon={<PencilIcon fill="var(--color-primary-dark)" />}
          name="Inventory Management"
          path="/inventory"
          selectionType={NavigationEntrySelection.HIGHLIGHT}
        >
          <NavigationEntry
            icon={<StockIcon fill="var(--color-primary-dark)" />}
            name="Stock"
            path="/inventory/stock"
            selectionType={NavigationEntrySelection.ARROW}
          ></NavigationEntry>
        </NavigationEntry>
        <NavigationEntry
          icon={<MonitorIcon fill="var(--color-primary-dark)" />}
          name="POS System"
          path="/pos/display"
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
            {name}
            <ArrowLeft />
          </>
        );
      case NavigationEntrySelection.HIGHLIGHT:
        return (
          <div className="p-1">
            <Pill
              bgColour="bg-primary-dark"
              borderColour="border-primary-dark"
              textColour="text-white"
            >
              {name}
            </Pill>
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col">
      <Link to={path}>
        <div className="flex flex-row text-white border-b-[0.15em] border-primary-dark min-w-full items-center mb-2">
          {icon}
          {active ? <ActiveContent /> : name}
        </div>
      </Link>
      <div className="grid grid-cols-3 text-[0.8em]">
        {React.Children.map(children, (child, index) => (
          <>
            <div key={`${index}-empty`} />
            <div className="col-span-2" key={`${index}-navelement`}>
              {child}
            </div>
          </>
        ))}
      </div>
    </div>
  );
};

import React from "react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { usePageTitle } from "../hooks/PageTitleContext";
import { Pill } from "./Pill";
import { ArrowLeft } from "./symbols/navigation/Arrows";
import { HamburgerMenuIcon } from "./symbols/navigation/HamburgerMenu";
import { Logo } from "./symbols/Logo";
import { PencilIcon, StockIcon } from "./symbols/navigation/Inventory";

interface HeaderProps {
  onHamburgerClick: () => void;
}

export const Header = ({ onHamburgerClick }: HeaderProps) => {
  const [title] = usePageTitle();

  return (
    <div className="bg-primary min-w-full z-100 sticky grid grid-cols-5 border-b-6 border-primary-dark items-center p-5">
      <div className="col-span-1 flex">
        <div onClick={onHamburgerClick}>
          <HamburgerMenuIcon
            width="72px"
            height="72px"
            fill="var(--color-primary-dark)"
          />
        </div>
      </div>
      <div className="col-span-3 text-white text-4xl">{title ?? "PressUp"}</div>
      <div className="col-span-1 justify-self-end">
        {/* TODO: Login information here */}
        <Logo />
      </div>
    </div>
  );
};

interface NavigationMenuProps {
  show: boolean;
}

export const NavigationMenu = ({ show }: NavigationMenuProps) => {
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

import React from "react";
import { usePageTitle } from "../hooks/PageTitleContext";
import { HamburgerMenuIcon } from "./symbols/navigation/HamburgerMenu";
import { Logo } from "./symbols/Logo";

interface HeaderProps {
  onHamburgerClick: () => void;
}

export const Header = ({ onHamburgerClick }: HeaderProps) => {
  const [title] = usePageTitle();

  return (
    <div className="bg-primary min-w-full z-100 sticky grid grid-cols-5 border-b-6 border-primary-dark items-center p-5">
      {/* NOTE: The col-span here is related to the size of the navigation bar.
       /*  If you want to change it here you should also make a change there */}
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

import React from "react";
import { usePageTitle } from "../../hooks/PageTitleContext";
import { HamburgerMenuIcon } from "../symbols/navigation/HamburgerMenu";
import { Logo } from "../symbols/Logo";
import { UserMenu } from "./UserMenu";

interface HeaderProps {
  onHamburgerClick: () => void;
}

export const Header = ({ onHamburgerClick }: HeaderProps) => {
  const [title] = usePageTitle();

  return (
    <div className="bg-press-up-purple min-w-full z-100 sticky grid grid-cols-5 border-b-6 border-press-up-grey items-center p-5">
      {/* NOTE: The col-span here is related to the size of the navigation bar.
       /*  If you want to change it here you should also make a change there */}
      <div className="col-span-1 flex">
        <div onClick={onHamburgerClick} className="cursor-pointer">
          <HamburgerMenuIcon
            width="72px"
            height="72px"
            fill="var(--color-press-up-grey)"
          />
        </div>
      </div>
      <div className="col-span-3 text-white text-4xl">{title ?? "PressUp"}</div>
      <div className="col-span-1 justify-self-end flex flex-row gap-4">
        <UserMenu />
        <Logo />
      </div>
    </div>
  );
};

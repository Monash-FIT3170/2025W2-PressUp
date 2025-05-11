import { usePageTitle } from "../hooks/PageTitleContext";
import { HamburgerMenuIcon } from "./symbols/HamburgerMenu";
import { Logo } from "./symbols/Logo";

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
      className={`bg-blue-100 min-h-full transition-all ease-in-out duration-300 ${show ? "w-[20vw]" : "w-0"} overflow-hidden`}
    >
      <div className="flex flex-cols"></div>
    </div>
  );
};

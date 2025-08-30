import { UserIcon } from "lucide-react";
import { Hide } from "../display/Hide";
import { useEffect, useRef, useState } from "react";
import { Meteor } from "meteor/meteor";
import { Button } from "../interaction/Button";
import { useNavigate } from "react-router";

export const UserMenu = () => {
  const [showDropDown, setShowDropDown] = useState(false);
  const user = Meteor.user();
  const navigate = useNavigate();
  const onLogout = () => {
    Meteor.logout((error) => {
      if (error) {
        alert(`Failed to logout: ${error.message}`);
        return;
      }

      navigate("/login");
    });
  };

  // Clicking outside of the menu closes the menu
  const dropDownRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (
        dropDownRef.current &&
        event.target instanceof Node &&
        !dropDownRef.current.contains(event.target)
      )
        setShowDropDown(false);
    };

    document.addEventListener("mousedown", clickHandler);

    return () => {
      document.removeEventListener("mousedown", clickHandler);
    };
  }, []);

  return (
    <div>
      <button onClick={() => setShowDropDown(!showDropDown)}>
        <UserIcon color="var(--color-press-up-grey)" size={64} />
      </button>
      <Hide hide={!showDropDown}>
        <div
          ref={dropDownRef}
          className="absolute bg-press-up-purple border-6 border-press-up-grey p-3 flex flex-col gap-2"
        >
          <div className="underline text-press-up-grey max-w-24 truncate">
            {user?.username}
          </div>
          <Button onClick={onLogout}>Logout</Button>
        </div>
      </Hide>
    </div>
  );
};

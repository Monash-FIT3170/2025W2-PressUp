import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { RoleEnum } from "/imports/api/accounts/roles";

interface RoleFilterProps {
  selectedRoles: RoleEnum[];
  onRoleToggle: (role: RoleEnum) => void;
}

export const RoleFilter = ({
  selectedRoles,
  onRoleToggle,
}: RoleFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const roles = [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.CASUAL];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDisplayText = () => {
    if (selectedRoles.length === 0) return "No roles selected";
    if (selectedRoles.length === roles.length) return "All roles";
    if (selectedRoles.length === 1) {
      const role = roles.find((r) => r === selectedRoles[0]);
      return role || "1 role selected";
    }
    return `${selectedRoles.length} roles selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-red-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-red-900 min-w-40"
      >
        <span>{getDisplayText()}</span>
        <ChevronDown
          className={`ml-2 w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg">
          {roles.map((role) => {
            const isSelected = selectedRoles.includes(role);
            return (
              <label
                key={role}
                className="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onRoleToggle(role)}
                  className="mr-3 text-red-900 focus:ring-red-900"
                />
                <span className="text-sm text-red-900">{role}</span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};

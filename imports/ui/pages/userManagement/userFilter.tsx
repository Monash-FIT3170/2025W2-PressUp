import React from "react";

interface UserFilterProps {
  filter: "all" | "managers" | "casual" | "active" | "inactive";
  onFilterChange: (filter: "all" | "managers" | "casual" | "active" | "inactive") => void;
}

export const UserFilter = ({ filter, onFilterChange }: UserFilterProps) => {
  const filterOptions = [
    { value: "all", label: "All Users" },
    { value: "managers", label: "Managers" },
    { value: "casual", label: "Casual Staff" },
    { value: "active", label: "Active Users" },
    { value: "inactive", label: "Inactive Users" },
  ];

  return (
    <div className="flex gap-2">
      {filterOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onFilterChange(option.value as any)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
            filter === option.value
              ? "text-white shadow-lg"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          style={{
            backgroundColor: filter === option.value ? '#6f597b' : undefined,
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};
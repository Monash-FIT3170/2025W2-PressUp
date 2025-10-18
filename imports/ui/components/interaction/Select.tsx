import { clsx } from "clsx";
import React from "react";

type SelectVariant = "default";

const variantColours: Record<SelectVariant, string> = {
  default:
    "bg-white border border-gray-300 text-red-900 focus:ring-red-900 focus:border-red-900 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white",
};

interface SelectProps
  extends Pick<
    React.SelectHTMLAttributes<HTMLSelectElement>,
    "value" | "onChange" | "required" | "multiple" | "disabled" | "name"
  > {
  variant?: SelectVariant;
  placeholder?: string;
  children: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ variant = "default", placeholder, disabled, children, ...rest }, ref) => {
    const hasPlaceholder =
      typeof placeholder === "string" && placeholder.length > 0;

    return (
      <select
        ref={ref}
        disabled={disabled}
        {...rest}
        className={clsx(
          "sm:text-3xl md:text-sm rounded-lg w-full p-3",
          disabled
            ? "bg-gray-100 border border-gray-200 text-gray-500 cursor-not-allowed"
            : variantColours[variant],
        )}
      >
        {hasPlaceholder && (
          <option value="" hidden disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
    );
  },
);
Select.displayName = "Select";

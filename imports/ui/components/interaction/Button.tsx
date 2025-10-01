import clsx from "clsx";
import React from "react";

type ButtonVariant = "positive" | "negative" | "ghost";

const variantColours: Record<ButtonVariant, string> = {
  positive: "bg-press-up-positive-button text-white",
  negative: "bg-press-up-negative-button text-white",
  // New outline/ghost style used in OrderHistoryPage
  ghost:
    "bg-transparent text-press-up-purple border border-press-up-purple hover:bg-press-up-purple/10",
};

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  width?: "full" | "fit";
}

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  (
    {
      variant = "positive",
      width = "fit",
      className,
      children,
      disabled,
      type,
      ...rest
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        type={type ?? "button"} // Avoid accidental form submit
        {...rest}
        className={clsx(
          "text-nowrap shadow-lg/20 hover:shadow-md ease-in-out transition-all duration-300 rounded-xl cursor-pointer inline-flex p-2 grow-0 text-sm font-medium items-center justify-center",
          variantColours[variant],
          width === "full" ? "w-full" : "w-fit",
          disabled && "opacity-50 cursor-not-allowed", // Add disabled styling
          className, // Merge external className
        )}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

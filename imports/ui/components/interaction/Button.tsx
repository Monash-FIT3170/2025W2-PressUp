import clsx from "clsx";
import React from "react";

type ButtonVariant = "positive" | "negative";

const variantColours: Record<ButtonVariant, string> = {
  positive: "bg-press-up-positive-button text-white",
  negative: "bg-press-up-negative-button text-white",
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
          "text-nowrap shadow-lg/20 hover:shadow-md ease-in-out transition-all duration-300 rounded-xl inline-flex p-2 grow-0 text-sm font-medium items-center justify-center",
          variantColours[variant],
          width === "full" ? "w-full" : "w-fit",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className, // Merge external className
        )}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

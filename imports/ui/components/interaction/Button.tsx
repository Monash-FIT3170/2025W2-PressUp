import clsx from "clsx";
import React from "react";

type ButtonVariant = "positive" | "negative";

const variantColours: Record<ButtonVariant, string> = {
  positive: "bg-press-up-positive-button text-white",
  negative: "bg-press-up-negative-button text-white",
};

interface Props
  extends Pick<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "type" | "onClick" | "children" | "disabled"
  > {
  variant?: ButtonVariant;
  width?: "full" | "fit";
}

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  (props, ref) => {
    const {
      variant = "positive",
      width = "fit",
      disabled = false,
      ...rest
    } = props;
    return (
      <button
        ref={ref}
        disabled={disabled}
        {...rest}
        className={clsx(
          "text-nowrap shadow-lg/20 hover:shadow-md ease-in-out transition-all duration-300 rounded-xl cursor-pointer inline-flex p-2 grow-0 text-sm font-medium items-center justify-center",
          variantColours[variant],
          width === "full" ? "w-full" : "w-fit",
          disabled && "opacity-50 cursor-not-allowed hover:shadow-lg/20",
        )}
      />
    );
  },
);

Button.displayName = "Button";

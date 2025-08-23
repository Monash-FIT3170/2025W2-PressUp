import { clsx } from "clsx";
import React from "react";

type InputVaraint = "default" | "navy";

const variantColours: Record<InputVaraint, string> = {
  default:
    "bg-gray-50 border border-gray-300 text-red-900 focus:ring-red-900 focus:border-red-900 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white",
  navy: "bg-press-up-navy border border-press-up-light-purple text-white",
};

interface InputProps
  extends Pick<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "type" | "onChange" | "placeholder" | "autoComplete" | "required"
  > {
  variant?: InputVaraint;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ variant = "default", ...rest }, ref) => {
    return (
      <input
        ref={ref}
        {...rest}
        className={clsx(
          "sm:text-3xl md:text-sm rounded-lg w-full p-3",
          variantColours[variant],
        )}
      />
    );
  },
);

Input.displayName = "Input";

interface LabelProps {
  children: React.ReactNode;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ children }) => {
    return (
      <label className="text-sm mb-2 font-medium text-red-900 dark:text-white">
        {children}
      </label>
    );
  },
);

Label.displayName = "Label";

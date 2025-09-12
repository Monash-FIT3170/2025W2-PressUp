import clsx from "clsx";
import React from "react";

interface TextAreaProps
  extends Pick<
    React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    "value" | "onChange" | "required" | "disabled" | "name" | "autoFocus"
  > {
  variant?: TextAreaVariant;
  placeholder: string;
  rows: number;
}

type TextAreaVariant = "default";

const variantColours: Record<TextAreaVariant, string> = {
  default:
    "bg-gray-50 border border-gray-300 text-red-900 focus:ring-red-900 focus:border-red-900 dark:bg-stone-400 dark:border-stone-500 dark:placeholder-stone-300 dark:text-white",
};

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ variant = "default", placeholder, rows, ...rest }, ref) => {
    return (
      <textarea
        ref={ref}
        {...rest}
        rows={rows}
        placeholder={placeholder}
        className={clsx(
          "sm:text-3xl md:text-sm rounded-lg p-3 w-full whitespace-pre-line",
          variantColours[variant],
        )}
      />
    );
  },
);
TextArea.displayName = "TextArea";

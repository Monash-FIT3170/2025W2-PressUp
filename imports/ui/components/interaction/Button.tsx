import React from "react";

type Props = Pick<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "type" | "onClick" | "children"
>;

// TODO: For now this is just a positive button, can be abstracted further to support our other button types
export const Button = React.forwardRef<HTMLButtonElement, Props>(
  (props, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className="bg-press-up-positive-button text-white w-full py-2.5 rounded-lg font-medium text-sm transition-all hover:opacity-90 hover:shadow-md"
      />
    );
  },
);

Button.displayName = "Button";

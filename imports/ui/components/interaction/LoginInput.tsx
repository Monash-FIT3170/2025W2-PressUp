import React from "react";

type Props = Pick<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "type" | "onChange" | "placeholder" | "autoComplete" | "required"
>;

export const LoginInput = React.forwardRef<HTMLInputElement, Props>(
  (props, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className="bg-press-up-navy border border-press-up-light-purple text-white sm:text-3xl md:text-sm rounded-lg block w-full p-2.5"
      />
    );
  },
);

LoginInput.displayName = "LoginInput";

import React from "react";

interface FormBodyProps
  extends Pick<
    React.FormHTMLAttributes<HTMLFormElement>,
    "children" | "onSubmit"
  > {
  title: string;
}

export const Form = React.forwardRef<HTMLFormElement, FormBodyProps>(
  ({ children, title, onSubmit }: FormBodyProps, ref) => {
    return (
      <div>
        <div className="flex items-center justify-center p-4 w-100 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
          <FormTitle>{title}</FormTitle>
        </div>
        <form className="p-4 flex flex-col" onSubmit={onSubmit} ref={ref}>
          {children}
        </form>
      </div>
    );
  },
);
Form.displayName = "Form";

const FormTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-xl font-semibold text-press-up-purple dark:text-white">
    {children}
  </h3>
);

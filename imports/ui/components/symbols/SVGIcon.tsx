import { ReactNode } from "react";

export interface SVGProps {
  width?: string;
  height?: string;
  fill?: string;
  children?: ReactNode;
}

export const SVGIcon = ({ width, height, fill, children }: SVGProps) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height={height ?? "24px"}
      width={width ?? "24px"}
      viewBox="0 -960 960 960"
      fill={fill ?? "#FFFFFF"}
    >
      {children}
    </svg>
  );
};

import { SizeProp } from "./CommonProps";

const DEFAULT_SIZE = 64;

export const Logo = ({ size }: SizeProp) => {
  return (
    <img
      src="/logo.png"
      alt="PressUp Logo"
      width={size ?? DEFAULT_SIZE}
      height={size ?? DEFAULT_SIZE}
      draggable={false}
    />
  );
};

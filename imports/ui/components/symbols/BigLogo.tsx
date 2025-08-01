import { SizeProp } from "./CommonProps";

const DEFAULT_SIZE = 512;

export const BigLogo = ({ size }: SizeProp) => {
  return (
    <img
      src="/big-logo.png"
      alt="PressUp Logo"
      width={size ?? DEFAULT_SIZE}
      height={size ?? DEFAULT_SIZE}
    />
  );
};

import { SizeProp } from "./CommonProps";

const DEFAULT_SIZE = 16;

export const OutOfStock = ({ size }: SizeProp) => {
  return (
    <img
      src="/out-of-stock.svg"
      alt="Out of Stock Icon"
      width={size ?? DEFAULT_SIZE}
      height={size ?? DEFAULT_SIZE}
      draggable={false}
    />
  );
};

export const LowInStock = ({ size }: SizeProp) => {
  return (
    <img
      src="/low-stock.svg"
      alt="Low in Stock Icon"
      width={size ?? DEFAULT_SIZE}
      height={size ?? DEFAULT_SIZE}
      draggable={false}
    />
  );
};

export const InStock = ({ size }: SizeProp) => {
  return (
    <img
      src="/in-stock.svg"
      alt="In Stock Icon"
      width={size ?? DEFAULT_SIZE}
      height={size ?? DEFAULT_SIZE}
      draggable={false}
    />
  );
};

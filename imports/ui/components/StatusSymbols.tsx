interface SizeProp {
  size?: number;
}

const DEFAULT_SIZE = 16;

export const OutOfStock = ({ size: _size }: SizeProp) => {
  const size = _size ? _size : DEFAULT_SIZE;
  return (
    <img
      src="/out-of-stock.svg"
      alt="Out of Stock Icon"
      width={size}
      height={size}
    />
  );
};

export const LowInStock = ({ size: _size }: SizeProp) => {
  const size = _size ? _size : DEFAULT_SIZE;
  return (
    <img
      src="/low-stock.svg"
      alt="Low in Stock Icon"
      width={size}
      height={size}
    />
  );
};

export const InStock = ({ size: _size }: SizeProp) => {
  const size = _size ? _size : DEFAULT_SIZE;
  return (
    <img src="/in-stock.svg" alt="In Stock Icon" width={size} height={size} />
  );
};

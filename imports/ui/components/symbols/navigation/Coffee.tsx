import { SVGIcon, SVGProps } from "../SVGIcon";

export const CoffeeIcon = (props: SVGProps) => {
  return (
    <SVGIcon
      viewBox="0 0 18 32"
      fill="#a52836"
      height="40px"
      {...props}
    >
      <path d="M14 16.6c-.2 0-.4 0-.56.04v-1.32a.82.82 0 0 0-.84-.84H.8a.82.82 0 0 0-.84.84v4.2c0 3.72 3 6.72 6.72 6.72 2.08 0 3.92-.96 5.16-2.44.64.4 1.36.64 2.12.64 2.16 0 3.92-1.76 3.92-3.92.04-2.16-1.68-3.92-3.88-3.92m-7.32 8c-2.8 0-5.04-2.28-5.04-5.04V16.2h10.12v3.36c-.04 2.76-2.28 5.04-5.08 5.04M14 22.8c-.44 0-.88-.12-1.24-.36.4-.88.64-1.84.64-2.88v-1.2c.2-.04.36-.08.56-.08 1.24 0 2.24 1 2.24 2.24.04 1.28-.92 2.28-2.2 2.28M6.04 10.88c-.28.36-.2.88.16 1.16.16.12.32.16.48.16.24 0 .52-.12.68-.32 1.12-1.52.44-2.68 0-3.36-.4-.64-.52-.84-.04-1.4.28-.36.24-.88-.12-1.16s-.88-.24-1.16.12c-1.2 1.52-.52 2.64-.08 3.36.36.56.52.8.08 1.44" />
    </SVGIcon>
  );
};

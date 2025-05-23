import { SVGIcon, SVGProps } from "./SVGIcon";

export const InfoSymbol = (props: SVGProps) => {
  return (
    <SVGIcon {...props}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </SVGIcon>
  );
};

export const Cross = (props: SVGProps) => {
  return (
    <SVGIcon {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
      />
    </SVGIcon>
  );
};

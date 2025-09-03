import { SVGIcon, SVGProps } from "../SVGIcon";

export const MonitorIcon = (props: SVGProps) => {
  return (
    <SVGIcon {...props}>
      <path d="M320-120v-80h80v-80H160q-33 0-56.5-23.5T80-360v-400q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v400q0 33-23.5 56.5T800-280H560v80h80v80H320ZM160-360h640v-400H160v400Zm0 0v-400 400Z" />
    </SVGIcon>
  );
};

export const BookIcon = (props: SVGProps) => {
  return (
    <SVGIcon {...props} viewBox="0 0 24 24">
      <path
        d="M12 6.03v13m0-13c-2.819-.831-4.715-1.076-8.029-1.023A.99.99 0 0 0 3 6v11c0 .563.466 1.014 1.03 1.007c3.122-.043 5.018.212 7.97 1.023m0-13c2.819-.831 4.715-1.076 8.029-1.023A.99.99 0 0 1 21 6v11c0 .563-.466 1.014-1.03 1.007c-3.122-.043-5.018.212-7.97 1.023"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
      />
    </SVGIcon>
  );
};

export const TableIcon = (props: SVGProps) => {
  return (
    <SVGIcon {...props} viewBox="0 0 24 24">
      <path d="m21.96 9.73l-1.43-5a.996.996 0 0 0-.96-.73H4.43c-.45 0-.84.3-.96.73l-1.43 5c-.18.63.3 1.27.96 1.27h2.2L4 20h2l.67-5h10.67l.66 5h2l-1.2-9H21c.66 0 1.14-.64.96-1.27M6.93 13l.27-2h9.6l.27 2zm-2.6-4l.86-3h13.63l.86 3z" />
    </SVGIcon>
  );
};

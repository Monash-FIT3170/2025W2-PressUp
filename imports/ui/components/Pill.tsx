interface Props {
  colour: string;
  children?: string;
}

export const Pill = ({ colour, children }: Props) => {
  return <div className={colour}>{children}</div>;
};

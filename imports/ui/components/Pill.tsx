interface Props {
  bgColour: string;
  borderColour: string;
  textColour: string;
  content?: string;
}

export const Pill = ({ bgColour, borderColour, textColour, content }: Props) => {
  return (
    <div
      className={`${borderColour} ${bgColour} ${textColour} border rounded-xl px-3`}
    >
      {content}
    </div>
  );
};

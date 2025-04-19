interface Props {
  bgColour: string;
  borderColour: string;
  textColour: string;
  children?: string;
  
}

export const Pill = ({
  bgColour,
  borderColour,
  textColour,
 
  children,
}: Props) => {
  return (
    <div
      className={`${borderColour} ${bgColour} ${textColour} border rounded-xl px-3`}
    >
      {children}
    </div>
  );
};

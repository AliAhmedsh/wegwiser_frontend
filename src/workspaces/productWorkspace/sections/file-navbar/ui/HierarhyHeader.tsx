interface HierarhyHeaderProps {
  text: string;
  level: number;
}

const HierarhyHeader: React.FC<HierarhyHeaderProps> = ({ text, level }) => {
  const paddingStyle = { paddingLeft: `${level * 10}px` };
  return (
    <p
      className={`font-opensans font-[400] text-[#181818] text-[14px]`}
      style={paddingStyle}
    >
      {text}
    </p>
  );
};

export default HierarhyHeader;

import Image from 'next/image';

const SectionBtn: React.FC<{
  src?: string;
  width?: number;
  height?: number;
  text?: string;
  alt?: string;
  theme?: 'primary' | 'secondary';
  customClasses?: string;
  onClick?: () => void;
}> = ({ src, width, height, text, alt, theme, customClasses, onClick }) => {
  let additionalClasses = '';

  switch (theme) {
    case 'primary':
      additionalClasses = 'bg-[#627899] text-[#fff]';
      break;
    case 'secondary':
      additionalClasses = '';
      break;
    default:
      additionalClasses = '';
  }

  return (
    <button
      className={`flex flex-row items-center justify-center gap-2 rounded-md p-2 font-[400] text-[12px] cursor-pointer ${additionalClasses} ${customClasses}`}
      onClick={onClick}
    >
      {src && (
        <Image
          width={width || 16}
          height={height || 16}
          src={src}
          alt={alt || ''}
        />
      )}
      {text && <span>{text}</span>}
    </button>
  );
};

export default SectionBtn;

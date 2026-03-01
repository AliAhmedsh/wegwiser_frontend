import { Dispatch, SetStateAction } from 'react';
import ConfirmBtn from './confirmBtn';
import { Open_Sans, Poppins } from 'next/font/google';

interface ModalWindowProps {
  onConfirm: () => void;
  setFunction: Dispatch<SetStateAction<boolean>>;
  title: string;
  text: string;
  className?: string;
}

const poppins = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

const openSans = Open_Sans({
  weight: ['400'],
  subsets: ['latin'],
});

const ModalWindow: React.FC<ModalWindowProps> = ({
  onConfirm,
  setFunction,
  title,
  text,
  className,
}) => {
  const onClose = () => setFunction(false);

  return (
    <div
      className={`fixed inset-0 bg-black/50  flex items-center justify-center z-50 transition-opacity duration-300`}
    >
      <div
        className={`bg-white p-6 rounded-[12px] shadow-2xl max-w-[90%] animate-fade-in ${className}`}
      >
        <div
          className={`font-semibold mt-1 ${poppins.className} text-[16px] text-center`}
        >
          Attention
        </div>

        <div className="px-[15px]">
          <div
            className={`mt-6 text-sm text-gray-600 text-[12px] text-center ${openSans.className}`}
          >
            {title}
          </div>
          <div
            className={`mt-2 text-sm text-gray-600 text-[11px] text-center ${openSans.className}`}
          >
            {text}
          </div>
        </div>

        <div className="mt-6 flex justify-around gap-4">
          <div className="w-[125px]">
            <ConfirmBtn
              text="Cancel"
              onClick={onClose}
              className="h-[45px]"
              isWhite
              style={{
                boxShadow:
                  '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #6278991A',
              }}
            />
          </div>

          <div className="w-[125px]">
            <ConfirmBtn
              className="h-[45px]"
              text="Select"
              onClick={onConfirm}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalWindow;

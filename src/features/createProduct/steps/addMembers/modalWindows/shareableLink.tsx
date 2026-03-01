import { useState } from 'react';
import ConfirmBtn from '@/shared/ui/confirmBtn';

const ShareableLink = () => {
  const [isShown, setIsShown] = useState<boolean>(false);

  return (
    <div>
      <div
        className="text-[#4E6DB3] ml-2  text-[13px] hover:underline cursor-pointer"
        onClick={() => setIsShown(true)}
      >
        Shareable link
      </div>
      {isShown && (
        <div className="fixed inset-0 p-10 bg-[rgba(244,244,244,0.8)] font-poppins font-semibold flex justify-center items-center">
          <div className="p-10 bg-white rounded-4xl w-[60%] opacity-100">
            <div className="font-semibold ">Create shareable link</div>
            <div className="pl-5 mt-10">
              <div className="flex justify-between items-center">
                <div>https://www.wegwiser.com/join/project/</div>
                <div className="bg-[#627899] p-5 rounded-xl hover:text-gray-300 hover:shadow-xl cursor-pointer hover:scale-90 transition-all text-white text-[12px]">
                  Copy link
                </div>
              </div>
            </div>
            <div className="mt-10 pl-5">
              <div>Link Permissions:</div>
              <div className="mt-5 text-[#4E6DB3]">
                <span className="hover:underline cursor-pointer">
                  Join with company email
                </span>
                <br />
                <span className="hover:underline cursor-pointer mt-5">
                  Upon approval
                </span>
              </div>
            </div>
            <div className="flex justify-end w-1/2 m-0 m-auto mt-10">
              <ConfirmBtn text="Close" onClick={() => setIsShown(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShareableLink;

'use client';

import ConfirmBtn from '@/shared/ui/confirmBtn';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function ModalWindow() {
  const [isShowTip, setIsShowTip] = useState<boolean>(false);
  const changeTipVisibility = () => {
    setIsShowTip(!isShowTip);
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex justify-center items-center z-10">
      <div className="w-1/3 h-[40%] rounded-3xl text-center bg-white p-5">
        <h2 className="font-bold texgt-[16px] font-poppins">
          Create first vehicle
        </h2>
        <div className="text-[12px] font-opensans">
          <div>Start a project by creating your very first vehicle</div>
          <div
            className="flex justify-center py-2 h-[40px] w-[40px] mx-auto mt-5"
            onMouseEnter={changeTipVisibility}
            onMouseLeave={changeTipVisibility}
          >
            <Image
              src={'icons/tip-icon.svg'}
              alt="Tip"
              width={40}
              height={40}
            />
          </div>
          <div>
            <div className="p-2 text-center bg-white rounded-2xl">
              A product is made of vehicles that represent a specific product
              development initiative. For example ‘back end’, ‘interface design’
              etc.
            </div>
          </div>
        </div>
        <div className="mt-10 w-[80%] mx-auto">
          <Link href={'/vehicle-creation'}>
            <ConfirmBtn text="Create vehicle" />
          </Link>
        </div>
      </div>
    </div>
  );
}

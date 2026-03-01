'use client';

import { useState } from 'react';
import Image from 'next/image';
import ConfirmBtn from '@/shared/ui/confirmBtn';
import { useCreationProductStore } from '../../store';
import SectionBtn from '@/shared/ui/sectionBtn';
import { useRouter } from 'next/navigation';

export default function NameProduct() {
  const incrementStep = useCreationProductStore((state) => state.incrementStep);
  const setName = useCreationProductStore((state) => state.setName);
  const name = useCreationProductStore((state) => state.name);

  const router = useRouter();

  const [isNameError, setIsNameError] = useState<boolean>(false);

  const onEnter = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.value.length <= 30) {
      setName(e.currentTarget.value);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onIncrement();
    }
  };

  const redirectToMain = () => {
    router.push('/login');
  };

  const onIncrement = () => {
    if (name.trim().length > 0) {
      incrementStep();
    } else {
      setIsNameError(true);
    }
  };

  return (
    <div className="bg-white h-[85vh] w-[85vw] rounded-4xl flex flex-col pb-[30px]">
      <div className="flex flex-row justify-end p-4">
        <SectionBtn
          width={24}
          height={24}
          src="icons/ModalClose.svg"
          onClick={redirectToMain}
        />
      </div>
      <div className="mt-5 flex justify-center">
        <Image
          src={'creation-product-steps/first-step.svg'}
          alt="steps"
          width={325}
          height={25}
        />
      </div>
      <div className="font-poppins text-[24px] mt-5 font-poppins font-semibold text-center">
        What is The Name of Your Product?
      </div>
      <div className="justify-center flex w-[100%] mt-40">
        <div className="w-[30%]">
          <input
            onChange={onEnter}
            onKeyDown={handleKeyDown}
            className="input-default"
            value={name}
          />
        </div>
        <span className="pl-5 border-[2px] border-x-0 border-t-0 border-b-[rgba(0,0,0,0.3)] text-[13px]">
          {name?.length}/30
        </span>
      </div>
      {isNameError && (
        <div className="text-center mt-2 text-gray-400">
          Name cannot be empty
        </div>
      )}

      <div className="mx-auto px-15 flex flex-row justify-end items-end flex-1 w-full">
        <div className="w-[189px] text-[14px]">
          <ConfirmBtn
            className="h-[45px]"
            text="Continue"
            onClick={onIncrement}
          />
        </div>
      </div>
    </div>
  );
}

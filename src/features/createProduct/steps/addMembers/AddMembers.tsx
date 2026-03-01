'use client';

import Image from 'next/image';
import AddMemberForm from './forms/AddMemberForm';
import ConfirmBtn from '@/shared/ui/confirmBtn';

import { useCreationProductStore } from '../../store';

export default function AddMembers() {
  const incrementStep = useCreationProductStore((state) => state.incrementStep);
  const decrimentStep = useCreationProductStore((state) => state.decrimentStep);
  const skippedPRDStep = useCreationProductStore((state) => state.skippedPRDStep);
  
  const handleBack = () => {
    if (skippedPRDStep) {
      decrimentStep();
      decrimentStep();
    } else {
      decrimentStep();
    }
  };

  return (
    <div className="bg-white h-[85vh] w-[85vw] rounded-4xl pt-10 pb-[30px]">
      <div className="w-[86%] h-full mx-auto flex flex-col">
        <div className="flex justify-center">
          <Image
            src={'/creation-product-steps/fourth-step.svg'}
            alt="fourth-step"
            width={350}
            height={100}
          />
        </div>
        <h1 className="font-poppins font-semibold text-[24px] mt-5 text-center">
          Add Team Members
        </h1>
        <div className="text-[14px] text-center mx-auto">
          Add all relevant team members from Product, Design, and
          Engineering/QA.
        </div>
        <div className=" grow flex-1 overflow-y-auto custom-scrollbar">
          <AddMemberForm />
        </div>
        <div className="flex justify-between items-center text-[14px] mt-4">
          <div
            className="hover:scale-90 hover:cursor-pointer active:scale-80 transition-all duration-300"
            onClick={handleBack}
          >
            <Image
              src={'/icons/arrow-to-left.svg'}
              alt="arrow-to-back"
              height={24}
              width={24}
            />
          </div>

          <div className="flex items-center">
            <div
              className="hover:underline pr-5 cursor-pointer"
              onClick={incrementStep}
            >
              Skip for now
            </div>
            <div className="w-[190px]">
              <ConfirmBtn
                className="h-[45px]"
                text="Continue"
                onClick={incrementStep}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

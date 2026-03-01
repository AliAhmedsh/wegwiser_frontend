'use client';

import Image from 'next/image';

import FileForm from './forms/FileForm';
import ChatForm from './forms/ChatForm';
import NavButtons from '../../ui/navButtons';
import { BLOCK_HEIGHT_VH, BLOCK_WIDTH_WV } from '../constants';
import { Inter } from 'next/font/google';
import { useCreationVehicleStore } from '../../store';

const Inter700 = Inter({
  weight: ['700'],
  subsets: ['cyrillic'],
});

export default function ProductRelating() {
  const { assumptionsText } = useCreationVehicleStore();

  return (
    <div className="bg-[#EAEDF2] h-[92vh] font-poppins">
      <div className="flex justify-center">
        <Image
          alt="step visualisation"
          src={'/creation-vehicle-steps/second-step.svg'}
          width={430}
          height={27}
        />
      </div>

      <div className="flex px-13 justify-center h-[80vh] mt-2">
        <div
          className="bg-white rounded-4xl mt-5 p-5 pl-20 flex flex-col"
          style={{
            boxShadow: '2px 2px 2px 0px #A7B1C499',
            height: BLOCK_HEIGHT_VH,
            width: BLOCK_WIDTH_WV,
          }}
        >
          <h2
            className={`font-bold text-[16px] pb-5 pt-5 ${Inter700.className}`}
          >
            How does the vehicle co relate to the product?
          </h2>

          <div className="flex justify-between flex-grow overflow-auto max-xl:pr-12">
            <ChatForm />
            <FileForm />
          </div>

          <div className="mt-6 pt-2">
            <NavButtons step={2} />
          </div>
        </div>
      </div>
    </div>
  );
}

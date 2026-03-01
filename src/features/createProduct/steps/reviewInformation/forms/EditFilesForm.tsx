'use client';

import Image from 'next/image';
import { useCreationProductStore } from '@/features/createProduct/store';
import { Poppins } from 'next/font/google';

const poppins600 = Poppins({
  weight: ['600'],
  subsets: ['latin']
});

export default function EditFilesForm() {
  const materialFiles = useCreationProductStore((state) => state.materialFiles);
  const deleteMaterialFile = useCreationProductStore(
    (state) => state.deleteMaterialFile
  );

  return (
    <div className="mt-5 text-[13px]">
      <div className={`font-semibold text-[16px] ${poppins600.className}`}>
        2. Your files
      </div>
      <div className="min-h-[100px] mt-5 rounded-xl">
        {materialFiles.map((item, index) => (
          <div
            className={`flex justify-between w-1/2 ${
              index === 0 ? '' : 'mt-3'
            } `}
            key={index}
          >
            <div className="bg-[#EAEDF2] text-center w-[300px] max-w-[300px] rounded-2xl p-1 flex justify-around text-[14px]">
              <div>{item.name}</div>
            </div>
            <div
              onClick={() => deleteMaterialFile(index)}
              className="cursor-pointer hover:scale-90 active:scale-80 transition-all duration-300"
            >
              <Image
                src={'/icons/trash-can.svg'}
                alt="delete-btn"
                height={20}
                width={20}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

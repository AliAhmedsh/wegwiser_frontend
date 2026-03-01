'use client';

import { useCreationProductStore } from '@/features/createProduct/store';
import { Poppins } from 'next/font/google';
import { useState } from 'react';

const poppins600 = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

export default function EditNameForm() {
  const name = useCreationProductStore((state) => state.name);
  const setName = useCreationProductStore((state) => state.setName);
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const onChangeName = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    if (value.length <= 30) {
      setName(value);
    }
  };

  return (
    <div className="mt-10 text-[13px] w-[280px]">
      <div
        className={`font-semibold text-[16px] font-poppins ${poppins600.className}`}
      >
        1. Basic info
      </div>
      <div className="mt-5 flex justify-between">
        <div>Name </div>
        <div>
          {(isEdit && (
            <input
              className="input-default"
              value={name}
              onChange={onChangeName}
            />
          )) || (
            <div className={`font-semibold ${poppins600.className}`}>
              {name}
            </div>
          )}
        </div>
        <div
          className="cursor-pointer hover:underline"
          onClick={() => setIsEdit(!isEdit)}
        >
          {isEdit ? 'Done' : 'Edit'}
        </div>
      </div>
    </div>
  );
}

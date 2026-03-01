'use client';

import Button from '@/shared/ui/button';
import { useGuidelineStore } from '@/store/guidelinesStore';
import NoteButton from './components/NoteButton';

export default function Header() {
  const step = useGuidelineStore((state) => state.step);

  return (
    <div className="top-2  fixed w-[100vw] z-10">
      <div className="flex pt-2 mx-auto items-center justify-between w-[95%]">
        <div
          className={`flex items-center education-button ${
            step === 1 ? ' z-20 pointer-events-none relative' : ' z-0'
          }`}
        >
          <Button image={''} />
        </div>
        <NoteButton />
      </div>
    </div>
  );
}

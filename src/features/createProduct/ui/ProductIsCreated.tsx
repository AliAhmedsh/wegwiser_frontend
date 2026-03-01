import { useModalWindowStore } from '@/store/modalWindowsStore';
import { Inter } from 'next/font/google';
import Image from 'next/image';

const inter600 = Inter({
  weight: ['600'],
  subsets: ['cyrillic'],
});

export default function ProductIsCreated() {
  const { setPostProductCreation } = useModalWindowStore();

  return (
    <div
      onClick={() => setPostProductCreation(false)}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-110 transition-opacity duration-300"
    >
      <div className="bg-white w-[650px] h-[430px] rounded-[12px] flex flex-col  justify-around">
        <div className="flex justify-center">
          <Image
            src={'/creation-product-steps/fourth-step-done.svg'}
            alt="step"
            width={325}
            height={50}
          />
        </div>
        <div className="flex justify-center">
          <Image
            src={'/icons/firecracker.svg'}
            alt="Congrats"
            width={108}
            height={108}
          />
        </div>
        <div
          className={`text-center lg:w-[70%] xl:w-[55%] text-[21px] mx-auto pb-14 ${inter600.className}`}
        >
          {`Congrats! You've just added your first Product.`}
        </div>
      </div>
    </div>
  );
}

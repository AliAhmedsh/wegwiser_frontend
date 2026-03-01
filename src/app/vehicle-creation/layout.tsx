import { Poppins } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';

const poppins600 = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#EAEDF2]">
      <Link href={'/'}>
        <div className="flex w-full justify-start items-center pt-5 pl-6">
          <div className="cursor-pointer hover:scale-90 active:scale-90 transition-all">
            <Image
              alt="arrow to left"
              src={'/icons/gray-arrow.svg'}
              width={18}
              height={18}
            />
          </div>
          <h2 className={`font-bold text-[16px] ml-6 ${poppins600.className}`}>
            Generate your Vehicle
          </h2>
        </div>
      </Link>
      <div>{children}</div>
    </div>
  );
}

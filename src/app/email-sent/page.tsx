'use client';

import withUserGuard from '@/hoc/guards/withUserGuard';
import EmailSentConfirmation from '@/sections/login/form/emailSentConfirmation';
import { Poppins } from 'next/font/google';
import Image from 'next/image';

const poppins = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

const EmailSentPage = () => {
  return (
    <div className="flex justify-evenly bg-[#EAEDF2] min-h-[100vh]">
      <Image
        className="fixed left-10 top-5"
        width={120}
        height={34}
        src={'/icons/logo.svg'}
        alt="logo"
      />
      <div className="flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Image
            src={'icons/Envelope.svg'}
            alt="Email sent"
            height={200}
            width={200}
          />
          <div
            className={`${poppins.className} text-[24px] font-poppins text-center w-[290px] font-semibold mt-4`}
          >
            Check your email for the password reset link
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center w-[600px]">
        <div className="w-[100%]">
          <EmailSentConfirmation />
        </div>
      </div>
    </div>
  );
};

export default withUserGuard(EmailSentPage);

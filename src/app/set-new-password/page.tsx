'use client';

import ResetPasswordForm from '@/sections/login/form/resetPasswordForm';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

const SetNewPasswordPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');
  const ticket = searchParams.get('ticket');
  const state = searchParams.get('state');
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
        <div className="w-[400px] text-[24px] italic font-thin">
          &quot;The best products aren&apos;t built in sprints but in continuous
          streams of inspiration and execution.&quot; <br /> <br />
          <div className="flex justify-end mt-[-5] font-thin not-italic">
            — Marty Cagan
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center w-[600px]">
        <div className="w-[100%]">
          <ResetPasswordForm token={token} email={email} ticket={ticket} state={state} />
        </div>
      </div>
    </div>
  );
};

export default SetNewPasswordPage;

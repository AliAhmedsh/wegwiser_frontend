'use client';

import { useEffect } from 'react';
import SignUpForm from './forms/SignUp';
import { useSignUpStore } from '@/store/signUpStore';
import Image from 'next/image';
import CreatePasswordForm from './forms/CreatePasswordForm';
import { Open_Sans, Poppins } from 'next/font/google';
import { PrivacyComponent } from '../login/form/loginForm';
import { useCheckVerificationQuery } from '@/lib/api/hooks/useAuth';

const openSans400 = Open_Sans({
  weight: ['400'],
  subsets: ['latin'],
});

const poppins = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

export default function SignUpSection() {
  const { isVeryfied, isVeryfying, setIsVeryfied, email, setIsVeryfying, invitationData } = useSignUpStore();

  const { data: verificationData } = useCheckVerificationQuery(
    email, 
    isVeryfying && !isVeryfied
  );

  useEffect(() => {
    if (verificationData?.verified) {
      setIsVeryfied(true);
      setIsVeryfying(false); 
    }
  }, [verificationData, setIsVeryfied, setIsVeryfying]);
  
  return (
    <div className="bg-[#EAEDF2] flex px-15 justify-between min-h-[100vh]">
      {!isVeryfied && !isVeryfying && (
        <div
          className={`${openSans400.className} w-[402px] text-[24px] flex  tracking-wide font-normal justify-center items-center text-[#181818] font-openSans`}
        >
              Build better software faster. Wegwiser unites product, design, and
              engineering teams to anticipate impact and accelerate delivery.
        </div>
      )}
      
      {!isVeryfying && !isVeryfied && <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
        <PrivacyComponent />
      </div>}

      {!isVeryfied && isVeryfying && (
        <div className="pt-20">
          <div className="flex justify-center h-full mt-[-40px] items-center">
            <div className="flex flex-col items-center">
              <Image
                src={'icons/Envelope.svg'}
                alt="Veryfying"
                height={200}
                width={200}
              />
              <div
                className="text-[24px] font-poppins text-center w-[278px] font-semibold"
              >
                Check your email for a verification link
              </div>
            </div>
          </div>
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
            <PrivacyComponent />
          </div>
        </div>
      )}

      {!isVeryfying && isVeryfied && (
        <div className="pt-20">
          <div className="flex justify-center h-full mt-[-40px] items-center">
            <div className="flex flex-col items-center">
              <Image
                src={'icons/verified.svg'}
                alt="Verified"
                height={300}
                width={300}
              />
              <div
                className="text-[24px] font-poppins text-center w-[278px] font-semibold"
              >
                Email verified!
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center min-h-screen">
        {!isVeryfied && !isVeryfying && (
          <SignUpForm />
        )}
        
        {isVeryfying && (
          <CreatePasswordForm />
        )}
        
        {isVeryfied && !isVeryfying && (
          <CreatePasswordForm />
        )}
      </div>
    </div>
  );
}

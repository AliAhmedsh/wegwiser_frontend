'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSignUpStore } from '@/store/signUpStore';
import { showToast } from '@/lib/utils/toast';
import Image from 'next/image';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setIsVeryfied, setEmail } = useSignUpStore();

  useEffect(() => {
    const email = searchParams.get('email');
    const status = searchParams.get('status');

    if (email && status === 'success') {
      setEmail(email);
      setIsVeryfied(true);
      showToast.success('Email verified successfully!');
      
      setTimeout(() => {
        router.push('/sign-up');
      }, 2000);
    } else {
      showToast.error('Invalid verification link');
      router.push('/sign-up');
    }
  }, [searchParams, setIsVeryfied, setEmail, router]);

  return (
    <div className="bg-[#EAEDF2] flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="flex justify-center items-center mb-6">
          <Image
            src={'/icons/verified.svg'}
            alt="Verified"
            height={200}
            width={200}
          />
        </div>
        <div className={`text-[24px] font-poppins font-semibold text-center mb-4 ${poppins.className}`}>
          Email verified successfully!
        </div>
        <div className="text-[16px] text-gray-600">
          Redirecting you back to complete your registration...
        </div>
      </div>
    </div>
  );
}

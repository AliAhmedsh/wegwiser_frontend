'use client';
import ConfirmBtn from '@/shared/ui/confirmBtn';
import { Poppins } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { authService } from '@/lib/api/services/authService';
import { showToast } from '@/lib/utils/toast';

const poppins = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

export function PrivacyComponent() {
  return (
    <div className="flex text-center items-center justify-center">
      <span className="text-[#000] font-inter text-[13px] font-normal leading-[140%]">
        Privacy  |  Terms
      </span>
    </div>
  );
}

export default function EmailSentConfirmation() {
  const router = useRouter();
  const [isResending, setIsResending] = useState<boolean>(false);


  const handleResendEmail = async () => {
    if (isResending) return;

    setIsResending(true);
    try {
      // Get email from URL params or localStorage
      const urlParams = new URLSearchParams(window.location.search);
      const email = urlParams.get('email') || localStorage.getItem('resetEmail');
      
      if (!email) {
        showToast.error('Email not found. Please try again from the forgot password page.');
        return;
      }

      await authService.forgotPassword({ email });
      showToast.success('Password reset instructions sent to your email!');
    } catch (error: any) {
      console.error('Resend email error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to resend email';
      showToast.error(errorMessage);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-white h-[650px] pt-15 pb-10 pl-15 pr-15 max-w-md mx-auto shadow rounded-[24px] relative z-10">
      <div className="text-[24px] font-semibold mb-4 text-center">
        Check your email
      </div>

      <div className="text-[14px] text-[#535354] text-center mb-10">
        The password reset link has been sent to your email. Click the link to proceed
      </div>

      <div className="space-y-4 mt-15">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6">
          </div>
          <p className="text-[14px] text-[#535354] mb-6">
          </p>
        </div>

        <div className="max-w-full mt-10 text-[13px]">
          <ConfirmBtn
            className="py-2.5 font-semibold"
            text={isResending ? "Resending..." : "Resend Email"}
            onClick={handleResendEmail}
            disabled={isResending}
            isLoading={isResending}
            type="button"
            style={{
              borderRadius: '12px',
              background: '#EAEDF2',
              boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)'
            }}
          />
        </div>
      </div>

      <div className="max-w-full mt-7">
        <Link href="/login">
          <ConfirmBtn
            style={{
              boxShadow:
                '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #6278991A',
            }}
            className="text-[14px] py-3"
            text="Back to Log In"
            isWhite
            onClick={() => ''}
          />
        </Link>
      </div>

      <div className="mt-auto absolute bottom-10 left-0 right-0">
        <PrivacyComponent />
      </div>
    </div>
  );
}
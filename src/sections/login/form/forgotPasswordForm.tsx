'use client';

import { authService } from '@/lib/api/services/authService';
import { showToast } from '@/lib/utils/toast';
import ConfirmBtn from '@/shared/ui/confirmBtn';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import isEmail from 'validator/lib/isEmail';

interface ForgotPasswordFormInputs {
  email: string;
}

export function PrivacyComponent() {
  return (
    <div className="flex text-center items-center justify-center">
      <span className="text-[#000] font-inter text-[13px] font-normal leading-[140%]">
        Privacy  |  Terms
      </span>
    </div>
  );
}

interface ForgotPasswordFormProps {
  showBackButton?: boolean;
}

export default function ForgotPasswordForm({ showBackButton = true }: ForgotPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      await authService.forgotPassword({ email: data.email });

      showToast.success('Password reset instructions sent to your email!');

      // Store email for resend functionality
      localStorage.setItem('resetEmail', data.email);

      setTimeout(() => {
        router.push(`/email-sent?email=${encodeURIComponent(data.email)}`);
      }, 1000);

    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to send reset instructions';
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white h-[650px] pt-15 pb-10 pl-15 pr-15 max-w-md mx-auto shadow rounded-[24px] relative z-10">
      <div className="text-[24px] font-semibold mb-4 text-center">
        Forgot your password?
      </div>

      <div className="text-[14px] text-[#535354] text-center mb-10">
        Enter your email and we&apos;ll send you a reset link.
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-15">
        <div>
          <input
            type="email"
            {...register('email', {
              required: 'Email is required',
              validate: (value) => isEmail(value) || 'Enter a valid email',
            })}
            className="input-default bg-white text-[16px]"
          />
          <label className="block text-[13px] text-[#535354] mt-1">Email</label>
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="max-w-full mt-10 text-[13px]">
          <ConfirmBtn
            className="py-2.5 font-semibold"
            text={isLoading ? "Sending..." : "Send Email"}
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            isLoading={isLoading}
            type="submit"
            style={{
              borderRadius: '12px',
              background: '#EAEDF2',
              boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)'
            }}
          />
        </div>
      </form>

      {showBackButton && (
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
      )}

      <div className="mt-auto absolute bottom-10 left-0 right-0">
        <PrivacyComponent />
      </div>
    </div>
  );
}


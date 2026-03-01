'use client';

import { API_CONFIG } from '@/lib/config/api';
import { showToast } from '@/lib/utils/toast';
import ConfirmBtn from '@/shared/ui/confirmBtn';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

interface ResetPasswordFormInputs {
  newPassword: string;
  confirmPassword: string;
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

interface ResetPasswordFormProps {
  token?: string | null;
  email?: string | null;
  ticket?: string | null;
  state?: string | null;
}

export default function ResetPasswordForm({ token, email, ticket, state }: ResetPasswordFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormInputs>();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const router = useRouter();

  const newPassword = watch('newPassword');

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    if (isLoading) return;

    if (data.newPassword !== data.confirmPassword) {
      showToast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      if (token && email) {

        const response = await fetch(`${API_CONFIG.BASE_URL}/auth/reset-password`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token: token,
            email: email,
            password: data.newPassword
          })
        });

        if (!response.ok) {
          throw new Error('Failed to reset password');
        }
      } else if (ticket) {
        // Use Auth0's password reset API with the ticket parameter
        const response = await fetch(`https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/u/reset-password/change`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ticket: ticket,
            password: data.newPassword
          })
        });

        if (!response.ok) {
          throw new Error('Failed to reset password');
        }
      } else if (state) {

        const response = await fetch(`https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/u/reset-password/change`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            state: state,
            password: data.newPassword
          })
        });

        if (!response.ok) {
          throw new Error('Failed to reset password');
        }
      } else {

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      showToast.success('Password changed successfully!');

      setTimeout(() => {
        router.push('/password-changed-success');
      }, 1000);

    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to change password';
      showToast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white h-[650px] pt-15 pb-10 pl-15 pr-15 max-w-md mx-auto shadow rounded-[24px] relative z-10">
      <div className="text-[24px] font-semibold mb-4 text-center">
        Reset Password
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-15" style={{ gap: '40px', display: 'flex', flexDirection: 'column' }}>
        <div>
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              {...register('newPassword', {
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters'
                }
              })}
              className="input-default bg-white text-[16px] pr-10"
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="7" viewBox="0 0 14 7" fill="none">
                <path d="M0.854445 0.594714C0.743208 0.412504 0.797623 0.172534 0.976028 0.0589396C1.15443 -0.0546694 1.38925 0.000904779 1.50062 0.183115C4.16378 4.5446 9.83576 4.54497 12.4991 0.183694C12.6104 0.00148368 12.8453 -0.0540905 13.0237 0.0595185C13.2021 0.173272 13.2565 0.413083 13.1453 0.595293C10.1836 5.44472 3.81584 5.44435 0.854271 0.594714H0.854445ZM6.61943 5.44451H7.38079V7H6.61943V5.44451ZM3.5959 4.67354L4.29689 4.97747L3.70175 6.40936L3.00075 6.10544L3.5959 4.67354ZM1.07696 2.77764L1.61544 3.32761L0.538481 4.42753L0 3.87757L1.07696 2.77764ZM12.3846 3.32761L12.923 2.77764L14 3.87757L13.4615 4.42753L12.3846 3.32761ZM9.7129 4.96605L10.419 4.67472L10.9895 6.11691L10.2834 6.40824L9.7129 4.96605Z" fill="black" />
              </svg>
            </button>
          </div>
          <div className="mt-1" style={{ color: 'var(--Text-Dark-Grey, #535354)', fontFamily: 'Poppins', fontSize: '13px', fontStyle: 'normal', fontWeight: 400, lineHeight: '140%' }}>
            New password <span style={{ fontStyle: 'italic', fontWeight: 300 }}>(8 characters minimum)</span>
          </div>
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === newPassword || 'Passwords do not match'
            })}
            className="input-default bg-white text-[16px]"
          />
          <div className="mt-1" style={{ color: 'var(--Text-Dark-Grey, #535354)', fontFamily: 'Poppins', fontSize: '13px', fontStyle: 'normal', fontWeight: 400, lineHeight: '140%' }}>Re-enter password</div>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <div className="max-w-full mt-10 text-[13px]">
          <ConfirmBtn
            className="py-2.5 font-semibold"
            text={isLoading ? "Changing..." : "Change Password"}
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

      <div className="mt-auto absolute bottom-10 left-0 right-0">
        <PrivacyComponent />
      </div>
    </div>
  );
}

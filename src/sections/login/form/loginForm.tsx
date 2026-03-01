'use client';

import { authService } from '@/lib/api/services/authService';
import { setCookie } from '@/lib/config/api';
import { showToast } from '@/lib/utils/toast';
import { getCurrentUserId } from '@/lib/utils/auth';
import ConfirmBtn from '@/shared/ui/confirmBtn';
import ModalWindow from '@/shared/ui/modalWindow';
import useLoginStore from '@/store/TO_DELETE/loginStore';
import { useSignUpStore } from '@/store/signUpStore';
import useRegStore from '@/sections/sign-up/store/regStore';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import isEmail from 'validator/lib/isEmail';

interface LoginFormInputs {
  email: string;
  password: string;
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

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const [showModal, setShowModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const login = useLoginStore((state) => state.login);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Pre-fill email from URL parameters (using window.location for reliability in Next.js 15)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const email = urlParams.get('email');
    if (email) {
      setValue('email', email);
    }
  }, [setValue]);


  const handleModalConfirm = () => {
    setShowModal(false);
  };

  const onSubmit = async (data: LoginFormInputs) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await authService.login({
        email: data.email,
        password: data.password,
      });

      if (response.access_token) {

        setCookie('access_token', response.access_token, 7);

        const userId = (response.user as any).id || getCurrentUserId();
        if (userId) {
          localStorage.setItem('user_id', String(userId));
          console.log('User ID stored in localStorage:', userId);
        }

        // Store user role in sessionStorage for role-based access control
        console.log('Storing user role in sessionStorage:', response.user.role);
        sessionStorage.setItem('userRole', response.user.role);
        console.log('Role stored, verifying:', sessionStorage.getItem('userRole'));
        
        // Dispatch custom event to notify components of role change
        window.dispatchEvent(new CustomEvent('userRoleChanged'));

        login(data.email, data.password, response.user.name, response.user.role, (response.user as any).createdAt);

        showToast.success('Login successful!');

        // Check if there's invitation data from signup redirect
        const invitationData = localStorage.getItem('invitationData');
        if (invitationData) {
          try {
            const parsedData = JSON.parse(invitationData);
            // Clear the stored invitation data
            localStorage.removeItem('invitationData');

            // Redirect to invitation accept page with the data
            const invitationUrl = `/invitation/accept?productId=${parsedData.productId}&inviterName=${encodeURIComponent(parsedData.inviterName)}&productName=${encodeURIComponent(parsedData.productName)}&role=${encodeURIComponent(parsedData.role)}`;
            router.push(invitationUrl);
            return;
          } catch (error) {
            console.error('Error parsing invitation data:', error);
          }
        }

        // Get returnTo from window.location (more reliable in Next.js 15)
        const urlParams = new URLSearchParams(window.location.search);
        const returnTo = urlParams.get('returnTo');
        console.log('Login successful, checking returnTo:', returnTo);
        console.log('Full URL search params:', window.location.search);
        
        if (returnTo) {
          console.log('Redirecting to returnTo URL:', returnTo);
          // Store invitation params in sessionStorage before redirect
          // This is necessary because Next.js client-side routing doesn't preserve query strings immediately
          const invitationParams = new URLSearchParams(returnTo.split('?')[1]);
          
          // Handle product invitation
          if (invitationParams.get('acceptInvitation') === 'true') {
            console.log('💾 Storing product invitation params in sessionStorage for post-redirect pickup');
            sessionStorage.setItem('invitationParams', JSON.stringify({
              email: invitationParams.get('email'),
              productId: invitationParams.get('productId'),
              inviterName: invitationParams.get('inviterName'),
              productName: invitationParams.get('productName'),
              role: invitationParams.get('role'),
              acceptInvitation: 'true'
            }));
          }
          
          // Handle facilitator invitation
          if (invitationParams.get('acceptFacilitatorInvitation') === 'true') {
            console.log('💾 Storing facilitator invitation params in sessionStorage for post-redirect pickup');
            const facilitatorParams = {
              email: invitationParams.get('email'),
              productId: invitationParams.get('productId'),
              vehicleId: invitationParams.get('vehicleId'),
              inviterName: invitationParams.get('inviterName'),
              productName: invitationParams.get('productName'),
              vehicleName: invitationParams.get('vehicleName'),
              acceptFacilitatorInvitation: 'true'
            };
            sessionStorage.setItem('invitationParams', JSON.stringify(facilitatorParams));
            // Also store separately for vehicle-approval page
            sessionStorage.setItem('facilitatorInvitationParams', JSON.stringify(facilitatorParams));
          }
          
          // Handle vehicle approval (auto-open simulation) - for approvers
          if (invitationParams.get('autoOpenSimulation') === 'true') {
            console.log('💾 Storing vehicle approval params in sessionStorage for post-redirect pickup');
            sessionStorage.setItem('approverParams', JSON.stringify({
              vehicleId: invitationParams.get('vehicleId'),
              productId: invitationParams.get('productId'),
              autoOpenSimulation: 'true',
              approverEmail: invitationParams.get('approverEmail')
            }));
          }
          
          router.push(returnTo);
        } else {
          console.log('No returnTo found, redirecting to home');
          router.push('/');
        }
      } else {
        showToast.error('Login failed: No access token received.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      let errorMessage = error.response?.data?.error || error.response?.data?.message || error.message;
      
      // Provide user-friendly messages for common timeout/network errors
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout') || error.message?.includes('canceled')) {
        errorMessage = 'Connection timeout. The server may be starting up. Please try again in a moment.';
      } else if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        errorMessage = 'Unable to connect to server. Please check your connection and try again.';
      } else if (error.response?.status === 503 || error.response?.status === 502 || error.response?.status === 504) {
        errorMessage = 'Server is temporarily unavailable. Please try again in a moment.';
      }
      
      showToast.error(errorMessage || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white h-[650px] pt-15 pb-10 pl-15 pr-15 max-w-md mx-auto shadow rounded-[24px] relative z-10">
      {showModal && (
        <ModalWindow
          title="Reset Password"
          text="We will send instructions to your email"
          onConfirm={handleModalConfirm}
          setFunction={setShowModal}
        />
      )}

      <div className="text-[24px] font-semibold mb-6 text-center">
        Welcome back!
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

        <div>
          <div>
            <input
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 8,
                  message: 'Minimum length is 8 characters',
                },
              })}
              className="input-default bg-white text-[16px]"
            />
          </div>
          <label className="block text-[13px] text-[#535354] mt-1">
            Password
          </label>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="max-w-full mt-10 text-[13px]">
          <ConfirmBtn
            className="py-2.5 font-semibold"
            text={isLoading ? "Signing In..." : "Sign In"}
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading}
            isLoading={isLoading}
            type="submit"
          />
        </div>
      </form>

      <div className="mt-5  flex justify-end   text-[#535354] text-[14px] ">

        <Link href="/forgot-password" className="cursor-pointer hover:underline">
          Forget Password
        </Link>
      </div>

      <div className="mt-[30px]">
        <hr className="border-[#535354]" />
      </div>

      <div className="max-w-full mt-7">
        <Link href={'sign-up'}>
          <ConfirmBtn
            style={{
              boxShadow:
                '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #6278991A',
            }}
            className="text-[14px] py-3"
            text="No account? Join"
            isWhite
            onClick={() => {
              useSignUpStore.getState().resetSignUpState();
              useRegStore.getState().resetRegState();
            }}
          />
        </Link>
      </div>

      <div className="mt-22">
        <PrivacyComponent />
      </div>
    </div>
  );
}

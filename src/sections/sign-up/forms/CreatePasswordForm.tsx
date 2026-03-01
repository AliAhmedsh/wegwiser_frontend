'use client';

import { authService } from '@/lib/api/services/authService';
import { showToast } from '@/lib/utils/toast';
import { PrivacyComponent } from '@/sections/login/form/loginForm';
import ConfirmBtn from '@/shared/ui/confirmBtn';
import { useSignUpStore } from '@/store/signUpStore';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useRegStore from '../store/regStore';

type FormData = {
  password: string;
};

export default function CreatePasswordForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const { email } = useSignUpStore();
  const [isShowPassword, setIsShowPassword] = useState<boolean>(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState<boolean>(false);
  const isVeryfied = useSignUpStore((state) => state.isVeryfied);
  const isVeryfying = useSignUpStore((state) => state.isVeryfying);
  const router = useRouter();

  const {
    name,
    surname,
    accuratePosition,
    isManager,
    email: emailStore,
    position,
    shortName,
  } = useRegStore();

  const onSubmit = async (data: FormData) => {
    setIsCreatingAccount(true);
    try {
   
      await authService.setFinalPassword({
        email: emailStore,
        password: data.password
      });
      
      showToast.success('Account created successfully! Redirecting to login...');

      useSignUpStore.getState().resetSignUpState();
      useRegStore.getState().resetRegState();
  
      setTimeout(() => {
        const pendingInvitation = localStorage.getItem('pendingInvitation');
        const signupReturnTo = localStorage.getItem('signupReturnTo');
        
        if (pendingInvitation) {
          const invitationData = JSON.parse(pendingInvitation);
          
          // Handle facilitator invitation
          if (invitationData.isFacilitator && invitationData.vehicleId) {
            const homePageWithInvitationParams = `/?email=${encodeURIComponent(emailStore)}&vehicleId=${invitationData.vehicleId}&productId=${invitationData.productId}&inviterName=${encodeURIComponent(invitationData.inviterName)}&vehicleName=${encodeURIComponent(invitationData.vehicleName)}&productName=${encodeURIComponent(invitationData.productName)}&acceptFacilitatorInvitation=true`;
            const loginUrl = `/login?returnTo=${encodeURIComponent(homePageWithInvitationParams)}`;
            router.push(loginUrl);
          } else {
            // Handle product invitation
            const homePageWithInvitationParams = `/?email=${encodeURIComponent(emailStore)}&productId=${invitationData.productId}&inviterName=${encodeURIComponent(invitationData.inviterName)}&productName=${encodeURIComponent(invitationData.productName)}&role=${encodeURIComponent(invitationData.role || 'MEMBER')}&acceptInvitation=true`;
            const loginUrl = `/login?returnTo=${encodeURIComponent(homePageWithInvitationParams)}`;
            router.push(loginUrl);
          }
          localStorage.removeItem('pendingInvitation');
        } else if (signupReturnTo) {
          // If there's a returnTo URL from the deeplink, redirect to login with that URL
          const loginUrl = `/login?returnTo=${encodeURIComponent(signupReturnTo)}`;
          router.push(loginUrl);
          localStorage.removeItem('signupReturnTo');
        } else {
          router.push('/login');
        }
      }, 1500);
      setIsCreatingAccount(false);
    } catch (error) {
      setIsCreatingAccount(false);
     
      showToast.error('Failed to create account. Please try again.');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white px-10 w-[445px] h-[610px] mx-auto shadow rounded-[24px] justify-between text-[14px] flex flex-col pb-15"
    >
      
      <div>
      <div className="font-semibold text-[24px] pt-10 mb-6 text-center">
        Create your free account
      </div>


      <div className="mb-4 pt-4">
        <div className="flex border-0 border-b-1 border-b-[rgba(0,0,0,0.3)] outline-none">
          <input type="email" className="w-full" disabled value={email} />
        </div>
        <label className="block font-light text-sm py-1 font-poppins text-[#535354]">
          Work email
        </label>
      </div>

      <div className="mb-6">
        <div className="border-0 border-b-[rgba(0,0,0,0.3)] border-b-1 flex">
          <input
            type={isShowPassword ? 'text' : 'password'}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
            })}
            className="w-full outline-none pr-2"
            />
          <div className="flex items-center pr-2">
            <Image
              className="cursor-pointer hover:scale-110 transition-all"
              src={
                (isShowPassword && 'icons/openEye.svg') || 'icons/closedEye.svg'
              }
              alt="switch off password visibility"
              width={14}
              height={isShowPassword ? 7 : 14}
              onClick={() => setIsShowPassword((prev) => !prev)}
              />
          </div>
        </div>
        <label className="block text-sm font-light py-1 text-[#535354]">
          Password
          <span className=" italic font-light"> (8 characters minimum)</span>
        </label>

        {errors.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      {!isVeryfied && isVeryfying && (
        <div className="pt-62 ">
          <ConfirmBtn text="Continue" type="submit" isInActive disabled toolTipText="Verify your email to continue" />
          <Link href="/login" onClick={() => { useSignUpStore.getState().resetSignUpState(); useRegStore.getState().resetRegState(); }}>
            <div className="mt-4 text-[12px] text-center cursor-pointer hover:underline">
              Already have an account? Sign in
            </div>
          </Link>
          <div className="mt-32 flex justify-center">
            <PrivacyComponent />
          </div>
        </div>
      )}









   {!(!isVeryfied && isVeryfying) && (


<>

          <div className="pt-15">
                      <ConfirmBtn className="py-3" text={isCreatingAccount ? "Creating Account..." : "Create Account"} isLoading={isCreatingAccount} type="submit" />
          </div>
          
          <div className="mt-5 font-light text-center w-[90%] mx-auto font-poppins text-[#979797]">
            By creating the account I agree to the company Terms & Policies
          </div>
          <div className="mt-32 flex justify-center">
            <PrivacyComponent />
          </div>
</>

)}

          </div>


     
            </form>
  );
}

















//      {errors.password && (
//           <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
//         )}
//       </div>
//         </div>
      
//       {!isVerified && isVerifying && (
//         <div className="pt-24 pb-8">
//           <ConfirmBtn text="Continue" type="submit" />
//           <Link href="/login" onClick={() => { useSignUpStore.getState().resetSignUpState(); useRegStore.getState().resetRegState(); }}>
//             <div className="mt-4 text-[12px] text-center cursor-pointer hover:underline">
//               Already have an account? Sign in
//             </div>
//           </Link>
//         </div>
//       )}

//       {!(!isVerified && isVerifying) && (
//         <div>
          
//           <div className="pt-15">
          
//           <div >
//             <ConfirmBtn className="py-3" text={isCreatingAccount ? "Creating Account..." : "Create Account"} isLoading={isCreatingAccount} type="submit" />
//           </div>
          
//           <div className="mt-5 font-light text-center w-[90%] mx-auto font-poppins text-[#979797]">
//             By creating the account I agree to the company Terms & Policies
//           </div>

//           </div>

//             <div className=" flex justify-center">
//         <PrivacyComponent />
//       </div>
//         </div>
//       )}

    
//     </form>
//   );
// }





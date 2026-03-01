'use client';

import { useSignupMutation } from '@/lib/api/hooks/useAuth';
import ConfirmBtn from '@/shared/ui/confirmBtn';
import ModalWindow from '@/shared/ui/modalWindow';
import { useSignUpStore } from '@/store/signUpStore';
import { Open_Sans, Poppins } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import isEmail from 'validator/lib/isEmail';
import useRegStore from '../store/regStore';

const poppins = Poppins({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

const openSans = Open_Sans({
  weight: ['600'],
  subsets: ['latin'],
});

const opensans = Open_Sans({
  weight: ['400'],
  subsets: ['latin'],
});

interface SignUpFormInputs {
  firstName: string;
  lastName: string;
  workEmail: string;
  jobTitle: string;
  position: 'PM/OWNER' | 'UX/UI' | 'ENGINEER/QA' | 'FOUNDER/CEO/CPO';
}

export default function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormInputs>();

  const {
    setName,
    setSurname,
    setAccuratePosition,
    setIsManager,
    setEmail: setStoreEmail,
    setPosition,
    setShortName,
  } = useRegStore();

  const { setIsVeryfying, setEmail, invitationData } = useSignUpStore();
  const signupMutation = useSignupMutation();
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<SignUpFormInputs | null>(null);

  const onSubmit = async (data: SignUpFormInputs) => {
    if (data.position === 'PM/OWNER') {
      setFormData(data);
      setIsModalOpen(true);
    } else {
      await handleFinalSubmit(data);
    }

    setName(data.firstName);
    setSurname(data.lastName);
    setAccuratePosition(data.jobTitle);
    setIsManager(data.position === 'PM/OWNER');
    setStoreEmail(data.workEmail);
    setPosition(data.position);
    setShortName(`${data.firstName.charAt(0)}.${data.lastName.charAt(0)}`);
  };

  const mapPositionToRole = (position: string): string => {
    switch (position) {
      case 'PM/OWNER':
        return 'product_manager';
      case 'UX/UI':
        return 'designer';
      case 'ENGINEER/QA':
        return 'engineer';
      case 'FOUNDER/CEO/CPO':
        return 'founder';
      default:
        return position.toLowerCase();
    }
  };

  const handleFinalSubmit = async (data: SignUpFormInputs) => {
    setIsModalOpen(false);

    try {

      let finalRole = mapPositionToRole(data.position);
      if (invitationData?.role) {

        switch (invitationData.role.toLowerCase()) {
          case 'engineer':
          case 'engineering':
            finalRole = 'engineer';
            break;
          case 'designer':
          case 'design':
            finalRole = 'designer';
            break;
          case 'pm':
          case 'product_manager':
            finalRole = 'product_manager';
            break;
          case 'founder':
            finalRole = 'founder';
            break;
          default:
            finalRole = 'engineer';
        }
      }

      const signupData = {
        email: data.workEmail,
        password: 'tempPassword123',
        name: `${data.firstName} ${data.lastName}`,
        jobTitle: data.jobTitle,
        position: data.position,
        role: finalRole,
      };

      await signupMutation.mutateAsync(signupData);

      setIsVeryfying(true);
      setEmail(data.workEmail);
      reset();
      if (invitationData) {
        localStorage.setItem('pendingInvitation', JSON.stringify(invitationData));
      }
    } catch (error: any) {
      // Error is now handled by the mutation's onError callback with toast
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white pt-5 px-15 w-[445px] min-h-[660px] flex flex-col border mx-auto shadow rounded-[24px]"
      >
        <div className="flex-grow overflow-auto">
          <div className="text-[24px] mb-3 font-semibold text-center">
            Create your free account
          </div>

          <div className="space-y-4">

            <div className="flex justify-between">
              <div className="w-[45%] pr-2">
                <input
                  type="text"
                  {...register('firstName', {
                    required: 'First name is required',
                    pattern: {
                      value: /^[A-Za-z\s'-]+$/,
                      message: 'Only English letters are allowed',
                    },
                  })}
                  className="input-default rounded-none"
                />
                <label className="text-[13px] text-[#535354] mt-1">First Name</label>
                {errors.firstName && (
                  <p
                    className="text-red-500 text-[12px] absolute"
                  >
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div className="w-[45%] pl-2">
                <input
                  type="text"
                  {...register('lastName', {
                    required: 'Last name is required',
                    pattern: {
                      value: /^[A-Za-z\s'-]+$/,
                      message: 'Only English letters are allowed',
                    },
                  })}
                  className="input-default rounded-none"
                />
                <label className="text-[13px] text-[#535354] mt-1">Last Name</label>
                {errors.lastName && (
                  <p
                    className="text-red-500 text-[12px] absolute"
                  >
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <input
                type="email"
                {...register('workEmail', {
                  required: 'Email is required',
                  validate: (value) =>
                    isEmail(value) ||
                    'Invalid email, mails only with @company.com are allowed',
                })}
                className="w-full mt-1 border py-2 input-default rounded-none"
              />
              <label className="text-[13px] text-[#535354] mt-1">
                Work Email
              </label>
              {errors.workEmail && (
                <p
                  className="text-red-500 text-[12px] absolute"
                >
                  {errors.workEmail.message}
                </p>
              )}
            </div>

            <div>
              <input
                {...register('jobTitle', {
                  required: 'Job title is required',
                  pattern: {
                    value: /^[A-Za-z\s'-]+$/,
                    message: 'Only English letters are allowed',
                  },
                })}
                className="w-full mt-1 border py-2 input-default rounded-none"
              />
              <label className="text-[13px] text-[#535354] mt-1">
                Job Title
              </label>
              {errors.jobTitle && (
                <p
                  className="text-red-500 text-[12px] absolute"
                >
                  {errors.jobTitle.message}
                </p>
              )}
            </div>

            <div className='pb-4'>
              <div
                className="text-[14px] font-openSans font-semibold mt-10 font-opensans text-[#535354]"
              >
                To determine where you need edit access, please select from the
                following. I am a:
              </div>

              <div className="gap-4 pt-4">
                {[
                  { label: 'Product Manager / Owner', value: 'PM/OWNER' },
                  { label: 'UX / Visual Designer', value: 'UX/UI' },
                  { label: 'Engineer / QA', value: 'ENGINEER/QA' },
                  { label: 'Founder / CEO / CPO', value: 'FOUNDER/CEO/CPO' },
                ].map((item, index) => (
                  <label key={index}>
                    <div className="flex items-center gap-2 py-2 text-[14px]">
                      <input
                        type="radio"
                        value={item.value}
                        {...register('position', {
                          required: 'Select an option',
                        })}
                      />
                      <span className="pl-4 text-muted-foreground font-opensans">
                        {item.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
              {errors.position && (
                <p
                  className="text-red-500 text-[12px] absolute"
                >
                  {errors.position.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 pb-8">
          <ConfirmBtn text={signupMutation.isPending ? "Continuing..." : "Continue"} isLoading={signupMutation.isPending} type="submit" />
          <Link href="/login">
            <div className="mt-4 text-[12px] text-center cursor-pointer hover:underline">
              Already have an account? Sign in
            </div>
          </Link>
        </div>
      </form>

      {isModalOpen && formData && (
        <ModalWindow
          title="Select this option if you work across Product, Design, and Engineering departments and actively create content in each area. "
          className="w-[425px] h-[270px]"
          text="All team members can view and comment, but only contributors can edit their department's section."
          onConfirm={() => handleFinalSubmit(formData)}
          setFunction={setIsModalOpen}
        />
      )}
    </>
  );
}

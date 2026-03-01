'use client';

import { invitationService } from '@/entities/invitation/api/invitationService';
import withUserGuard from '@/hoc/guards/withUserGuard';
import { showToast } from '@/lib/utils/toast';
import SignUpSection from '@/sections/sign-up/SignUpSection';
import { useSignUpStore } from '@/store/signUpStore';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setEmail, setInvitationData } = useSignUpStore();
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  useEffect(() => {
    const email = searchParams.get('email');
    const isInvitation = searchParams.get('invitation') === 'true';
    const productId = searchParams.get('productId');
    const vehicleId = searchParams.get('vehicleId');
    const inviterName = searchParams.get('inviterName');
    const productName = searchParams.get('productName');
    const vehicleName = searchParams.get('vehicleName');
    const role = searchParams.get('role');
    const isFacilitator = searchParams.get('facilitator') === 'true';
    const returnTo = searchParams.get('returnTo');

    if (email && isInvitation) {
      // Check if email exists in database before proceeding
      const invitationData: any = {
        productId: productId ? parseInt(productId) : null,
        inviterName: inviterName || '',
        productName: productName || '',
        role: role || 'MEMBER'
      };

      // Add facilitator-specific data if it's a facilitator invitation
      if (isFacilitator && vehicleId) {
        invitationData.vehicleId = parseInt(vehicleId);
        invitationData.vehicleName = vehicleName || '';
        invitationData.isFacilitator = true;
      }

      checkEmailAndRedirect(email, invitationData);
    }

    // Store returnTo URL for after signup completion
    if (returnTo) {
      localStorage.setItem('signupReturnTo', returnTo);
    }
  }, [searchParams, setEmail, setInvitationData]);

  const checkEmailAndRedirect = async (email: string, invitationData: any) => {
    setIsCheckingEmail(true);
    try {
      const response = await invitationService.checkEmailExists(email);

      if (response.exists) {
        // Email exists, redirect to login with invitation data
        showToast.info('Email already exists. Redirecting to login...');

        // Store invitation data for login page
        localStorage.setItem('invitationData', JSON.stringify(invitationData));

        // Redirect to login with email pre-filled
        const loginUrl = `/login?email=${encodeURIComponent(email)}&invitation=true`;
        router.replace(loginUrl);
      } else {
        // Email doesn't exist, proceed with signup
        setEmail(email);
        setInvitationData(invitationData);
      }
    } catch (error) {
      console.error('Error checking email existence:', error);
      showToast.error('Failed to check email. Proceeding with signup...');
      // On error, proceed with signup as fallback
      setEmail(email);
      setInvitationData(invitationData);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  // Show loading spinner while checking email
  if (isCheckingEmail) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking email...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Image
        className="fixed left-10 top-5"
        width={120}
        height={34}
        src={'/icons/logo.svg'}
        alt="logo"
      />
      <SignUpSection />
    </div>
  );
};

export default withUserGuard(Page);

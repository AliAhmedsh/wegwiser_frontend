'use client';

import LoginForm from './form/loginForm';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import useLoginStore from '@/store/TO_DELETE/loginStore';

const LoginSection = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useLoginStore();
  const [invitationContext, setInvitationContext] = useState<{
    productName: string;
    inviterName: string;
    role: string;
  } | null>(null);

  useEffect(() => {
    const returnTo = searchParams.get('returnTo');
    
    // If user is already logged in and there's a returnTo with approver params, save to sessionStorage and redirect
    if (user && returnTo) {
      try {
        const invitationParams = new URLSearchParams(returnTo.split('?')[1]);
        
        // Handle vehicle approval (auto-open simulation) - for approvers
        if (invitationParams.get('autoOpenSimulation') === 'true') {
          console.log('💾 User already logged in - storing vehicle approval params in sessionStorage');
          sessionStorage.setItem('approverParams', JSON.stringify({
            vehicleId: invitationParams.get('vehicleId'),
            productId: invitationParams.get('productId'),
            autoOpenSimulation: 'true',
            approverEmail: invitationParams.get('approverEmail')
          }));
          // Redirect to home page, which will check sessionStorage and redirect to vehicle-approval
          router.push('/');
          return;
        }
      } catch (error) {
        console.error('Error handling returnTo for logged-in user:', error);
      }
    }
    
    if (returnTo && returnTo.includes('invitation/accept')) {
     
      try {
     
        const queryString = returnTo.split('?')[1];
        if (queryString) {
          const urlParams = new URLSearchParams(queryString);
          const productName = urlParams.get('productName');
          const inviterName = urlParams.get('inviterName');
          const role = urlParams.get('role');
          
          if (productName && inviterName) {
            setInvitationContext({
              productName: decodeURIComponent(productName),
              inviterName: decodeURIComponent(inviterName),
              role: role ? decodeURIComponent(role) : 'MEMBER'
            });
          }
        }
      } catch (error) {
        console.error('Error parsing returnTo URL:', error);
      }
    }
  }, [searchParams, user, router]);

  return (
    <div className="flex justify-evenly bg-[#EAEDF2] min-h-[100vh]">
      <Image
        className="fixed left-10 top-5"
        width={120}
        height={34}
        src={'/icons/logo.svg'}
        alt="logo"
      />
      <div className="flex items-center  justify-center">
        <div className="w-[400px] text-[24px] italic font-thin ">
              &quot;The best products aren&apos;t built in sprints but in continuous
              streams of inspiration and execution.&quot; <br /> <br />
              <div className="flex justify-end mt-[-5] font-thin not-italic">
                — Marty Cagan
              </div>
        </div>
      </div>
      <div className="flex justify-center items-center w-[600px]  ">
        <div className="w-[100%]">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginSection;

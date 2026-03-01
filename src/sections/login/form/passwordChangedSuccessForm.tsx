'use client';

import ConfirmBtn from '@/shared/ui/confirmBtn';
import { useRouter } from 'next/navigation';

export function PrivacyComponent() {
  return (
    <div className="flex text-center items-center justify-center">
      <span style={{ color: '#000', textAlign: 'center', fontFamily: 'Inter', fontSize: '13px', fontStyle: 'normal', fontWeight: 400, lineHeight: '140%' }}>
        Privacy  |  Terms
      </span>
    </div>
  );
}

export default function PasswordChangedSuccessForm() {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/login');
  };

  return (
    <div className="bg-white h-[650px] pt-15 pb-10 pl-15 pr-15 max-w-md mx-auto shadow rounded-[24px] relative z-10">
      <div className="mb-4 text-center" style={{ color: '#000', fontFamily: 'Poppins', fontSize: '24px', fontStyle: 'normal', fontWeight: 600, lineHeight: '140%' }}>
        Password changed
      </div>

      <div className="text-center mb-4" style={{ color: 'var(--Text-Dark-Grey, #535354)', fontFamily: 'Open Sans', fontSize: '14px', fontStyle: 'normal', fontWeight: 400, lineHeight: 'normal' }}>
        You have successfully changed the password!
      </div>

      <div className="max-w-full mt-48 text-[13px]">
        <ConfirmBtn
          className="py-2.5"
          text="Log In Now"
          onClick={handleContinue}
          style={{
            borderRadius: '12px',
            background: '#EAEDF2',
            boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)',
            color: 'var(--Text-Dark-Grey, #535354)',
            fontFamily: 'Poppins',
            fontSize: '13.284px',
            fontStyle: 'normal',
            fontWeight: 600,
            lineHeight: '19.927px'
          }}
        />
      </div>

      <div className="mt-auto absolute bottom-10 left-0 right-0">
        <PrivacyComponent />
      </div>
    </div>
  );
}

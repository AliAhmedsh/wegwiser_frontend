'use client';

import ConfirmBtn from '@/shared/ui/confirmBtn';
import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-[#EAEDF2] min-h-[100vh] flex items-center justify-center relative">

      <Image
        className="fixed left-10 top-5"
        width={120}
        height={34}
        src={'/icons/logo.svg'}
        alt="logo"
      />


      <div className="bg-white mx-auto shadow rounded-[24px]  p-10  px-16 text-center relative z-10" style={{ width: '600px', maxWidth: '90vw' }}>

        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center relative">
          <svg xmlns="http://www.w3.org/2000/svg" width="59" height="59" viewBox="0 0 59 59" fill="none">
            <path d="M34.1893 2.89957C33.296 1.11098 31.4995 0 29.5011 0H29.4998C27.5014 0 25.7036 1.111 24.8096 2.8989L0.558097 51.412C-0.259992 53.0502 -0.17487 54.9575 0.78835 56.5145C1.75025 58.0715 3.41668 59.0011 5.24681 59.0011H53.7532C55.5833 59.0011 57.2491 58.0715 58.2117 56.5145C59.1749 54.9568 59.26 53.0501 58.4419 51.412L34.1893 2.89957ZM56.2046 55.2753C55.6755 56.131 54.7598 56.6423 53.7536 56.6423H5.24724C4.24114 56.6423 3.3254 56.131 2.79625 55.2753C2.26648 54.4183 2.21897 53.3693 2.66958 52.4688L26.9211 3.95567C27.4205 2.95681 28.385 2.36107 29.5006 2.36107C30.6161 2.36107 31.5795 2.95681 32.0783 3.95567L56.3314 52.4688C56.7821 53.3693 56.7346 54.419 56.2048 55.2753H56.2046Z" fill="#4E6DB3" />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="29" viewBox="0 0 11 29" fill="none">
              <path d="M9.33519 0.602173H1.66706C1.34643 0.602173 1.04163 0.732139 0.818635 0.962387C0.596302 1.19198 0.476236 1.50271 0.488109 1.8227L1.36359 27.4912C1.38404 28.1266 1.90655 28.6313 2.54255 28.6313H8.45908C9.09507 28.6313 9.61693 28.1272 9.63805 27.4912L10.5135 1.8227C10.5247 1.50273 10.4053 1.19264 10.183 0.962387C9.96067 0.732134 9.65516 0.602173 9.33519 0.602173ZM7.31842 26.2707H3.68382L2.88884 2.96331H8.11408L7.31842 26.2707Z" fill="#4E6DB3" />
            </svg>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 translate-y-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 9 9" fill="none">
                <path d="M7.5009 0.117798H1.5006C0.848108 0.117798 0.320312 0.646247 0.320312 1.29808V7.2977C0.320312 7.94953 0.848108 8.47798 1.5006 8.47798H7.5009C8.15339 8.47798 8.68118 7.94953 8.68118 7.2977V1.29808C8.68118 0.646247 8.15339 0.117798 7.5009 0.117798ZM6.32127 6.11742H2.68076V2.47758H6.32127V6.11742Z" fill="#4E6DB3" />
              </svg>
            </div>
          </div>
        </div>


        <div className="text-[48px] font-bold text-[#4E6DB3] mb-4">
          404
        </div>


        <div className="text-[24px] font-semibold text-[#000] mb-4" style={{ fontFamily: 'Poppins', fontSize: '24px', fontWeight: 600, lineHeight: '140%', textAlign: 'center' }}>
          Page not found
        </div>


        <div className="text-[14px] text-[#000] mb-8" style={{ fontFamily: 'Open Sans', fontSize: '14px', fontWeight: 400, lineHeight: 'normal', textAlign: 'center' }}>
          The link may be broken or the page may have been removed
        </div>


        <div className="flex justify-center">
          <Link href="/">
            <ConfirmBtn
              className="py-2.5 font-semibold w-16"
              text="Go back home"
              style={{
                borderRadius: '12px',
                background: '#EAEDF2',
                boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)',
                width: '230px'
              }}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}

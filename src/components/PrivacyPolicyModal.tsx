'use client';

import { useEffect, useState } from 'react';
import { Poppins, Open_Sans } from 'next/font/google';
import ConfirmBtn from '@/shared/ui/confirmBtn';

const poppins = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

const openSans = Open_Sans({
  weight: ['400', '600'],
  subsets: ['latin'],
});

interface PrivacyPolicyModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

export default function PrivacyPolicyModal({ onAccept, onDecline }: PrivacyPolicyModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/30 transition-opacity duration-300">
      <div
        className={`bg-white rounded-[24px] shadow-2xl max-w-[800px] w-[90%] max-h-[90vh] overflow-hidden flex flex-col transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
        }}
      >
        {/* Header */}
        <div className="bg-white px-8 pt-8 pb-4 border-b border-[#E8E8E8]">
          <h2 className={`text-[24px] font-semibold text-[#000] ${poppins.className}`}>
            Privacy Policy
          </h2>
          <div className={`mt-2 text-[12px] text-[#535354] ${openSans.className}`}>
            <p>Effective Date: September 1, 2025</p>
            <p>Last Updated: September 4, 2025</p>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
          <div 
            className={`text-[14px] text-[#32363E] ${openSans.className}`}
            style={{
              fontFamily: 'Open Sans',
              fontWeight: 400,
              fontSize: '14px',
              lineHeight: '100%',
            }}
          >
            {/* Section 1 */}
            <div style={{ marginBottom: '10px' }}>
              <h3 className={`text-[14px] font-medium text-[#000] mb-2 ${poppins.className}`}>
                1. Information We Collect
              </h3>
              <p className="mb-2" style={{ lineHeight: '100%' }}>
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside ml-4" style={{ lineHeight: '100%' }}>
                <li style={{ marginBottom: '10px' }}>Account and billing details (name, email, payment information)</li>
                <li style={{ marginBottom: '10px' }}>Device information, IP address, logs, and usage data</li>
                <li style={{ marginBottom: '10px' }}>Content uploaded or generated through the Service</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div style={{ marginBottom: '10px' }}>
              <h3 className={`text-[14px] font-medium text-[#000] mb-2 ${poppins.className}`}>
                2. How We Use Information
              </h3>
              <p className="mb-2" style={{ lineHeight: '100%' }}>We use the information we collect to:</p>
              <ul className="list-disc list-inside ml-4" style={{ lineHeight: '100%' }}>
                <li style={{ marginBottom: '10px' }}>Operate and improve the Service</li>
                <li style={{ marginBottom: '10px' }}>Process transactions</li>
                <li style={{ marginBottom: '10px' }}>Ensure security and legal compliance</li>
                <li style={{ marginBottom: '10px' }}>Never sell personal data</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div style={{ marginBottom: '10px' }}>
              <h3 className={`text-[14px] font-medium text-[#000] mb-2 ${poppins.className}`}>
                3. Legal Basis for Processing (EU Users)
              </h3>
              <p style={{ lineHeight: '100%' }}>
                We rely on legitimate interests, consent, and legal compliance as bases for processing.
              </p>
            </div>

            {/* Section 4 */}
            <div style={{ marginBottom: '10px' }}>
              <h3 className={`text-[14px] font-medium text-[#000] mb-2 ${poppins.className}`}>
                4. Data Sharing and Disclosure
              </h3>
              <p className="mb-2" style={{ lineHeight: '100%' }}>We may share data with:</p>
              <ul className="list-disc list-inside ml-4" style={{ lineHeight: '100%' }}>
                <li style={{ marginBottom: '10px' }}>Service providers under strict agreements</li>
                <li style={{ marginBottom: '10px' }}>As required by law or court order</li>
                <li style={{ marginBottom: '10px' }}>To protect rights, safety, or property</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div style={{ marginBottom: '10px' }}>
              <h3 className={`text-[14px] font-medium text-[#000] mb-2 ${poppins.className}`}>
                5. User Rights
              </h3>
              <p className="mb-2" style={{ lineHeight: '100%' }}>
                All users may access, correct, or delete data. EU users have GDPR rights including portability and objection. 
                California users have CCPA rights including opt-out (note: we do not sell data).
              </p>
            </div>

            {/* Section 6 */}
            <div style={{ marginBottom: '10px' }}>
              <h3 className={`text-[14px] font-medium text-[#000] mb-2 ${poppins.className}`}>
                6. Data Security and Retention
              </h3>
              <p style={{ lineHeight: '100%' }}>
                We use industry-standard security. Data is retained only as long as needed for service or compliance.
              </p>
            </div>

            {/* Section 7 */}
            <div style={{ marginBottom: '10px' }}>
              <h3 className={`text-[14px] font-medium text-[#000] mb-2 ${poppins.className}`}>
                7. International Data Transfers
              </h3>
              <p style={{ lineHeight: '100%' }}>
                Transfers outside the EU are safeguarded by SCCs or adequacy decisions.
              </p>
            </div>

            {/* Section 8 */}
            <div style={{ marginBottom: '10px' }}>
              <h3 className={`text-[14px] font-medium text-[#000] mb-2 ${poppins.className}`}>
                8. Children's Privacy
              </h3>
              <p style={{ lineHeight: '100%' }}>
                Not intended for children under 16 (EU) or 13 (US). We do not knowingly collect such data.
              </p>
            </div>

            {/* Section 9 */}
            <div style={{ marginBottom: '10px' }}>
              <h3 className={`text-[14px] font-medium text-[#000] mb-2 ${poppins.className}`}>
                9. Cookies and Tracking
              </h3>
              <p style={{ lineHeight: '100%' }}>
                We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. 
                You can manage cookie preferences through your browser settings.
              </p>
            </div>
          </div>
        </div>

        {/* Footer with buttons */}
        <div className="bg-white px-8 py-6 border-t border-[#E8E8E8]">
          <div className="flex gap-4 justify-end">
            <div className="w-[140px]">
              <ConfirmBtn
                text="Decline"
                onClick={onDecline}
                isWhite
                className="h-[45px]"
                style={{
                  boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
                }}
              />
            </div>
            <div className="w-[140px]">
              <button
                onClick={onAccept}
                className="h-[45px] rounded-[12px] flex justify-center w-full items-center font-semibold text-white active:scale-90 hover:scale-98 transition-all duration-300"
                style={{
                  boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
                  background: '#627899',
                  color: '#FFFFFF',
                  fontFamily: 'Poppins',
                  fontSize: '13.284px',
                  lineHeight: '19.927px',
                }}
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


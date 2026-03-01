import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProductStore } from '@/entities/product/store';
import { useInviteMembers } from './AddMemberPopup/mutations';

interface EmailMember {
  id: string;
  email: string;
}

interface AddMemberPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (emails: string[]) => void;
  title?: string;
}

const AddMemberPopup: React.FC<AddMemberPopupProps> = ({
  isOpen,
  onClose,
  onInvite,
  title = "Invite team members"
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [emailList, setEmailList] = useState<EmailMember[]>([]);
  
  // Get current product from store
  const chosenProduct = useProductStore((state) => state.chosenProduct);
  
  // Use custom invitation hook
  const { inviteMembers, isInviting } = useInviteMembers({
    onSuccess: (emails) => {
      // Clear the form and close popup
      setEmailList([]);
      setEmailInput('');
      onClose();
      onInvite(emails);
    }
  });

  const handleAddEmail = () => {
    if (emailInput.trim() && isValidEmail(emailInput.trim())) {
      const newEmail: EmailMember = {
        id: Date.now().toString(),
        email: emailInput.trim()
      };
      
      // Check if email already exists
      if (!emailList.some(item => item.email.toLowerCase() === newEmail.email.toLowerCase())) {
        setEmailList(prev => [...prev, newEmail]);
        setEmailInput('');
      }
    }
  };

  const handleRemoveEmail = (id: string) => {
    setEmailList(prev => prev.filter(item => item.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleInvite = () => {
    if (emailList.length === 0 || !chosenProduct) return;
    
    inviteMembers(emailList, chosenProduct.id.toString());
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 w-[500px] max-w-[90vw] shadow-2xl relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Close button */}
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer text-xl"
              onClick={onClose}
            >
              ✕
            </button>

            {/* Header */}
            <h2 className="font-semibold text-lg mb-6 text-gray-900 pr-8">
              {title}
            </h2>

            {/* Email input section */}
            <div className="mb-6">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 18 19" fill="none">
                      <path d="M17.7364 17.264L13.4335 12.962C14.6806 11.4647 15.3025 9.54426 15.1698 7.60013C15.037 5.65601 14.1599 3.83789 12.7208 2.52401C11.2817 1.21012 9.39152 0.501627 7.44337 0.545902C5.49522 0.590177 3.63914 1.38382 2.26123 2.76172C0.883328 4.13963 0.0896887 5.99571 0.0454138 7.94386C0.00113894 9.89201 0.709637 11.7822 2.02352 13.2213C3.33741 14.6604 5.15552 15.5375 7.09965 15.6703C9.04377 15.803 10.9642 15.1811 12.4615 13.934L16.7635 18.2368C16.8274 18.3007 16.9033 18.3514 16.9867 18.386C17.0702 18.4205 17.1596 18.4383 17.25 18.4383C17.3403 18.4383 17.4297 18.4205 17.5132 18.386C17.5967 18.3514 17.6725 18.3007 17.7364 18.2368C17.8002 18.173 17.8509 18.0971 17.8855 18.0137C17.92 17.9302 17.9378 17.8408 17.9378 17.7504C17.9378 17.6601 17.92 17.5707 17.8855 17.4872C17.8509 17.4037 17.8002 17.3279 17.7364 17.264ZM1.43745 8.12544C1.43745 6.90167 1.80034 5.70538 2.48023 4.68785C3.16013 3.67032 4.12648 2.87725 5.2571 2.40894C6.38772 1.94062 7.63182 1.81809 8.83207 2.05683C10.0323 2.29558 11.1348 2.88488 12.0002 3.75022C12.8655 4.61555 13.4548 5.71806 13.6936 6.91832C13.9323 8.11858 13.8098 9.36268 13.3415 10.4933C12.8731 11.6239 12.0801 12.5903 11.0625 13.2702C10.045 13.9501 8.84872 14.3129 7.62495 14.3129C5.98448 14.3111 4.41173 13.6586 3.25174 12.4987C2.09175 11.3387 1.43927 9.76591 1.43745 8.12544Z" fill="#181818" fillOpacity="0.5"/>
                    </svg>
                  </div>
                  <input
                    type="email"
                    className="w-80 border-0 border-b-2 border-gray-300 rounded-none pl-8 pr-12 py-3 outline-none focus:border-[#9CA3AF] focus:ring-0 text-gray-900 bg-transparent"
                    placeholder="Enter email address"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    onClick={handleAddEmail}
                    disabled={!emailInput.trim() || !isValidEmail(emailInput.trim())}
                    className="absolute right-34 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                      <g id="SVGRepo_iconCarrier">
                        <path d="M15 11L12 8M12 8L9 11M12 8V16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#181818" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5"></path>
                      </g>
                    </svg>
                  </button>
                </div>
             
              </div>
              {emailInput && !isValidEmail(emailInput) && (
                <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
              )}
            </div>

            {/* Email list */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Members to invite ({emailList.length})
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {emailList.length === 0 ? (
                  <div className="text-gray-500 text-sm py-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
                    No members added yet
                  </div>
                ) : (
                  emailList.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center">
                        <span 
                          className="font-normal"
                          style={{
                            color: '#8D8D8D',
                            fontFamily: 'Inter',
                            fontSize: '13px',
                            fontStyle: 'normal',
                            fontWeight: 400,
                            lineHeight: '140%'
                          }}
                        >
                          {item.email}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveEmail(item.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M18 6L6 18M6 6L18 18"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end">
              <button
                onClick={handleInvite}
                disabled={emailList.length === 0 || isInviting || !chosenProduct}
                className="px-6 py-2 transition-colors"
                style={{
                  borderRadius: '12px',
                  backgroundColor: '#EAEDF2',
                  boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)',
                  cursor: emailList.length === 0 || isInviting || !chosenProduct ? 'not-allowed' : 'pointer',
                  opacity: emailList.length === 0 || isInviting || !chosenProduct ? 0.5 : 1,
                  color: '#535354',
                  fontFamily: 'Poppins',
                  fontSize: '13.284px',
                  fontStyle: 'normal',
                  fontWeight: 600,
                  lineHeight: '19.927px'
                }}
              >
                {isInviting ? 'Inviting...' : 'Invite'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddMemberPopup;

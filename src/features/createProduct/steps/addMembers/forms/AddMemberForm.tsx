'use client';

import { useSendProductInvitation } from '@/entities/invitation';
import { useProductStore } from '@/entities/product/store';
import { useCreationProductStore } from '@/features/createProduct/store';
import useWindowSize from '@/hooks/useWindowSize';
import useLoginStore from '@/store/TO_DELETE/loginStore';
import { useCallback, useEffect, useState } from 'react';
import BatchAdd from '../modalWindows/batchAdd';
import ShareableLink from '../modalWindows/shareableLink';

const AddMemberForm: React.FC = () => {
  const { members, addMember } = useCreationProductStore();
  const { height } = useWindowSize();
  const { user: loggedUser } = useLoginStore();
  const { chosenProduct } = useProductStore();
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);

  const sendInvitationMutation = useSendProductInvitation();

  const membersBlockHeight = `
  ${height > 650 ? 'h-[250px]' : ''} 
  ${height > 730 ? 'h-[350px]' : ''}
  ${height > 1070 ? 'h-[550px]' : ''}`;

  const sendInvitation = useCallback(async (member: any) => {
    if (!chosenProduct?.id || member.isOwner || !member.email) {
      return;
    }

    const currentMembers = useCreationProductStore.getState().members;
    const currentMember = currentMembers.find(m => m.email === member.email);
    const memberName = currentMember?.name || member.name || '';

    try {
      await sendInvitationMutation.mutateAsync({
        productId: chosenProduct.id,
        email: member.email,
        name: memberName,
        role: member.position
      });
    } catch (error) {
      // Handle error silently
    }
  }, [chosenProduct?.id, sendInvitationMutation]);

  const addMemberWithInvitation = useCallback((member: any) => {
    const existingMemberIndex = members.findIndex(m => m.email === member.email);
    if (existingMemberIndex !== -1) {
      const updatedMembers = [...members];
      updatedMembers[existingMemberIndex].name = member.name;
      updatedMembers[existingMemberIndex].position = member.position;
      useCreationProductStore.getState().setMembers(updatedMembers);
    } else {
      addMember(member);
    }

    if (!member.isOwner && member.email && chosenProduct?.id) {
      setTimeout(() => {
        sendInvitation(member);
      }, 1000);
    }
  }, [addMember, chosenProduct?.id, sendInvitation, members]);

  useEffect(() => {
    if (loggedUser && !members.some(member => member.email === loggedUser.email)) {
      addMember({
        name: loggedUser.name || '',
        email: loggedUser.email || '',
        position: loggedUser.position || 'PM',
        isOwner: true,
      });
    }
  }, [loggedUser, members, addMember]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.dropdown-container')) {
        setOpenDropdownIndex(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <form>
      <div className="flex items-center justify-between mb-4 pt-10 text-[#4E6DB3] font-bold px-8">
        <div className="w-[150px]">
          <button
            type="button"
            onClick={() =>
              addMemberWithInvitation({
                name: 'New Member',
                email: '',
                position: 'PM',
                isOwner: false,
              })
            }
            className="hover:underline cursor-pointer text-[13px]"
          >
            Add
          </button>
        </div>
        <div className="w-[150px]">
          <BatchAdd />
        </div>
        <div className="w-[250px] ">
          <ShareableLink />
        </div>
        <div className="w-[290px] ml-2">
          <span className="text-[13px] ">Role</span>
        </div>
      </div>

      <div
        className={`overflow-y-auto h-[200px] px-8 ${membersBlockHeight} custom-scrollbar`}
      >
        {members.map((member, index) => (
          <div
            key={index}
            className="flex items-center justify-between mt-5 text-[#535354] text-[13px]"
          >
            <div className="w-[150px]">
              <input
                type="text"
                placeholder="Name"
                value={member.name}
                onChange={(e) => {
                  const updated = [...members];
                  updated[index].name = e.target.value;
                  useCreationProductStore.getState().setMembers(updated);
                }}
                disabled={member.isOwner}
                className="border-0 outline-0 w-full border-b-1 pb-2 border-gray-300"
              />
            </div>
            <div className="w-[150px]"></div>
            <div className="w-[250px] ">
              <input
                type="email"
                placeholder="Email"
                value={member.email}
                onChange={(e) => {
                  const updated = [...members];
                  updated[index].email = e.target.value;
                  useCreationProductStore.getState().setMembers(updated);
                }}
                disabled={member.isOwner}
                className="border-0 outline-0 w-full border-b-1 pb-2 border-gray-300"
              />
            </div>
            <div className="relative w-[290px] dropdown-container ">
              <div
                className="border-0 outline-0 w-full border-b-1 border-gray-300 mt-[-1px] bg-white appearance-none pr-8 py-2 px-1 text-[14px]"
                style={{ color: '#535354' }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenDropdownIndex(openDropdownIndex === index ? null : index);
                }}
              >
                {member.position === 'PM' ? 'Product Manager' :
                  member.position === 'Design' ? 'Designer' :
                    member.position === 'Engineer' ? 'Engineer/QA' :
                      member.position === 'Founder' ? 'Founder / CEO / CPO' : 'Product Manager'}
              </div>

              {openDropdownIndex === index && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-lg shadow-lg z-10 mt-1">
                  {[
                    { value: 'PM', label: 'Product Manager' },
                    { value: 'Design', label: 'Designer' },
                    { value: 'Engineer', label: 'Engineer/QA' },
                    { value: 'Founder', label: 'Founder / CEO / CPO' },
                  ].map((option, optionIndex) => (
                    <div
                      key={optionIndex}
                      className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${member.position === option.value
                        ? 'bg-[#EAEDF2] text-gray-900'
                        : ''
                        }`}
                      onClick={() => {
                        const updated = [...members];
                        updated[index].position = option.value;
                        useCreationProductStore.getState().setMembers(updated);
                        setOpenDropdownIndex(null);
                      }}
                    >
                      {option.label}
                    </div>
                  ))}
                </div>
              )}

              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                {openDropdownIndex === index ? (
                  <svg width="12" height="12" viewBox="0 0 14 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.9233 1.0481L7.29834 6.6731C7.21924 6.7521 7.11202 6.79648 7.00022 6.79648C6.88842 6.79648 6.7812 6.7521 6.70209 6.6731L1.07709 1.0481C1.00257 0.968126 0.962005 0.862351 0.963933 0.753056C0.965861 0.643762 1.01014 0.539483 1.08743 0.462188C1.16473 0.384893 1.26901 0.340617 1.3783 0.338689C1.48759 0.33676 1.59337 0.37733 1.67334 0.45185L7.00022 5.77802L12.3271 0.45185C12.4071 0.37733 12.5128 0.33676 12.6221 0.338689C12.7314 0.340617 12.8357 0.384893 12.913 0.462188C12.9903 0.539483 13.0346 0.643762 13.0365 0.753056C13.0384 0.862351 12.9979 0.968126 12.9233 1.0481Z" fill="#627899" />
                  </svg>
                ) : (
                  <svg
                    width="12" height="12"
                    style={{ flexShrink: 0 }}
                    viewBox="0 0 7 13"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M5.95166 12.4231L0.326655 6.7981C0.247652 6.719 0.203276 6.61177 0.203276 6.49997C0.203276 6.38818 0.247652 6.28095 0.326655 6.20185L5.95166 0.57685C6.03163 0.50233 6.13741 0.46176 6.2467 0.463689C6.35599 0.465617 6.46027 0.509892 6.53757 0.587187C6.61486 0.664482 6.65914 0.768761 6.66107 0.878056C6.663 0.98735 6.62243 1.09313 6.54791 1.1731L1.22173 6.49997L6.54791 11.8268C6.62243 11.9068 6.66299 12.0126 6.66107 12.1219C6.65914 12.2312 6.61486 12.3355 6.53757 12.4128C6.46027 12.4901 6.35599 12.5343 6.2467 12.5363C6.1374 12.5382 6.03163 12.4976 5.95166 12.4231Z" fill="#627899" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </form>
  );
};

export default AddMemberForm;

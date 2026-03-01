'use client';

import useLoginStore from '@/store/TO_DELETE/loginStore';
import Modal from '@/shared/portals/ModalWindow';
import { Open_Sans, Poppins } from 'next/font/google';
import Image from 'next/image';
import PencilIcon from '@/shared/icons/PencilIcon';
import { useUserProfile, useProfileStore } from '@/entities/user';
import { useEffect } from 'react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const OpenSans400 = Open_Sans({
  weight: ['400'],
  subsets: ['cyrillic'],
});

const OpenSans600 = Open_Sans({
  weight: ['600'],
  subsets: ['cyrillic'],
});

const Poppins600 = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useLoginStore();
  const { data: profile, isLoading, error } = useUserProfile(isOpen);
  const { setProfile } = useProfileStore();

  // Update store when profile data is fetched
  useEffect(() => {
    if (profile) {
      setProfile(profile);
    }
  }, [profile, setProfile]);

  if (!isOpen) return null;

  // Show loading state with skeleton loader
  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div
          className="bg-white w-[calc(100vw-40px)] max-w-[90vw] max-h-[85vh] mx-auto rounded-[24px] shadow-lg overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
          style={{
            animation: 'fadeIn 0.4s ease-out',
          }}
        >
          {/* Profile Title Skeleton */}
          <div className="px-10 pt-8 pb-4 flex-shrink-0">
            <div className="h-8 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            {/* Inner Card with blue header */}
            <div className="bg-white rounded-[16px] overflow-hidden">
              {/* Header Section - Light Blue Grey */}
              <div className="bg-[#C5CFE0] px-10 pt-12 pb-10 relative">
                {/* Profile Picture Skeleton */}
                <div className="flex justify-center">
                  <div 
                    className="w-[130px] h-[130px] rounded-full bg-gray-300 animate-pulse"
                    style={{
                      border: '3px solid #FFF',
                      boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
                    }}
                  ></div>
                </div>

                {/* Edit Profile Button Skeleton */}
                <div className="absolute top-6 right-6">
                  <div className="w-[135px] h-[38px] bg-white rounded-[12px] animate-pulse"></div>
                </div>
              </div>

              {/* Body Section - White */}
              <div 
                className="bg-white px-10 py-6"
                style={{
                  borderLeft: '1px solid #000',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  borderRadius: '0 0 16px 16px',
                }}
              >
                {/* Four Column Layout Skeleton */}
                <div className="grid grid-cols-4 gap-4">
                  {/* Left Column Skeleton */}
                  <div>
                    <div className="mb-6">
                      {/* Name Skeleton */}
                      <div className="h-7 w-40 bg-gray-200 rounded mb-4 animate-pulse"></div>
                      {/* Status Label Skeleton */}
                      <div className="h-4 w-16 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      {/* Time Zone Label Skeleton */}
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>

                    {/* About Section Skeleton */}
                    <div className="mb-6">
                      <div className="h-4 w-12 bg-gray-200 rounded mb-3 animate-pulse"></div>
                      <div className="flex flex-col gap-2">
                        <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>

                    {/* Contact Information Section Skeleton */}
                    <div>
                      <div className="h-4 w-32 bg-gray-200 rounded mb-3 animate-pulse"></div>
                      <div className="flex flex-col gap-2">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Values Skeleton */}
                  <div>
                    <div className="mb-6">
                      {/* Role Skeleton */}
                      <div className="h-4 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
                      {/* Status Value Skeleton */}
                      <div className="h-4 w-16 bg-gray-200 rounded mb-2 animate-pulse"></div>
                      {/* Time Zone Value Skeleton */}
                      <div className="h-4 w-48 bg-gray-200 rounded mb-6 animate-pulse"></div>
                    </div>

                    {/* About Values Skeleton */}
                    <div className="mb-6">
                      <div className="mb-3 opacity-0">
                        <div className="h-4 w-1 bg-transparent"></div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>

                    {/* Contact Information Values Skeleton */}
                    <div>
                      <div className="mb-3 opacity-0">
                        <div className="h-4 w-1 bg-transparent"></div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Third Column - Address Label Skeleton */}
                  <div>
                    <div className="mb-6">
                      <div className="h-4 w-16 bg-gray-200 rounded mb-4 animate-pulse"></div>
                    </div>
                  </div>

                  {/* Fourth Column - Address Value Skeleton */}
                  <div>
                    <div className="mb-6">
                      <div className="mb-4">
                        <div className="h-4 w-48 bg-gray-200 rounded mb-2 animate-pulse"></div>
                        <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  // Show error state
  if (error || !profile) {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <div className="bg-white w-[calc(100vw-40px)] max-w-[90vw] max-h-[85vh] mx-auto rounded-[24px] shadow-lg overflow-hidden flex flex-col items-center justify-center p-10">
          <div className="text-lg text-red-600">
            {error ? 'Failed to load profile. Please try again.' : 'Profile not found.'}
          </div>
        </div>
      </Modal>
    );
  }

  // Get user's first name and last initial
  const nameParts = profile.name?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  const displayName = lastName ? `${firstName} ${lastName.charAt(0)}.` : firstName;

  // Format role/position - Convert underscores to spaces and capitalize
  const formatRole = (role: string) => {
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };
  const roleDisplay = formatRole(profile.role || 'User');

  // Format status - capitalize first letter
  const statusDisplay = profile.status 
    ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1).toLowerCase()
    : 'Away';

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div
        className="bg-white w-[calc(100vw-40px)] max-w-[90vw] max-h-[85vh] mx-auto rounded-[24px] shadow-lg overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: 'fadeIn 0.4s ease-out',
        }}
      >
          {/* Profile Title */}
          <div className="px-10 pt-8 pb-4 flex-shrink-0">
            <h1 className={`text-[32px] font-semibold text-black ${Poppins600.className}`}>
              Profile
            </h1>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto px-8 pb-8">
            {/* Inner Card with blue header */}
            <div className="bg-white rounded-[16px] overflow-hidden">
              {/* Header Section - Light Blue Grey */}
              <div className="bg-[#C5CFE0] px-10 pt-12 pb-10 relative">
                {/* Profile Picture */}
                <div className="flex justify-center">
                  <div 
                    className="w-[130px] h-[130px] overflow-hidden bg-lightgray"
                    style={{
                      borderRadius: '65px',
                      border: '3px solid #FFF',
                      boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    {profile.avatar ? (
                      <Image
                        src={profile.avatar}
                        alt="Profile"
                        width={130}
                        height={130}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image
                        src="/Ellipse 5.svg"
                        alt="Profile"
                        width={130}
                        height={130}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                </div>

                {/* Edit Profile Button */}
                <div className="absolute top-6 right-6">
                  <button
                    className="flex items-center justify-center gap-2 bg-white rounded-[12px] hover:bg-gray-50 transition-colors"
                    style={{
                      width: '135px',
                      height: '38px',
                    }}
                    onClick={() => {
                      // TODO: Implement edit profile functionality
                      console.log('Edit profile clicked');
                    }}
                  >
                    <span 
                      className={`text-[14px] font-semibold text-black ${OpenSans600.className}`}
                      style={{
                        lineHeight: '150%',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Edit Profile
                    </span>
                    <PencilIcon size={16} color="#000" />
                  </button>
                </div>
              </div>

              {/* Body Section - White */}
              <div 
                className="bg-white px-10 py-6"
                style={{
                  borderLeft: '1px solid #000',
                  borderRight: '1px solid #000',
                  borderBottom: '1px solid #000',
                  borderRadius: '0 0 16px 16px',
                }}
              >
                {/* Four Column Layout */}
                <div className="grid grid-cols-4 gap-4">
                  {/* Left Column */}
                  <div>
                    {/* User Name */}
                    <div className="mb-6">
                      <h2 className={`text-[24px] font-semibold text-[#181818] leading-[140%] mb-4 ${Poppins600.className}`}>
                        {displayName}
                      </h2>
                      
                      {/* Status */}
                      <div className="mb-2">
                        <span className={`text-[12px] text-[#737373] font-normal ${OpenSans400.className}`}>Status</span>
                      </div>
                      
                      {/* Time Zone */}
                      <div>
                        <span className={`text-[12px] text-[#737373] font-normal ${OpenSans400.className}`}>Time Zone</span>
                      </div>
                    </div>

                    {/* About Section */}
                    <div className="mb-6">
                      <h3 className={`text-[12px] font-normal text-[#181818] mb-3 ${OpenSans400.className}`}>
                        About
                      </h3>
                      <div className="flex flex-col gap-2">
                        <div>
                          <span className={`text-[12px] text-[#737373] font-normal ${OpenSans400.className}`}>
                            In Progress Products
                          </span>
                        </div>
                        <div>
                          <span className={`text-[12px] text-[#737373] font-normal ${OpenSans400.className}`}>
                            In Progress Vehicles
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Section */}
                    <div>
                      <h3 className={`text-[12px] font-normal text-[#181818] mb-3 ${OpenSans400.className}`}>
                        Contact Information
                      </h3>
                      <div className="flex flex-col gap-2">
                        <div>
                          <span className={`text-[12px] text-[#737373] font-normal ${OpenSans400.className}`}>Number</span>
                        </div>
                        <div>
                          <span className={`text-[12px] text-[#737373] font-normal ${OpenSans400.className}`}>Email</span>
                        </div>
                        <div>
                          <span className={`text-[12px] text-[#737373] font-normal ${OpenSans400.className}`}>Password</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Values */}
                  <div>
                    {/* Role */}
                    <div className="mb-6">
                      <div className="mb-4">
                        <span 
                          className={`text-[12px] font-normal ${OpenSans400.className}`}
                          style={{
                            background: 'linear-gradient(94deg, #2086FE 1.16%, #AB55DC 93.59%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}
                        >
                          {roleDisplay}
                        </span>
                      </div>
                      
                      {/* Status Value */}
                      <div className="mb-2">
                        <span className={`text-[12px] text-[#737373] font-normal ${OpenSans400.className}`}>
                          {statusDisplay}
                        </span>
                      </div>
                      
                      {/* Time Zone Value */}
                      <div className="mb-6">
                        <span className={`text-[12px] text-[#737373] font-normal ${OpenSans400.className}`}>
                          {profile.currentTime || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* About Values - Empty space to maintain alignment */}
                    <div className="mb-6">
                      <div className="mb-3 opacity-0">
                        <span className={`text-[12px] ${OpenSans400.className}`}>.</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div>
                          <span className={`text-[12px] text-[#5B8DFF] font-normal ${OpenSans400.className}`}>
                            {profile.inProgressProducts}
                          </span>
                        </div>
                        <div>
                          <span className={`text-[12px] text-[#5B8DFF] font-normal ${OpenSans400.className}`}>
                            {profile.inProgressVehicles}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information Values */}
                    <div>
                      <div className="mb-3 opacity-0">
                        <span className={`text-[12px] ${OpenSans400.className}`}>.</span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div>
                          <span className={`text-[12px] text-[#737373] font-normal ${OpenSans400.className}`}>
                            {profile.phone || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className={`text-[12px] text-[#737373] font-normal ${OpenSans400.className}`}>
                            {profile.email || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className={`text-[12px] text-[#737373] font-normal ${OpenSans400.className}`}>
                            *********
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Third Column - Address Label */}
                  <div>
                    <div className="mb-6">
                      {/* Address Label - aligned with name */}
                      <div className="mb-4">
                        <span className={`text-[12px] text-[#737373] font-normal ${OpenSans400.className}`}>Address</span>
                      </div>
                    </div>
                  </div>

                  {/* Fourth Column - Address Value */}
                  <div>
                    <div className="mb-6">
                      {/* Address Value - aligned with name */}
                      <div className="mb-4">
                        {profile.address && profile.address.length > 0 ? (
                          <div className="text-[12px] text-[#737373] font-normal leading-relaxed">
                            {profile.address.map((line, index) => (
                              <p key={index} className={`${OpenSans400.className}`}>
                                {line}
                              </p>
                            ))}
                          </div>
                        ) : (
                          <div className="text-[12px] text-[#737373] font-normal leading-relaxed">
                            <p className={`${OpenSans400.className}`}>N/A</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </Modal>
  );
};

export default ProfileModal;


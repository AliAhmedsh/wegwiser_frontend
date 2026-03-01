import { useProductMembersQuery } from '@/entities/product';
import PeopleCard from '@/shared/ui/peopleCard';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { showToast } from '@/lib/utils/toast';

interface ShareModalProps {
  onClose: () => void
  productId: number;
  currentDocument?: {
    id: number;s
    title: string;
    content: string;
    type: string;
  } | null;
}

export default function ShareModal({ onClose, productId, currentDocument }: ShareModalProps) {
  const [search, setSearch] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const { data: membersResponse, isLoading: membersLoading } = useProductMembersQuery(productId, !!productId);
  const [isSharing, setIsSharing] = useState(false);

  const members = membersResponse?.members?.map((member) => ({
    id: member.user.id,
    name: member.user.name,
    role: member.role,
    filledLevels: 2,
    imageLink: '/Ellipse 5.svg',
    email: member.user.email,
  })) || [];

  const filtered = members.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserSelect = (userId: string | number) => {
    const userIdStr = String(userId);
    setSelectedUserIds((prev) =>
      prev.includes(userIdStr)
        ? prev.filter(id => id !== userIdStr)
        : [...prev, userIdStr]
    );
  };

  const handleShare = async () => {
    if (selectedUserIds.length === 0) {
      showToast.warning('Please select at least one team member');
      return;
    }

    if (!currentDocument) {
      showToast.warning('No file is currently open. Please select a file to share.');
      return;
    }

    setIsSharing(true);
    const toastId = showToast.loading('Sending file...');
    
    try {
      // Get selected users' emails
      const selectedUsers = members.filter(m => selectedUserIds.includes(String(m.id)));
      const emails = selectedUsers.map(u => u.email);

      console.log('Sharing file:', currentDocument.title);
      console.log('With users:', emails);

      // Call API to send file as PDF via email
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/workspace/share-file`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${document.cookie.split('access_token=')[1]?.split(';')[0] || document.cookie.split('token=')[1]?.split(';')[0]}`,
          },
          body: JSON.stringify({
            fileId: currentDocument.id,
            fileTitle: currentDocument.title,
            fileContent: currentDocument.content,
            fileType: currentDocument.type,
            emails: emails,
            productId: productId
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        showToast.updateSuccess(toastId, `File "${currentDocument.title}" has been sent to ${emails.length} team member(s)!`);
        onClose();
      } else {
        showToast.updateError(toastId, 'Failed to share file: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Failed to share:', error);
      showToast.updateError(toastId, 'Failed to share file. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-2xl p-4 w-[549px] max-w-full shadow-2xl relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer text-xl"
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="font-semibold text-base mb-4 text-gray-900">
            Share with team members
          </h2>
          {selectedUserIds.length > 0 && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Selected {selectedUserIds.length} member{selectedUserIds.length > 1 ? 's' : ''}
              </p>
            </div>
          )}
          <div className='max-w-[317px] mb-6'>
            <input
              className="gradient-input border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#7B8FFF] text-gray-900 w-full"
              placeholder="Search here"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '7px' }}
            />
          </div>

          <div className="flex gap-4 flex-wrap mb-10 max-h-[300px] overflow-y-auto p-1">
            {membersLoading ? (
              <div className="w-full text-center py-4 text-gray-500">
                Loading members...
              </div>
            ) : filtered.length === 0 ? (
              <div className="w-full text-center py-4 text-gray-500">
                {members.length === 0
                  ? 'No members found for this product'
                  : 'No members match your search'
                }
              </div>
            ) : (
              filtered.map((member) => (
                <div
                  key={member.id}
                  onClick={() => handleUserSelect(member.id)}
                  className={`cursor-pointer transition-all duration-200 ${selectedUserIds.includes(member.id)
                    ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl'
                    : 'hover:scale-105'
                    }`}
                >
                  <PeopleCard
                    imageLink={member.imageLink}
                    name={member.name}
                    role={member.role}
                    filledLevels={member.filledLevels}
                  />
                </div>
              ))
            )}
          </div>
          <button
            className={`px-6 py-2 float-right font-semibold transition-colors ${selectedUserIds.length > 0 && !isSharing
              ? 'bg-[#EAEDF2] text-[#535354] hover:bg-[#D9DCE3] cursor-pointer'
              : 'bg-[#EAEDF2] text-gray-400 cursor-not-allowed opacity-50'
              }`}
            style={{
              borderRadius: '12px',
              boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)',
            }}
            onClick={handleShare}
            disabled={selectedUserIds.length === 0 || isSharing}
          >
            {isSharing ? 'Sharing...' : 'Share'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}


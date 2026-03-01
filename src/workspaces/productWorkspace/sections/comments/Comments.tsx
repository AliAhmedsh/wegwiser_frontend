import { useProductStore } from '@/entities/product/store';
import { formatRole } from '@/lib/utils/formatRole';
import { useProductWorkspaceStore } from '@/store/productWorkspaceStore';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { workspaceDocumentService } from '../../api/workspaceDocumentService';
import Spinner from '@/shared/ui/Spinner';

import Comment from './ui/Comment';

interface CommentData {
  avatarUrl?: string;
  nickname: string;
  title: string;
  body: string;
  time: string;
  id: number;
}

const Comments: React.FC = () => {
  const { currentDocument } = useProductWorkspaceStore();
  const { chosenProduct } = useProductStore();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadComments = async () => {
      if (!currentDocument?.id || !chosenProduct?.id) {
        setComments([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        let response;
        
        // Use different API based on file type
        if (currentDocument.type === 'swot') {
          // SWOT files use their own comments API
          response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/swot-files/product/${chosenProduct.id}/files/${currentDocument.id}/comments`,
            {
              headers: {
                'Authorization': `Bearer ${document.cookie.split('access_token=')[1]?.split(';')[0] || document.cookie.split('token=')[1]?.split(';')[0]}`,
              }
            }
          );
          const data = await response.json();
          response = data;
        } else {
          // Workspace documents use the existing API
          response = await workspaceDocumentService.getDocumentComments(
            chosenProduct.id,
            currentDocument.id
          );
        }
        
        if (response.success) {
          const transformedComments: CommentData[] = response.comments.map((comment: any) => ({
            id: comment.id,
            nickname: comment.author.name,
            title: formatRole(comment.author.role),
            body: comment.content,
            time: new Date(comment.createdAt).toLocaleDateString() + ' ' + new Date(comment.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
            avatarUrl: undefined
          }));
          // Set both comments and loading state together to avoid flash
          setComments(transformedComments);
          setIsLoading(false);
        } else {
          setComments([]);
          setIsLoading(false);
        }
      } catch (error) {
        setComments([]);
        setIsLoading(false);
      }
    };

    loadComments();
  }, [currentDocument?.id, currentDocument?.type, chosenProduct?.id]);

  const handleDelete = async (id: number) => {
    try {
      const response = await workspaceDocumentService.deleteComment(id);
      if (response.success) {
        const updatedCommentsList = comments.filter((comment) => comment.id !== id);
        setComments(updatedCommentsList);
      }
    } catch (error) {
    }
  };

  const handleCreateComment = async () => {
    if (!newCommentText.trim() || !currentDocument?.id || !chosenProduct?.id) return;

    setIsSubmitting(true);
    try {
      let response;
      
      // Use different API based on file type
      if (currentDocument.type === 'swot') {
        // SWOT files use their own comments API
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/swot-files/product/${chosenProduct.id}/files/${currentDocument.id}/comments`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${document.cookie.split('access_token=')[1]?.split(';')[0] || document.cookie.split('token=')[1]?.split(';')[0]}`,
            },
            body: JSON.stringify({ content: newCommentText.trim() })
          }
        );
        response = await res.json();
      } else {
        // Workspace documents use the existing API
        response = await workspaceDocumentService.addDocumentComment(
          chosenProduct.id,
          currentDocument.id,
          newCommentText.trim()
        );
      }
      
      if (response.success) {
        const newComment: CommentData = {
          id: response.comment.id,
          nickname: response.comment.author.name,
          title: formatRole(response.comment.author.role) || 'User',
          body: response.comment.content,
          time: new Date(response.comment.createdAt).toLocaleDateString() + ' ' + new Date(response.comment.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }),
          avatarUrl: undefined
        };
        setComments(prev => [...prev, newComment]);
        setNewCommentText('');
        setShowCreatePopup(false);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-2/8 bg-[#fff] rounded-md overflow-hidden">
      <div className="absolute inset-0 bg-transparent pointer-events-none"></div>
      <div className="h-full px-4 py-6 overflow-y-scroll">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-md font-semibold">Comments</h2>
          <button
            onClick={() => setShowCreatePopup(true)}
            className="w-8 h-8 text-black flex items-center justify-center hover:text-gray-600 transition-colors text-lg"
          >
            +
          </button>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center w-full h-full" style={{ minHeight: '60vh' }}>
            <div className="flex items-center gap-2 text-[#9D9D9D]">
              <Spinner size="md" />
              <span className="text-sm">Loading comments...</span>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-500">No comments yet</div>
        ) : (
          comments.map((comment, index) => (
            <Comment
              key={index}
              nickname={comment.nickname}
              title={comment.title}
              body={comment.body}
              time={comment.time}
              onDelete={() => handleDelete(comment.id)}
            />
          ))
        )}
      </div>

      {showCreatePopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent">
          <div className="bg-white rounded-[12px] p-4 w-[300px] shadow-2xl" style={{ border: '1px solid rgba(0,0,0,0.3)' }}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-base font-semibold">Comments</h3>
              <button
                onClick={() => {
                  setShowCreatePopup(false);
                  setNewCommentText('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="relative rounded-[8px] border border-[rgba(0,0,0,0.3)] p-3">
              <textarea
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder=""
                className="border-none outline-none w-full resize-none"
                rows={4}
                disabled={isSubmitting}
              />
              <div className="absolute bottom-1 right-1 w-3 h-3 opacity-30">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M12 12L12 8L8 12L12 12Z" fill="#666" />
                  <path d="M12 12L12 4L4 12L12 12Z" fill="#666" />
                  <path d="M12 12L12 0L0 12L12 12Z" fill="#666" />
                </svg>
              </div>
            </div>
            <div className="pt-4 flex justify-between items-center">
              <div className="flex gap-4">
                <Image
                  src={'/icons/polish-text.svg'}
                  alt="polish text"
                  height={20}
                  width={20}
                  className="hover:scale-90 active:scale-85 cursor-pointer transition-all"
                />
                <Image
                  src={'/icons/fix-grammar.svg'}
                  alt="fix grammar"
                  height={24}
                  width={24}
                  className="hover:scale-90 active:scale-85 cursor-pointer transition-all"
                />
                <Image
                  src={'/icons/auto-fix.svg'}
                  alt="expand with AI"
                  height={24}
                  width={24}
                  className="hover:scale-95 active:scale-85 cursor-pointer transition-all"
                />
              </div>
              <div className="flex items-center justify-end">
                <button
                  onClick={handleCreateComment}
                  disabled={!newCommentText.trim() || isSubmitting}
                  className={`w-[90px] h-[34px] rounded-[12px] bg-[#EAEDF2] text-[#535354] font-semibold text-sm shadow-[2px_2px_2px_rgba(167,177,196,0.6),-2px_-2px_2px_rgba(255,255,255,1)] transition-all ${!newCommentText.trim() || isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#D9DCE3] cursor-pointer'}`}
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Comments;

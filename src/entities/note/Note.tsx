'use client';
import { NoteProps } from './types';
import Image from 'next/image';
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Draggable from 'react-draggable';
import { DynamicMovement } from '@/lib/konva/utils';
import { Object2D } from '@/lib/konva/types';
import { useCanvasStore } from '@/sections/home/canvasStore';
import { useNoteStore } from '@/entities/note/store';
import MentionButton from './forms/ui/MentionButton';
import { getCookie } from '@/lib/config/api';
import { jwtDecode } from 'jwt-decode';
import { createPortal } from 'react-dom';
import { useProductStore } from '@/entities/product/store';

const Note: React.FC<NoteProps> = React.memo(function NoteComponent({
  id,
  title,
  text,
  owner,
  ownerId,
  date,
  time,
  x,
  y,
  createdAt,
  updatedAt,
  productId,
  vehicleId,
}) {
  const [isPreview, setIsPreview] = useState<boolean>(true);
  const [position, setPosition] = useState<Object2D>({ x: x, y: y });
  const scale = useCanvasStore((State) => State.scale);
  const { updateNotePosition, deleteNote } = useNoteStore();
  const { chosenProduct } = useProductStore();
  // vehicleId removed - notes are only linked to products
  const [isDragging, setIsDragging] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [isDeleting, setIsDeleting] = useState(false);
  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const nodeRef = useRef<HTMLDivElement>(
    null!
  ) as React.RefObject<HTMLDivElement>;

  const handleMentionAdded = () => {
    console.log('Mentions added to note:', id);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const formatRole = (role?: string) => {
    if (!role) return 'User';
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'N/A';
    }
  };

  const getOwnerName = () => {
    if (owner && typeof owner === 'object' && owner.name) {
      return owner.name;
    }
    return 'Unknown Owner';
  };

  const getInitials = (ownerData?: { id: string; name: string; email: string }) => {
    if (!ownerData || !ownerData.name) return '?';
    return ownerData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getFirstLastInitials = (ownerData?: { id: string; name: string; email: string }) => {
    if (!ownerData || !ownerData.name) return '??';
    const name = ownerData.name.trim();
    if (name.length === 0) return '??';
    
    const nameParts = name.split(' ').filter(part => part.length > 0);
    if (nameParts.length === 0) return '??';
    if (nameParts.length === 1) return nameParts[0][0].toUpperCase() + '.';
    
    const firstChar = nameParts[0][0].toUpperCase();
    const lastChar = nameParts[nameParts.length - 1][0].toUpperCase();
    return firstChar + '.' + lastChar;
  };

  // Check if current user is the owner
  const checkIsOwner = () => {
    const token = getCookie('access_token') || getCookie('token');
    if (!token) return false;
    
    try {
      const decoded: any = jwtDecode(token);
      
      // Try multiple possible email locations in the JWT
      const currentUserEmail = decoded.email || 
                              decoded['https://wegwiser-api/email'] || 
                              decoded['http://wegwiser-api/email'] ||
                              decoded['https://wegwiser.ai/email'] ||
                              decoded['http://wegwiser.ai/email'];
      
      // Check by email (most reliable)
      if (currentUserEmail && owner?.email === currentUserEmail) {
        return true;
      }
      
      // Check by ID - backend still enforces permissions
      if (decoded.id) {
        return Number(decoded.id) === Number(ownerId) || Number(decoded.id) === Number(owner?.id);
      }
      if (decoded.sub) {
        // Allow showing the menu; backend will block unauthorized deletes
        return true;
      }
    } catch (error) {
      console.error('Error checking ownership:', error);
    }
    
    return false;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isOwner = checkIsOwner();
    
    if (isOwner) {
      setContextMenuPosition({ x: e.clientX, y: e.clientY });
      setShowContextMenu(true);
    }
  };

  const handleDeleteNote = async () => {
    if (id) {
      setIsDeleting(true);
      try {
        // Send productId, vehicleId, and taskId with delete request
        await deleteNote(id, chosenProduct?.id, undefined); // taskId is undefined for now, vehicleId removed
      } finally {
        setIsDeleting(false);
      }
      setShowContextMenu(false);
    }
  };

  // Close context menu when clicking anywhere
  React.useEffect(() => {
    const handleClick = () => {
      setShowContextMenu(false);
    };
    if (showContextMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showContextMenu]);

  const displayDate = date || createdAt;
  const displayTime = time || updatedAt;

  if (!nodeRef) {
    return <>loading</>;
  }

  return (
    <>
      <Draggable
      position={position}
      onStart={(e, data) => {
        dragStartPos.current = { x: data.x, y: data.y };
        setIsDragging(false);
      }}
      onDrag={(e, data) => {
        e.stopPropagation();
        if (dragStartPos.current) {
          const dx = Math.abs(data.x - dragStartPos.current.x);
          const dy = Math.abs(data.y - dragStartPos.current.y);
          if (dx > 5 || dy > 5) setIsDragging(true);
        }
        DynamicMovement(position, scale, data, setPosition);
      }}
      onStop={() => {
        dragStartPos.current = null;
        setTimeout(() => setIsDragging(false), 100);
        updateNotePosition(id!, position.x, position.y);
      }}
      nodeRef={nodeRef}
    >
      <div
        className="absolute w-[50px] active:cursor-grab"
        key={id}
        ref={nodeRef}
        onContextMenu={handleContextMenu}
      >
        <AnimatePresence mode="wait">
          {isPreview ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="cursor-pointer transition-all border h-[50px] w-[50px]"
              onClick={() => {
                if (isDragging) return;
                setIsPreview(false);
              }}
            >
              <div className="w-[40px] h-[40px] absolute border bg-black ml-[-15px] mt-[-20px] flex justify-center items-center rounded-full">
                <Image
                  src={'/icons/user-mock-icon.svg'}
                  alt="user"
                  height={20}
                  width={20}
                />
              </div>
              <div className="w-[50px] h-[50px] border rounded-[4px] shadow-[0_0_10px_0_#00000026] justify-center text-[18px] flex items-center">
                <div className="mt-1 font-semibold">
                  {getFirstLastInitials(owner)}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="bg-white p-3 border border-[rgba(0,0,0,0.3)] min-w-[250px] max-w-[300px] rounded-[12px]"
            >
              <div className="flex justify-between">
                <div className="flex">
                  <div className="h-[30px] w-[30px] rounded-full border mt-0.5 flex items-center justify-center">
                    {getInitials(owner)}
                  </div>
                  <div className="ml-2">
                    <div className="text-[14px] mt-1.5 font-medium">{getOwnerName()}</div>
                    <div className="text-[#7A7A7A]">{formatRole(owner?.role)}</div>
                  </div>
                </div>
                <div
                  className="h-[20px] w-[20px] transition-all cursor-pointer"
                  onClick={() => {
                    setIsPreview(true);
                  }}
                >
                  <Image
                    src={'/icons/XCircle.svg'}
                    alt="close"
                    width={20}
                    height={20}
                  />
                </div>
              </div>
              <div className="mt-3 h-auto w-[90%] mx-auto break-words text-[12px]">
                {text || 'No content'}
              </div>
            
              <div className="mt-3 flex justify-center">
                <MentionButton 
                  noteId={id!} 
                  productId={productId}
                  onMentionAdded={handleMentionAdded} 
                />
              </div>
              
              <div className="flex justify-end mt-5 text-[12px] pr-2">
                <div className="flex justify-between w-[125px] text-[#535354]">
                  <div>{formatDate(displayDate)}</div>
                  <div>{formatTime(displayTime)}</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
      </div>
    </Draggable>
    {showContextMenu &&
      typeof document !== 'undefined' &&
      createPortal(
        <div
          className="fixed bg-white border border-gray-300 rounded-md shadow-xl py-1"
          style={{
            left: `${contextMenuPosition.x}px`,
            top: `${contextMenuPosition.y}px`,
            minWidth: '150px',
            zIndex: 100000
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteNote();
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>,
        document.body
      )}
    </>
  );
});

export default Note;

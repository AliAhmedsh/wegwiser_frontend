'use client';
import { useProductStore } from '@/entities/product/store';
import { DynamicMovement, GetCenterCoordinate } from '@/lib/konva/utils';
import { showToast } from '@/lib/utils/toast';
import { useCanvasStore } from '@/sections/home/canvasStore';
import { useEffect, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import { notesService } from '../api/notesService';
import { useNoteStore } from '../store';
import BottomPanel from './ui/BottomPanel';
import MentionButton from './ui/MentionButton';

export default function CreateNote() {
  const nodeRef = useRef<HTMLDivElement>(
    null!
  ) as React.RefObject<HTMLDivElement>;
  const { scale, offset } = useCanvasStore();
  const { addNote, setIsCreate, isCreate } = useNoteStore();
  const { chosenProduct } = useProductStore();
  const [text, setText] = useState<string>('');
  const [pendingMentions, setPendingMentions] = useState<Array<{ userId?: string; username?: string; email: string }>>([]);
  const [isPosting, setIsPosting] = useState<boolean>(false);

  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const { centerX, centerY } = GetCenterCoordinate(offset, scale);
    setPosition({ x: centerX, y: centerY });
  }, [isCreate, offset, scale]);

  const addNoteWithMentions = async (noteId: string, mentions: Array<{ userId?: string; username?: string; email: string }>) => {
    try {
      const response = await notesService.addMentions(noteId, { mentions });
      if (response.success) {
        console.log('Mentions added successfully:', response.message);
      } else {
        console.error('Failed to add mentions:', response.message);
      }
    } catch (error) {
      console.error('Error adding mentions:', error);
      throw error;
    }
  };

  const handlePost = async () => {
    if (isPosting) return;

    // Check if a product is selected
    if (!chosenProduct) {
      showToast.error('Please select a product to create notes.');
      return;
    }

    setIsPosting(true);

    try {
      // Extract title from text or set a default if text is empty
      const noteTitle = text.length > 0 ? text.substring(0, 20) + (text.length > 20 ? '...' : '') : 'New Note';

      // Build final text with mentions if any
      let finalText = text;
      if (pendingMentions.length > 0) {
        const mentionTexts = pendingMentions.map(mention => {
          const name = mention.username || mention.name || mention.email.split('@')[0];
          return `@ ${name}`;
        });
        
        // Check if mentions are already in text
        const currentMentions = text.match(/@\s+\w+/g) || [];
        const newMentions = mentionTexts.filter(mentionText => !currentMentions.includes(mentionText));
        
        if (newMentions.length > 0) {
          finalText = text.trim() + (text.trim() ? ' ' : '') + newMentions.join(' ');
        }
      }

      const notePayload = {
        title: noteTitle,
        text: finalText,
        x: position.x,
        y: position.y,
        canvasArea: 'main', // Default canvas area
        productId: chosenProduct.id,
        // vehicleId removed - notes are now only linked to product
      };

      console.log('Sending note payload:', notePayload);

      const result = await addNote(notePayload);

      // If there are pending mentions and the note was created successfully, add them
      // This will save the mentions array and send emails
      if (pendingMentions.length > 0 && result?.note?.id) {
        try {
          // Add mentions to the newly created note (this will also send emails)
          await addNoteWithMentions(result.note.id, pendingMentions);
          setPendingMentions([]);
        } catch (error) {
          console.error('Failed to add mentions:', error);
          // Don't fail the note creation if mentions fail
        }
      }

      setText(''); // Clear the textarea after posting
      setIsCreate(false);
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleMentionsSelected = (mentions: Array<{ userId?: string; username?: string; email: string; name?: string }>) => {
    setPendingMentions(mentions);
    
    // Append "@ [name]" to the text for each mention
    const mentionTexts = mentions.map(mention => {
      const name = mention.username || mention.name || mention.email.split('@')[0];
      return `@ ${name}`;
    });
    
    // Append mentions to text, avoiding duplicates
    const currentMentions = text.match(/@\s+\w+/g) || [];
    const newMentions = mentionTexts.filter(mentionText => !currentMentions.includes(mentionText));
    
    if (newMentions.length > 0) {
      const updatedText = text.trim() + (text.trim() ? ' ' : '') + newMentions.join(' ');
      setText(updatedText);
    }
  };

  const handleClose = () => {
    setText('');
    setPendingMentions([]);
    setIsCreate(false);
  };

  return (
    <Draggable
      position={position}
      onDrag={(e, data) => {
        DynamicMovement(position, scale, data, setPosition);
        e.stopPropagation();
      }}
      nodeRef={nodeRef}
    >
      <div
        ref={nodeRef}
        className="p-5 w-[275px] select-none rounded-[12px] border border-[rgba(83,83,84,0.20)] bg-white"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-[16px] font-medium text-black">Note</h3>
          <button
            className="flex items-center justify-center w-[16px] h-[16px] flex-shrink-0 p-0 m-0 hover:scale-95 active:scale-90 transition-all"
            aria-label="Close"
            onClick={handleClose}
            style={{ background: 'none', border: 'none' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M1 13L13 1M1 1L13 13" stroke="#535354" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        {!chosenProduct && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            Please select a product to create notes
          </div>
        )}
        <div className="relative rounded-[8px] border border-[rgba(0,0,0,0.3)] p-3">
          <MentionButton
            productId={chosenProduct?.id}
            onMentionsSelected={handleMentionsSelected}
            isCreateMode={true}
          />
          {pendingMentions.length > 0 && (
            <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
              {pendingMentions.length} user{pendingMentions.length !== 1 ? 's' : ''} will be mentioned
            </div>
          )}
          <textarea
            onChange={(e) => setText(e.currentTarget.value)}
            value={text}
            className="border-none outline-none w-full mt-2 resize-none"
            rows={4}
            placeholder=""
          />
          <div className="absolute bottom-1 right-1 w-3 h-3 opacity-30">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M12 12L12 8L8 12L12 12Z" fill="#666" />
              <path d="M12 12L12 4L4 12L12 12Z" fill="#666" />
              <path d="M12 12L12 0L0 12L12 12Z" fill="#666" />
            </svg>
          </div>
        </div>
        <BottomPanel
          onPost={handlePost}
          isTextEmpty={text.trim().length === 0 || !chosenProduct}
          currentText={text}
          onTextUpdate={setText}
          isPosting={isPosting}
        />
      </div>
    </Draggable>
  );
}

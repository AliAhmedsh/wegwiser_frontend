import { HoverCard, HoverCardTrigger } from '@/components/ui/hover-card';
import { showToast } from '@/lib/utils/toast';
import Spinner from '@/shared/ui/Spinner';
import { HoverCardContent } from '@radix-ui/react-hover-card';
import Image from 'next/image';
import { useState } from 'react';
import { notesService } from '../../api/notesService';

interface BottomPanelProps {
  onPost: () => void;
  isTextEmpty: boolean;
  currentText: string;
  onTextUpdate: (newText: string) => void;
  isPosting?: boolean;
}

const BottomPanel: React.FC<BottomPanelProps> = ({ onPost, isTextEmpty, currentText, onTextUpdate, isPosting = false }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const hoverCardProps = {
    openDelay: 50,
    closeDelay: 50,
  };

  const hoverCardContentProps = {
    sideOffset: 5,
    className:
      'bg-white p-2 flex justify-center items-center text-[14px] rounded-[8px]',
    style: { boxShadow: '2px 2px 2px 0px #A7B1C499' },
  };

  const handleEnhanceText = async (action: 'polish' | 'fix_grammar' | 'expand' | 'summarize') => {
    if (!currentText.trim()) {
      showToast.error('Please enter some text to enhance.');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await notesService.enhanceNoteText({
        text: currentText,
        action
      });

      if (response.success) {
        onTextUpdate(response.enhancedText);
        showToast.success(`Text ${action.replace('_', ' ')} completed successfully!`);
      } else {
        showToast.error(`Failed to ${action.replace('_', ' ')} text.`);
      }
    } catch (error: any) {
      console.error(`Error enhancing text with ${action}:`, error);
      showToast.error(error.response?.data?.error || `Failed to ${action.replace('_', ' ')} text.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="pt-4 flex justify-between items-center">
      <div className="flex gap-4 w-[60%]">
        <HoverCard {...hoverCardProps}>
          <HoverCardTrigger>
            <Image
              src={'icons/polish-text.svg'}
              alt="polish text"
              height={20}
              width={20}
              className={`hover:scale-90 active:scale-85 cursor-pointer transition-all ${isProcessing ? 'opacity-50' : ''}`}
              onClick={() => handleEnhanceText('polish')}
            />
          </HoverCardTrigger>
          <HoverCardContent {...hoverCardContentProps}>
            Polish text
          </HoverCardContent>
        </HoverCard>
        <HoverCard {...hoverCardProps}>
          <HoverCardTrigger>
            <Image
              src={'icons/fix-grammar.svg'}
              alt="fix grammar"
              height={24}
              width={24}
              className={`hover:scale-90 active:scale-85 cursor-pointer transition-all ${isProcessing ? 'opacity-50' : ''}`}
              onClick={() => handleEnhanceText('fix_grammar')}
            />
          </HoverCardTrigger>
          <HoverCardContent {...hoverCardContentProps}>
            Fix Grammar
          </HoverCardContent>
        </HoverCard>
        <HoverCard {...hoverCardProps}>
          <HoverCardTrigger>
            <Image
              src={'icons/auto-fix.svg'}
              alt="expand with AI"
              height={24}
              width={24}
              className={`hover:scale-95 active:scale-85 cursor-pointer transition-all ${isProcessing ? 'opacity-50' : ''}`}
              onClick={() => handleEnhanceText('expand')}
            />
          </HoverCardTrigger>
          <HoverCardContent {...hoverCardContentProps}>
            Expand with AI
          </HoverCardContent>
        </HoverCard>
      </div>
      <div className="flex items-center justify-end">
        <button
          onClick={onPost}
          className={`w-[120px] h-[40px] rounded-[12px] bg-[#F3F4F6] text-[#222] font-semibold text-lg shadow border border-[#E5E7EB] transition-all flex items-center justify-center ${isTextEmpty || isPosting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#e5e7eb] cursor-pointer'}`}
          disabled={isTextEmpty || isPosting}
        >
          {isPosting ? (
            <>
              <Spinner size="md" className="mr-2" />
              Posting...
            </>
          ) : (
            'Post'
          )}
        </button>
      </div>
    </div>
  );
};

export default BottomPanel;

import React, { useCallback, useRef, useEffect } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Transforms } from 'slate';
import {
  ReactEditor,
  RenderElementProps,
  useFocused,
  useSelected,
  useSlateStatic,
} from 'slate-react';
import { MiniFormElement } from '../types/custom-types';

import { useProductWorkspaceStore } from '@/store/productWorkspaceStore';

import DislikeIcon from '../../../assets/icons/DislikeIcon.svg';
import LikeIcon from '../../../assets/icons/LikeIcon.svg';

interface MiniFormProps {
  attributes: RenderElementProps['attributes'];
  children: React.ReactNode;
  element: MiniFormElement;
}

interface FormInputs {
  prompt: string;
}

const PromptMiniForm: React.FC<MiniFormProps> = ({ attributes, element }) => {
  const editor = useSlateStatic();
  const selected = useSelected();
  const focused = useFocused();
  const { register, handleSubmit } = useForm<FormInputs>({
    defaultValues: {
      prompt: element.formData?.prompt || '',
    },
  });

  const { setIsProcessing } = useProductWorkspaceStore();

  const onSubmit: SubmitHandler<FormInputs> = useCallback(
    (data) => {
      try {
        const path = ReactEditor.findPath(editor, element);
        Transforms.setNodes(
          editor,
          { formData: { prompt: data.prompt } },
          { at: path }
        );
      } catch (error) {
        console.error('Error in onSubmit:', error);
      }
    },
    [editor, element]
  );

  const formRef = useRef<HTMLFormElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const handleBlur = useCallback(() => {
    if (formRef.current) {
      handleSubmit(onSubmit)();
    }
  }, [handleSubmit, onSubmit]);

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Check if the popup ref exists and the click is outside
      if (popupRef.current && !popupRef.current.contains(target)) {
        console.log('Click outside detected, closing popup');
        
        // Close the popup by removing the element
        try {
          const path = ReactEditor.findPath(editor, element);
          Transforms.removeNodes(editor, { at: path });
          setIsProcessing(false);
        } catch (error) {
          console.error('Error removing popup on outside click:', error);
        }
      }
    };

    // Add event listener immediately
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('click', handleClickOutside);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [editor, element, setIsProcessing]);

  const handleLike = useCallback(() => {
  }, []);

  const handleDislike = useCallback(() => {
  }, []);

  const handleAcceptIt = useCallback(() => {
    setIsProcessing(false);

    try {
      const path = ReactEditor.findPath(editor, element);
      Transforms.removeNodes(editor, { at: path });
      Transforms.insertNodes(
        editor,
        {
          type: 'paragraph',
          children: [{ text: element.formData?.prompt || '' }],
        },
        { at: path }
      );
    } catch (error) {
      console.error('Error in handleAcceptIt:', error);
      // Fallback: just remove the element
      try {
        const path = ReactEditor.findPath(editor, element);
        Transforms.removeNodes(editor, { at: path });
      } catch (fallbackError) {
        console.error('Fallback error in handleAcceptIt:', fallbackError);
      }
    }
  }, [editor, element, setIsProcessing]);

  const handleRevertIt = useCallback(() => {
    setIsProcessing(false);
  }, [setIsProcessing]);

  const handleRemoveIt = useCallback(() => {
    setIsProcessing(false);
    try {
      const path = ReactEditor.findPath(editor, element);
      Transforms.removeNodes(editor, { at: path });
    } catch (error) {
      console.error('Error in handleRemoveIt:', error);
    }
  }, [editor, element, setIsProcessing]);

  const handlePolishIt = useCallback(() => {
    setIsProcessing(false);
  }, [setIsProcessing]);

  const outerDivGradientBackground: React.CSSProperties = {
    background: 'linear-gradient(93.9deg, #2086FE 1.16%, #AB55DC 93.59%)',
  };

  const textGradientStyle: React.CSSProperties = {
    background: 'linear-gradient(93.9deg, #2086FE 1.16%, #AB55DC 93.59%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  return (
    <div
      {...attributes}
      ref={popupRef}
      className={`w-full p-4 my-2 rounded-lg transition-all duration-300
                  ${selected && focused
          ? 'shadow-lg ring-2 ring-blue-500'
          : 'shadow-md'
        }
                  bg-white dark:bg-gray-800`}
      contentEditable={false}
      style={{ userSelect: 'none' }}
    >
      <div className="relative h-full space-y-4">
        <div className="flex items-center justify-between mb-4">
          <span className="font-[700] text-[10px]" style={textGradientStyle}>
            Do you want to apply this answer?
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleLike}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Like"
            >
              <LikeIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={handleDislike}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Dislike"
            >
              <DislikeIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Four Outline Buttons */}
        <div className="flex flex-row gap-2 mb-4">
          <button
            onClick={handleAcceptIt}
            className="px-3 py-1.5 border border-black font-inter text-[#181818] text-[10px] rounded-md
                       hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/20
                       dark:border-white dark:text-white dark:hover:bg-gray-700 text-sm"
          >
            Accept It
          </button>
          <button
            onClick={handleRevertIt}
            className="px-3 py-1.5 border border-black font-inter text-[#181818] text-[10px] rounded-md
                       hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/20
                       dark:border-white dark:text-white dark:hover:bg-gray-700 text-sm"
          >
            Revert It
          </button>
          <button
            onClick={handleRemoveIt}
            className="px-3 py-1.5 border border-black font-inter text-[#181818] text-[10px] rounded-md
                       hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/20
                       dark:border-white dark:text-white dark:hover:bg-gray-700 text-sm"
          >
            Remove It
          </button>
          <button
            onClick={handlePolishIt}
            className="px-3 py-1.5 border border-black font-inter text-[#181818] text-[10px] rounded-md
                       hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black/20
                       dark:border-white dark:text-white dark:hover:bg-gray-700 text-sm"
          >
            Polish It
          </button>
        </div>

        {/* Prompt Field (stays unchanged) */}
        <form
          ref={formRef}
          onBlur={handleBlur}
          onSubmit={handleSubmit(onSubmit)}
          className="relative"
        >
          <label htmlFor="prompt" className="sr-only">
            Prompt
          </label>
          <div
            className="relative w-full h-[62px] rounded-lg overflow-hidden p-[1px]" // p-[1px] creates the thin border space
            style={outerDivGradientBackground} // Apply the gradient background here
          >
            <textarea
              id="prompt"
              {...register('prompt')}
              placeholder="Enter your prompt here..."
              className="w-full h-[60px] p-3 pr-20 rounded-lg resize-none bg-white font-inter text-[10px] text-gray-800 dark:text-gray-200 border-none focus:outline-none focus:ring-0"
            />
          </div>

          <button
            type="submit"
            className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#E9EDF0] font-inter text-[10px] text-[#181818] rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
};

export default PromptMiniForm;

'use client';

import React, { useCallback, useRef, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import DislikeIcon from '@/assets/icons/DislikeIcon.svg';
import LikeIcon from '@/assets/icons/LikeIcon.svg';
import useLearning from '@/lib/api/hooks/useLearning';
import useSwot from '@/lib/api/hooks/useSwot';
import { useProductStore } from '@/entities/product/store';
import { fastApiService } from '@/lib/api/services/fastApiService';
import type { ContentContextAction } from './TextSelectionMenu';

interface LearningPromptFormProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  position: { x: number; y: number };
  currentTab?: 'Iconography' | 'Symbolism/Signs' | 'Semiotics' | 'general' | 'swot';
  contentContextAction?: ContentContextAction | null;
  contentContextProductId?: number;
  contentContextVehicleId?: number;
  contentContextCurrentContext?: string;
}

interface FormInputs {
  prompt: string;
}

const LearningPromptForm: React.FC<LearningPromptFormProps> = ({
  isOpen,
  onClose,
  selectedText,
  position,
  currentTab = 'general',
  contentContextAction = null,
  contentContextProductId,
  contentContextVehicleId,
  contentContextCurrentContext,
}) => {
  const { register, handleSubmit, setValue, watch } = useForm<FormInputs>({
    defaultValues: {
      prompt: selectedText || '',
    },
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>('');
  const popupRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { chosenProduct } = useProductStore();
  const learningMutation = useLearning();
  const swotMutation = useSwot();
  const promptValue = watch('prompt');
  const contentContextRanRef = useRef(false);

  const productIdForContext = contentContextProductId ?? chosenProduct?.id;

  useEffect(() => {
    setValue('prompt', selectedText);
  }, [selectedText, setValue]);

  useEffect(() => {
    if (!isOpen || !contentContextAction || contentContextAction === 'ask' || !selectedText.trim() || !productIdForContext) return;
    if (contentContextRanRef.current) return;
    contentContextRanRef.current = true;
    const payload = {
      selected_content: selectedText.trim(),
      product_id: productIdForContext,
      ...(contentContextVehicleId && { vehicle_id: contentContextVehicleId }),
      ...(contentContextCurrentContext && { current_context: contentContextCurrentContext }),
    };
    setIsProcessing(true);
    setAiResponse('');
    (contentContextAction === 'analyze'
      ? fastApiService.contextAnalyze(payload)
      : fastApiService.contextExpand(payload)
    )
      .then((res) => setAiResponse(res.result ?? ''))
      .catch(() => setAiResponse('Sorry, there was an error. Please try again.'))
      .finally(() => setIsProcessing(false));
  }, [isOpen, contentContextAction, selectedText, productIdForContext, contentContextVehicleId, contentContextCurrentContext]);

  useEffect(() => {
    if (!isOpen) contentContextRanRef.current = false;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (popupRef.current && !popupRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const onSubmit: SubmitHandler<FormInputs> = useCallback(
    async (data) => {
      if (!data.prompt.trim()) return;

      if (contentContextAction === 'ask' && productIdForContext) {
        setIsProcessing(true);
        setAiResponse('');
        try {
          const res = await fastApiService.contextAsk({
            selected_content: selectedText.trim(),
            product_id: productIdForContext,
            ...(contentContextVehicleId && { vehicle_id: contentContextVehicleId }),
            ...(contentContextCurrentContext && { current_context: contentContextCurrentContext }),
            user_input: data.prompt.trim(),
          });
          setAiResponse(res.result ?? '');
        } catch {
          setAiResponse('Sorry, there was an error. Please try again.');
        } finally {
          setIsProcessing(false);
        }
        return;
      }

      if (currentTab !== 'swot' && !chosenProduct?.id) {
        setAiResponse('Select a product to search PRD and plans.');
        return;
      }

      setIsProcessing(true);
      setAiResponse('');

      try {
        let response;

        if (currentTab === 'swot') {
          response = await swotMutation.mutateAsync({
            prompt: data.prompt.trim(),
            context: selectedText,
            tab: 'swot'
          });
        } else {
          response = await learningMutation.mutateAsync({
            product_id: chosenProduct!.id,
            prompt: data.prompt.trim(),
            context: selectedText,
            tab: currentTab
          });
        }

        if (response.success && response.response) {
          let display = response.response;
          if (response.bullets?.length) {
            display += '\n\nReferences:\n' + response.bullets.map((b: { bullet: string; source_id: string }) => `• ${b.source_id}: ${b.bullet.slice(0, 120)}...`).join('\n');
          }
          setAiResponse(display);
        }
      } catch (error) {
        setAiResponse('Sorry, there was an error processing your request. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    },
    [learningMutation, swotMutation, selectedText, currentTab, chosenProduct?.id, contentContextAction, productIdForContext, contentContextVehicleId, contentContextCurrentContext]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  }, [handleSubmit, onSubmit]);

  const handleBlur = useCallback(() => {
    if (formRef.current) {
      handleSubmit(onSubmit)();
    }
  }, [handleSubmit, onSubmit]);

  const handleLike = useCallback(() => {
    // Handle like action
  }, []);

  const handleDislike = useCallback(() => {
    // Handle dislike action
  }, []);

  const handleAcceptIt = useCallback(() => {
    setIsProcessing(false);
    onClose();
  }, [onClose]);

  const handleRevertIt = useCallback(() => {
    setIsProcessing(false);
    onClose();
  }, [onClose]);

  const handleRemoveIt = useCallback(() => {
    setIsProcessing(false);
    onClose();
  }, [onClose]);

  const handlePolishIt = useCallback(() => {
    setIsProcessing(false);
    onClose();
  }, [onClose]);

  const outerDivGradientBackground: React.CSSProperties = {
    background: 'linear-gradient(93.9deg, #2086FE 1.16%, #AB55DC 93.59%)',
  };

  const textGradientStyle: React.CSSProperties = {
    background: 'linear-gradient(93.9deg, #2086FE 1.16%, #AB55DC 93.59%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  };

  const isContentContextAnalyzeExpand = contentContextAction === 'analyze' || contentContextAction === 'expand';

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className="fixed z-[200] w-[400px] p-4 rounded-lg shadow-2xl bg-white dark:bg-gray-800 transition-all duration-300 learning-prompt-form"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, 20px)',
        marginTop: '0px'
      }}
    >
      <div className="relative h-full space-y-4">
        <div className="flex items-center justify-between mb-4">
          <span className="font-[700] text-[10px]" style={textGradientStyle}>
            {isContentContextAnalyzeExpand ? (contentContextAction === 'analyze' ? 'Analyze' : 'Expand') : 'Do you want to apply this answer?'}
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

        {!isContentContextAnalyzeExpand && (
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
        )}

        {isContentContextAnalyzeExpand && isProcessing && !aiResponse && (
          <div className="text-xs text-gray-500 py-2">
            {contentContextAction === 'analyze' ? 'Analyzing...' : 'Expanding...'}
          </div>
        )}

        <form
          ref={formRef}
          onBlur={handleBlur}
          onSubmit={handleSubmit(onSubmit)}
          className="relative"
        >
          {!isContentContextAnalyzeExpand && (
            <>
              <label htmlFor="prompt" className="sr-only">
                Prompt
              </label>
              <div
                className="relative w-full h-[62px] rounded-lg overflow-hidden p-[1px]"
                style={outerDivGradientBackground}
              >
                <textarea
                  id="prompt"
                  {...register('prompt')}
                  onKeyDown={handleKeyDown}
                  placeholder={contentContextAction === 'ask' ? 'Ask a question about the selected content...' : 'Enter your prompt here...'}
                  disabled={isProcessing}
                  className="w-full h-[60px] p-3 pr-20 rounded-lg resize-none bg-white font-inter text-[10px] text-gray-800 dark:text-gray-200 border-none focus:outline-none focus:ring-0 disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={isProcessing || !promptValue.trim()}
                className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#E9EDF0] font-inter text-[10px] text-[#181818] rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Sending...' : 'Enter'}
              </button>
            </>
          )}
        </form>

        {/* AI Response Section */}
        {aiResponse && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
            <div className="text-xs font-semibold text-gray-700 mb-2">AI Response:</div>
            <div className="text-xs text-gray-600 whitespace-pre-wrap">{aiResponse}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningPromptForm;

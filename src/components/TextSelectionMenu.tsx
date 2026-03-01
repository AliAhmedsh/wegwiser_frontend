'use client';

import React, { useState, useEffect, useRef } from 'react';
import useAiStore from '@/store/AiStore';
import CopyIcon from '@/assets/icons/CopyIcon.svg';
import LearningPromptForm from './LearningPromptForm';

export type ContentContextAction = 'analyze' | 'expand' | 'ask';

interface TextSelectionMenuProps {
  containerSelector: string;
  onAskAI?: (selectedText: string) => void;
  currentTab?: 'Iconography' | 'Symbolism/Signs' | 'Semiotics' | 'general' | 'swot';
  useContentContext?: boolean;
  productId?: number;
  vehicleId?: number;
  currentContext?: string;
}

const TextSelectionMenu: React.FC<TextSelectionMenuProps> = ({
  containerSelector,
  onAskAI,
  currentTab = 'general',
  useContentContext = false,
  productId,
  vehicleId,
  currentContext,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [showLearningPromptForm, setShowLearningPromptForm] = useState(false);
  const [promptFormPosition, setPromptFormPosition] = useState({ x: 0, y: 0 });
  const [contentContextAction, setContentContextAction] = useState<ContentContextAction | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerSelector) {
      return;
    }

    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection?.toString().trim();

      if (text && text.length > 0) {
        const range = selection?.getRangeAt(0);
        if (range) {
          const containerElement = document.querySelector(containerSelector);
          if (!containerElement || !containerElement.contains(range.commonAncestorContainer)) {
            setIsVisible(false);
            return;
          }

          const selectedElement = range.commonAncestorContainer;
          const isFromButton = selectedElement.nodeType === Node.ELEMENT_NODE 
            ? (selectedElement as Element).closest('button')
            : (selectedElement as Element)?.parentElement?.closest('button');
          
          if (isFromButton) {
            setIsVisible(false);
            return;
          }

          setSelectedText(text);
          
          const rect = range.getBoundingClientRect();
          setPosition({
            x: rect.left + rect.width / 2,
            y: rect.top - 10
          });
          setIsVisible(true);
        }
      } else {
        setIsVisible(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        const selection = window.getSelection();
        if (!selection?.toString().trim()) {
          setIsVisible(false);
        }
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [containerSelector]);

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(selectedText);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    setIsVisible(false);
  };

  const openForm = (action: ContentContextAction | null) => {
    setContentContextAction(action);
    setPromptFormPosition(position);
    setTimeout(() => setShowLearningPromptForm(true), 50);
  };

  const handleAskAI = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onAskAI) {
      onAskAI(selectedText);
    } else if (useContentContext && productId) {
      openForm('ask');
    } else {
      openForm(null);
    }
    setIsVisible(false);
  };

  const handleAnalyze = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (useContentContext && productId) {
      openForm('analyze');
    } else {
      openForm(null);
    }
    setIsVisible(false);
  };

  const handleExpand = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (useContentContext && productId) {
      openForm('expand');
    } else {
      openForm(null);
    }
    setIsVisible(false);
  };

  const handleCloseForm = () => {
    setShowLearningPromptForm(false);
    setContentContextAction(null);
  };

  return (
    <>
      {isVisible && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-[#000] rounded-md shadow-md px-2 w-auto flex space-x-2 font-arial font-[400] text-[12px] text-[#fff]"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-8px'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="px-1 py-2 cursor-pointer rounded whitespace-nowrap hover:bg-gray-700"
            onClick={handleAnalyze}
          >
            Analyze
          </button>
          <button
            className="px-1 py-2 cursor-pointer rounded whitespace-nowrap hover:bg-gray-700"
            onClick={handleExpand}
          >
            Expand
          </button>
          <button
            className="px-1 py-2 cursor-pointer rounded whitespace-nowrap hover:bg-gray-700"
            onClick={handleAskAI}
          >
            Ask AI
          </button>
          <button
            className="px-1 py-2 cursor-pointer rounded whitespace-nowrap hover:bg-gray-700"
            onClick={handleCopy}
            title="Copy text"
          >
            <CopyIcon className="w-4 h-4" />
          </button>
        </div>
      )}
      
      <LearningPromptForm
        isOpen={showLearningPromptForm}
        onClose={handleCloseForm}
        selectedText={selectedText}
        position={promptFormPosition}
        currentTab={currentTab}
        contentContextAction={contentContextAction}
        contentContextProductId={productId}
        contentContextVehicleId={vehicleId}
        contentContextCurrentContext={currentContext}
      />
    </>
  );
};

export default TextSelectionMenu;

'use client';

import useWorkspaceStore from '@/store/workSpaceStore';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  noDimming?: boolean;
  position?: {
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
  };
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  noDimming,
  position,
}) => {
  const { setFullScreen, isFullScreen } = useWorkspaceStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const onLeaveFullScreen = () => {
    setFullScreen(false);
  };

  const onHoverStart = () => {
    timeoutRef.current = setTimeout(() => {
      onLeaveFullScreen();
      timeoutRef.current = null;
    }, 400);
  };

  const onHoverEnd = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  if (!hasMounted || !isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999]"
      style={{
        backgroundColor: noDimming ? 'transparent' : 'rgba(33, 36, 39, 0.5)',
        pointerEvents: 'auto', // Ensure clicks are captured even when transparent
      }}
      onClick={(e) => {
        // Close when clicking on backdrop (anywhere outside modal content)
        const target = e.target as HTMLElement;
        
        // Don't close if clicking on hover zones (only in full screen mode)
        if (isFullScreen && (target.hasAttribute('data-hover-zone') || target.closest('[data-hover-zone]'))) {
          return;
        }
        
        // Close if clicking directly on backdrop or any element that's not inside modal content
        if (e.target === e.currentTarget || !target.closest('[data-modal-content]')) {
          onClose();
        }
      }}
    >
      {/* Hover zones for full screen exit - only active in full screen mode */}
      {isFullScreen && (
        <>
          <div
            data-hover-zone
            className="fixed z-100 h-[1.5vh] w-[100vw] top-0 opacity-0"
            onMouseEnter={onHoverStart}
            onMouseLeave={onHoverEnd}
            onClick={(e) => e.stopPropagation()}
          />
          <div
            data-hover-zone
            className="fixed z-100 h-[1.5vh] w-[100vw] bottom-0 opacity-0"
            onMouseEnter={onHoverStart}
            onMouseLeave={onHoverEnd}
            onClick={(e) => e.stopPropagation()}
          />
          <div
            data-hover-zone
            className="fixed z-100 h-[100vh] w-[1vw] right-0 opacity-0"
            onMouseEnter={onHoverStart}
            onMouseLeave={onHoverEnd}
            onClick={(e) => e.stopPropagation()}
          />
          <div
            data-hover-zone
            className="fixed z-100 h-[100vh] w-[1vw] left-0 opacity-0"
            onMouseEnter={onHoverStart}
            onMouseLeave={onHoverEnd}
            onClick={(e) => e.stopPropagation()}
          />
        </>
      )}

      {/* Modal content container */}
      {position ? (
        <div
          className="absolute z-[10000]"
          data-modal-content
          style={{
            top: position.top,
            left: position.left,
            right: position.right,
            bottom: position.bottom,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      ) : (
        <div
          className="flex justify-center items-center h-full w-full pointer-events-none"
        >
          <div 
            className="relative z-[10000] pointer-events-auto"
            data-modal-content
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </div>
        </div>
      )}
    </div>,
    document.body
  );
};

export default Modal;

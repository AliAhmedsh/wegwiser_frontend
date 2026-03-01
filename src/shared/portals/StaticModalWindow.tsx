'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  noDimming?: boolean;
}

const StaticModalWindow: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  noDimming,
}) => {
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

  if (!hasMounted || !isOpen) return null;

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-center items-center"
      style={noDimming ? {} : { backgroundColor: 'rgba(33, 36, 39, 0.5)' }}
      onClick={onClose}
    >
      <div className="relative z-[10000]" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default StaticModalWindow;

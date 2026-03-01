import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalWSProps {
  children?: ReactNode;
}

const PortalWS: React.FC<PortalWSProps> = ({ children }) => {
  if (typeof document !== 'object') return null;
  return createPortal(children, document.body);
};

export default PortalWS;

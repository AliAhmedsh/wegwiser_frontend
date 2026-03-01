import React from 'react';
import ProductModalContent from '../../widgets/productModalContent/ProductModalContent';
import StaticModalWindow from '@/shared/portals/StaticModalWindow';

const ProductModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <StaticModalWindow isOpen={isOpen} onClose={onClose}>
      <ProductModalContent onClose={onClose} />
    </StaticModalWindow>
  );
};

export default ProductModal;

import React from 'react';

interface ProductCardProps {
  name: string;
  isActive?: boolean;
  onClick: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  isActive = false,
  onClick,
}) => {
  return (
    <div className="flex flex-col items-center flex-1" onClick={onClick}>
      <span className="text-[14px]/[2] font-normal text-black text-center font-['Open_Sans']">{name}</span>
      <div
        className={`w-34 h-24 bg-[#D9D9D9] rounded-xl border-3 hover:border-[#AB55DC] cursor-pointer ${
          isActive ? 'border-[#4E6DB3]' : 'border-transparent'
        }`}
      ></div>
    </div>
  );
};

export default ProductCard;

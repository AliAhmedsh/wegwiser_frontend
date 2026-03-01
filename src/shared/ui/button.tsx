import ShadowWrapper from '@/entities/vehicle/components/shared/ShadowWrapper';
import Image from 'next/image';

const Button: React.FC<{ image: string }> = ({ image }) => {
  return (
    <div
      style={{
        boxShadow: '0px 1px 0px 0px #A7B1C480, 0px -1px 0px 0px #FFFFFF',
      }}
      className="rounded-full border-4"
    >
      <ShadowWrapper>
        <Image width={40} height={40} src={image || '/fallback.jpg'} alt="" />
      </ShadowWrapper>
    </div>
  );
};

export default Button;

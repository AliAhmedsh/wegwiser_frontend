import Image from 'next/image';
import ShadowWrapper from '../vehicle/components/shared/ShadowWrapper';
import { WorkerListProps } from '../worker/type';

const Facilitator: React.FC<WorkerListProps> = ({ name, image, position }) => {
  return (
    <div className="text-center w-[90px] h-[90px]">
      <div className="flex items-center justify-center">
        <ShadowWrapper>
          <Image
            src={image && image.trim() !== '' ? image : '/icons/user-mock-icon.svg'}
            alt="image of facilitator"
            width={90}
            height={90}
            className="rounded-full"
          />
        </ShadowWrapper>
      </div>
      <div className="mt-0.5 text-[10px] font-light">{position}</div>
      <div className="mt-0.5 text-[12px]">{name}</div>
    </div>
  );
};

export default Facilitator;

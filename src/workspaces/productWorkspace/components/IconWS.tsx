import { forwardRef, PropsWithChildren, Ref } from 'react';
import Image from 'next/image';

type IconWSProps = PropsWithChildren<{
  src: string;
  width: number;
  height: number;
}>;

const IconWS: React.FC<IconWSProps> = forwardRef(
  ({ src, ...props }, ref: Ref<HTMLImageElement | null>) => {
    return <Image src={src} {...props} ref={ref} alt="icon" />;
  }
);

IconWS.displayName = 'IconWS';

export default IconWS;

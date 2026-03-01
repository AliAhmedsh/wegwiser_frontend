import React  from 'react';
import { CanvasInstance } from '@/workspaces/designWorkspace/types';
import { useChangeInstanceObjectProperty } from '@/workspaces/designWorkspace/sections/RightSideBar/EditableText/useChangeInstanceProperty';
import SliderDemo from '@/workspaces/designWorkspace/components/ui/SliderDemo';

interface Props {
  instance: CanvasInstance
}

const AppearanceProperty: React.FC<Props> = ({ instance }) => {
  const { changeObjectProperty } = useChangeInstanceObjectProperty();
  const opacityPercent = Math.round((instance.object?.opacity ?? 1) * 100);
  const handleOpacityChange = (value: number[]) => {
    const newOpacity = value[0] / 100;
    changeObjectProperty(instance.id,'opacity', newOpacity);
  };
  return (
    <div className="w-full">
      <SliderDemo title={'opacity'} value={[opacityPercent]} onChange={handleOpacityChange} />
    </div>
  );
};

export default AppearanceProperty;

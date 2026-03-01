import React, { useEffect } from 'react';
import { CanvasInstance } from '@/workspaces/designWorkspace/types';
import { EditableNumberInput } from '@/workspaces/designWorkspace/sections/RightSideBar/EditableText/EditableNumberInput';
import {
  useChangeInstanceObjectProperty
} from '@/workspaces/designWorkspace/sections/RightSideBar/EditableText/useChangeInstanceProperty';
import { ColorPicker } from '@/workspaces/designWorkspace/sections/RightSideBar/Accordion/ColorPicker/ColorPicker';

interface Props {
  instance: CanvasInstance
}
const FillStrokeProperty: React.FC<Props> = ({instance}) => {
  useEffect(() => {
  }, [instance.object?.x]);
  const {changeObjectProperty} = useChangeInstanceObjectProperty()
  return (
    <div className={'w-full'}>
       <EditableNumberInput title={'stroke'} valueDimension={'px'} text={instance.object?.strokeWidth?.toString()??'0'} onChangeAction={(value)=> changeObjectProperty(instance.id, 'strokeWidth', Number(value))} />
       <ColorPicker label={'fill'} color={instance.object?.fill?.toString()}  onChangeAction={(value)=> changeObjectProperty(instance.id, 'fill', value)}/>
       <ColorPicker label={'stroke'} color={instance.object?.stroke?.toString()}  onChangeAction={(value)=> changeObjectProperty(instance.id, 'stroke', value)}/>
    </div>
  );
};

export default FillStrokeProperty;

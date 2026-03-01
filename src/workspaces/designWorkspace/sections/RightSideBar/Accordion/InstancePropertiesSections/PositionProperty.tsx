import React, { useEffect } from 'react';
import { CanvasInstance } from '@/workspaces/designWorkspace/types';
import { EditableNumberInput } from '@/workspaces/designWorkspace/sections/RightSideBar/EditableText/EditableNumberInput';
import {
  useChangeInstanceObjectProperty
} from '@/workspaces/designWorkspace/sections/RightSideBar/EditableText/useChangeInstanceProperty';

interface Props {
  instance: CanvasInstance
}
const PositionProperty: React.FC<Props> = ({instance}) => {
  useEffect(() => {
  }, [instance.object?.x]);
  const {changeObjectProperty} = useChangeInstanceObjectProperty()
  return (
    <div className={'w-full'}>
      {instance.object?.x && <EditableNumberInput title={'x'} valueDimension={'px'} text={instance.object.x.toString()} onChangeAction={(value)=> changeObjectProperty(instance.id, 'x', Number(value))} />}
      {instance.object?.y && <EditableNumberInput title={'y'} valueDimension={'px'} text={instance.object.y.toString()} onChangeAction={(value)=> changeObjectProperty(instance.id, 'y', Number(value))} />}
      {/*rotation field dissapear when rotation == 0 so we display it always with init 0 value*/}
      <EditableNumberInput title={'rotation'} valueDimension={'˚'} text={instance.object?.rotation?.toString()??'0'} onChangeAction={(value)=> changeObjectProperty(instance.id, 'rotation', Number(value))} />
    </div>
  );
};

export default PositionProperty;

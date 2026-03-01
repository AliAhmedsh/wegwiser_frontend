import React from 'react';
import { useTransformerHook } from '@/workspaces/designWorkspace/hooks/useTransformerHook';
import { Rect } from 'react-konva';

type Props =  Pick<ReturnType<typeof useTransformerHook>, 'selectionRectangle'>
//ui rect thatd display area of selecting rectangle
const SelectionRectangle: React.FC<Props> = ({selectionRectangle}) => {
  return (
    selectionRectangle.visible && (
        <Rect
          x={Math.min(selectionRectangle.x1, selectionRectangle.x2)}
          y={Math.min(selectionRectangle.y1, selectionRectangle.y2)}
          width={Math.abs(selectionRectangle.x2 - selectionRectangle.x1)}
          height={Math.abs(selectionRectangle.y2 - selectionRectangle.y1)}
          fill="rgba(20,20,30,0.2)"
        />
      )
  );
};

export default SelectionRectangle;

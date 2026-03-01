import React from 'react';
import type Konva from 'konva';
import { useDesignWorkspaceStore } from '@/workspaces/designWorkspace/store/designWorkspace.store';
import { useStagePan } from '@/workspaces/designWorkspace/hooks/useStagePan';

interface Props extends ReturnType<typeof useStagePan>{
  stageRef: React.RefObject<Konva.Stage | null>;
}

const ZoomWidget: React.FC<Props> = ({stageRef,...pan}) => {
  const {stageSize, zoom,setZoom} = useDesignWorkspaceStore()
  const handleZoomIn = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const center = { x: stageSize.width / 2, y: stageSize.height / 2 };
    const oldScale = zoom;
    const scaleBy = 1.1;
    const newZoom = Math.min(2, oldScale * scaleBy);
    setZoom(newZoom);
    const mousePointTo = {
      x: (center.x - pan.stagePos.x) / oldScale,
      y: (center.y - pan.stagePos.y) / oldScale,
    };
    pan.setStagePos({
      x: center.x - mousePointTo.x * newZoom,
      y: center.y - mousePointTo.y * newZoom,
    });
  };
  // const handleZoomOut = () => {
  //   const stage = stageRef.current;
  //   if (!stage) return;
  //   const center = { x: stageSize.width / 2, y: stageSize.height / 2 };
  //   const oldScale = zoom;
  //   const scaleBy = 1.1;
  //   const newZoom = Math.max(0.1, oldScale / scaleBy);
  //   setZoom(newZoom);
  //   const mousePointTo = {
  //     x: (center.x - pan.stagePos.x) / oldScale,
  //     y: (center.y - pan.stagePos.y) / oldScale,
  //   };
  //   pan.setStagePos({
  //     x: center.x - mousePointTo.x * newZoom,
  //     y: center.y - mousePointTo.y * newZoom,
  //   });
  // };

  return (
    <div className="bg-white rounded px-2 py-1 text-xs font-semibold flex items-center self-end gap-1 z-30 shadow">
      <span>{Math.round(zoom * 100)}%</span>
      
      <button onClick={handleZoomIn}>
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7.55258 5.71556C7.55258 5.76969 7.53108 5.82161 7.4928 5.85989C7.45452 5.89817 7.40261 5.91967 7.34847 5.91967H5.91967V7.34847C5.91967 7.40261 5.89817 7.45452 5.85989 7.4928C5.82161 7.53108 5.76969 7.55258 5.71556 7.55258C5.66143 7.55258 5.60951 7.53108 5.57123 7.4928C5.53295 7.45452 5.51145 7.40261 5.51145 7.34847V5.91967H4.08265C4.02851 5.91967 3.9766 5.89817 3.93832 5.85989C3.90004 5.82161 3.87853 5.76969 3.87853 5.71556C3.87853 5.66143 3.90004 5.60951 3.93832 5.57123C3.9766 5.53295 4.02851 5.51145 4.08265 5.51145H5.51145V4.08265C5.51145 4.02851 5.53295 3.9766 5.57123 3.93832C5.60951 3.90004 5.66143 3.87853 5.71556 3.87853C5.76969 3.87853 5.82161 3.90004 5.85989 3.93832C5.89817 3.9766 5.91967 4.02851 5.91967 4.08265V5.51145H7.34847C7.40261 5.51145 7.45452 5.53295 7.4928 5.57123C7.53108 5.60951 7.55258 5.66143 7.55258 5.71556ZM11.5752 11.5752C11.5562 11.5941 11.5337 11.6092 11.5089 11.6195C11.4841 11.6297 11.4576 11.635 11.4307 11.635C11.4039 11.635 11.3774 11.6297 11.3526 11.6195C11.3278 11.6092 11.3053 11.5941 11.2863 11.5752L8.59714 8.88596C7.76803 9.63966 6.67702 10.0392 5.55724 9.9992C4.43747 9.9592 3.37775 9.48284 2.60453 8.6719C1.83131 7.86096 1.40591 6.77977 1.41925 5.65937C1.43259 4.53896 1.88359 3.4682 2.6759 2.6759C3.4682 1.88359 4.53896 1.43259 5.65937 1.41925C6.77977 1.40591 7.86096 1.83131 8.6719 2.60453C9.48284 3.37775 9.9592 4.43747 9.9992 5.55724C10.0392 6.67702 9.63966 7.76803 8.88596 8.59714L11.5752 11.2863C11.5941 11.3053 11.6092 11.3278 11.6195 11.3526C11.6297 11.3774 11.635 11.4039 11.635 11.4307C11.635 11.4576 11.6297 11.4841 11.6195 11.5089C11.6092 11.5337 11.5941 11.5562 11.5752 11.5752ZM5.71556 9.59372C6.48259 9.59372 7.23239 9.36627 7.87015 8.94014C8.50791 8.514 9.00499 7.90831 9.29852 7.19967C9.59205 6.49103 9.66885 5.71126 9.51921 4.95897C9.36957 4.20668 9.00021 3.51565 8.45784 2.97328C7.91546 2.43091 7.22444 2.06155 6.47215 1.91191C5.71986 1.76227 4.94009 1.83907 4.23145 2.1326C3.52281 2.42613 2.91712 2.92321 2.49098 3.56097C2.06485 4.19873 1.83739 4.94853 1.83739 5.71556C1.83848 6.74378 2.24741 7.72958 2.97448 8.45664C3.70154 9.18371 4.68734 9.59264 5.71556 9.59372Z" fill="#343330"/>
        </svg>
        </button>
    </div>
  );
};

export default ZoomWidget;

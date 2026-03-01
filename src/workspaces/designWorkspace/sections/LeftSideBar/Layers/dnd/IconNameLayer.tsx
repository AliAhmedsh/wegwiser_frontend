import React from 'react';
import CheronDown from '@/workspaces/designWorkspace/assets/icons/ChevronDown.svg';
import { getIconForInstance } from '@/workspaces/designWorkspace/sections/LeftSideBar/Layers/getersNameIconsForLayers';
import { CanvasInstance } from '@/workspaces/designWorkspace/types';
import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';

interface Props {
  instance: CanvasInstance;
}

const IconNameLayer: React.FC<Props> = ({instance}) => {
  const { toggleGroupIsOpen } = useCanvasLayersStore();

  return (
    <div className={'flex flex-row justify-start items-center'} onClick={()=> toggleGroupIsOpen(instance.id)}>
      {instance.type === 'group' && <div className={`transition-all p-3 duration-300 cursor-pointer ${instance.isOpen ? "rotate-0" : "-rotate-90"} ${instance.children.length < 1 && "opacity-0" }`} ><CheronDown className={"size-2"}/></div>}
      <div className={"flex flex-row items-center gap-3"}>
        {getIconForInstance(instance)}
        {instance.name}
      </div>
    </div>
  );
};

export default IconNameLayer;

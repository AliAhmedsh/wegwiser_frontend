import React, { useRef } from 'react';
import { CanvasGroup } from '@/workspaces/designWorkspace/types';
import { LayerItem } from '@/workspaces/designWorkspace/sections/LeftSideBar/Layers/dnd/Layer';

interface Props {
  instance: CanvasGroup;
}

const GroupChildrenMapper: React.FC<Props> = ({ instance }) => {
  const isGroupThatHasChildren = instance.type === 'group' && instance.children?.length > 0;
  const containerRef = useRef<HTMLDivElement | null>(null);
  // const [maxHeight, setMaxHeight] = useState('0px');
  //TODO maxHight not dynamic
  // useEffect(() => {
  //   if (instance.isOpen && containerRef.current) {
  //     setMaxHeight(`${containerRef.current.scrollHeight}px`);
  //   } else {
  //     setMaxHeight('0px');
  //   }
  // }, [instance.isOpen,instance.children]);

  if (!isGroupThatHasChildren) return null;

  return (
    <div
      ref={containerRef}
      className={`ml-4 pl-5 transition-all duration-500 overflow-hidden ${instance.isOpen ? 'max-h-[1000px]' : 'max-h-0'}`}
      // style={{ maxHeight }}
    >
      {instance.children.map((child) => (
        <LayerItem key={child.id} instance={child} parentId={instance.id} />
      ))}
    </div>
  );
};

export default GroupChildrenMapper;

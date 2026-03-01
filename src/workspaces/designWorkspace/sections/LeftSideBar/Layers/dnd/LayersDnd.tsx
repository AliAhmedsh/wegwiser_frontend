import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';
import { LayerItem } from '@/workspaces/designWorkspace/sections/LeftSideBar/Layers/dnd/Layer';

export function LayersDnd() {
  const { layers} = useCanvasLayersStore();
  return (
    <div className={'py-5'}>
      {layers.map((layer) => (
        <LayerItem key={layer.id} instance={layer} />
      ))}
    </div>
  );
}

import CreateNote from '@/entities/note/forms/CreateNote';
import { useNoteStore } from '@/entities/note/store';
import { useCanvasStore } from './canvasStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import Note from '@/entities/note/Note';
// import VehicleFull from '@/entities/vehicle/vehicleFull';
// import { vehicleInfoMock } from '@/entities/vehicle/components/vehicleFull/VehicleInfo';
// import VehicleFull from '@/entities/vehicle/vehicleFull';
import { getCookie } from '@/lib/config/api';
import { useProductStore } from '@/entities/product/store';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';

const InfiniteCanvasWrapper = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scale, offset, setOffset, setScale } = useCanvasStore();
  const { chosenProduct } = useProductStore();
  const { selectedVehicleId } = useSelectedVehicleStore();

  const isCreate = useNoteStore((state) => state.isCreate);
  const notes = useNoteStore((state) => state.notes);
  const isShow = useNoteStore((state) => state.isShow);
  const fetchNotes = useNoteStore((state) => state.fetchNotes);


  useEffect(() => {
    // Only fetch notes when product changes, not when vehicle changes
    // Vehicle change is handled by VehicleCanvasWrapper to avoid duplicate calls
    const token = getCookie('access_token');
    if (token && chosenProduct?.id) {
      fetchNotes(chosenProduct.id, selectedVehicleId || undefined);
    }
  }, [fetchNotes, chosenProduct?.id]); // Removed selectedVehicleId to avoid duplicate calls

  const [entity, setEntity] = useState<number[]>([]);
  const [previewEntity] = useState<number[]>([]);

  const isDraggingCanvas = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const minScale = 0.05;
  const maxScale = 1.25;

  const layer = entity.length + 1;

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();

      const scaleBy = 1.05;
      const direction = e.deltaY > 0 ? 1 : -1;
      let newScale = direction > 0 ? scale / scaleBy : scale * scaleBy;

      let newEntity = [...entity];

      if (newScale > maxScale && previewEntity.length === layer) {
        newEntity = [...previewEntity];
        newScale = minScale + 0.01;
      } else if (newScale < minScale && entity.length > 0) {
        newEntity = entity.slice(0, -1);
        newScale = maxScale - 0.01;
      }

      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldX = (mouseX - offset.x) / scale;
      const worldY = (mouseY - offset.y) / scale;

      const newOffsetX = mouseX - worldX * newScale;
      const newOffsetY = mouseY - worldY * newScale;

      setEntity(newEntity);
      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
    },
    [scale, offset, entity, layer, previewEntity, setOffset, setScale]
  );

  const handleMouseDown = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-draggable]')) return;
    isDraggingCanvas.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingCanvas.current) return;
      const dx = e.clientX - lastMousePos.current.x;
      const dy = e.clientY - lastMousePos.current.y;
      setOffset({ x: offset.x + dx, y: offset.y + dy });
      lastMousePos.current = { x: e.clientX, y: e.clientY };
    },
    [offset, setOffset]
  );

  const handleMouseUp = () => {
    isDraggingCanvas.current = false;
  };

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    wrapper.addEventListener('wheel', handleWheel, { passive: false });
    wrapper.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      wrapper.removeEventListener('wheel', handleWheel);
      wrapper.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleWheel, handleMouseMove]);

  // Error: 'onSetPreview' is assigned a value but never used.
  // const onSetPreview = (index: number) => {
  //   const updatedPreview = [...entity.slice(0, layer - 1), index];
  //   setPreviewEntity(updatedPreview);
  // };

  return (
    <div
      ref={wrapperRef}
      className="w-[100vw] h-[100vh] overflow-hidden relative "
    >
      <div
        className="absolute top-0 left-0"
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: 'top left',
        }}
      >
        <div className="w-[100vw] h-[100vh] relative">
          {/* <VehicleFull /> */}

          {/* {mockVehicleList.map((vehicle, index) => (
            <VehicleList {...vehicle} key={index} />
          ))} */}
          {isCreate && (
            <div data-draggable className="absolute z-999">
              <CreateNote />
            </div>
          )}
          {isShow && notes && notes.length > 0 && notes.map((note, index) => <Note key={index} {...note} />)}
        </div>
      </div>
    </div>
  );
};

export default InfiniteCanvasWrapper;

import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';
import { CanvasTextInstance } from '@/workspaces/designWorkspace/types';
import Konva from 'konva';
import type { KonvaEventObject, Node } from 'konva/lib/Node';
import { TextConfig } from 'konva/lib/shapes/Text';
import React, { useEffect, useRef } from 'react';
import { Text } from 'react-konva';
import { Html as KonvaHtml } from 'react-konva-utils';

interface RenderTextInstanceProps extends TextConfig {
  instance: CanvasTextInstance;
}

export const RenderTextInstance: React.FC<RenderTextInstanceProps> = ({ instance, ...props }) => {
  const { updateInstance } = useCanvasLayersStore();
  const textRef = useRef<Konva.Text | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const onTransformEndText = (e: KonvaEventObject<Event>) => {
    const node = e.target as Node & {
      x: () => number;
      y: () => number;
      scaleX: () => number;
      scaleY: () => number;
      rotation: () => number;
      width?: () => number;
      height?: () => number;
    };
    if (node.width) {
      const newProps: Partial<typeof instance.object> = {
        x: node.x(),
        y: node.y(),
        scaleX: 1,
        scaleY: 1,
        width: node.width() * node.scaleX(),
        height: node.height() * node.scaleY(),
        rotation: node.rotation(),
      };

      updateInstance(instance.id, (inst) => ({
        ...inst,
        object: {
          ...inst.object,
          ...newProps,
        },
      } as CanvasTextInstance));
    }
  };
  useEffect(() => {
    if (!instance.editing) return;

    // Затримка
    const timeoutId = setTimeout(() => {
      const textarea = textareaRef.current;
      const textNode = textRef.current;
      if (!textarea || !textNode) return;

      textarea.value = instance.object.text ?? 'undefined';
      textarea.style.position = 'absolute';

      const textPosition = textNode.absolutePosition();
      const areaPosition = {
        x: textPosition.x,
        y: textPosition.y,
      };
      textarea.style.position = 'absolute';
      textarea.style.top = `${areaPosition.y}px`;
      textarea.style.left = `${areaPosition.x}px`;
      textarea.style.width = `${textNode.width() - textNode.padding() * 2}px`;
      textarea.style.fontSize = `${textNode.fontSize()}px`;
      textarea.style.letterSpacing = `${textNode.letterSpacing()}px`;
      textarea.style.lineHeight = `${textNode.lineHeight()}px`;
      textarea.style.border = 'none';
      textarea.style.padding = '0px';
      textarea.style.margin = '0px';
      textarea.style.overflow = 'hidden';
      textarea.style.background = 'none';
      textarea.style.outline = 'none';
      textarea.style.resize = 'none';
      textarea.style.lineHeight = `${textNode.lineHeight().toString()}`;
      textarea.style.fontFamily = textNode.fontFamily();
      textarea.style.transformOrigin = 'left top';
      textarea.style.textAlign = textNode.align();

      textarea.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          updateInstance(instance.id, inst => ({
            ...inst,
            object: { ...inst.object, text: textarea.value },
            editing: false,
          } as CanvasTextInstance));
        }
        if (e.key === 'Escape') {
          updateInstance(instance.id, (inst) => ({
            ...inst,
            editing: false,
          }));
        }
      };

      textarea.addEventListener('keydown', handleKeyDown);
      // Cleanup
      return () => {
        textarea.removeEventListener('keydown', handleKeyDown);
      };
    });

    return () => clearTimeout(timeoutId);
  }, [instance, updateInstance]);

  if (instance.editing) {
    return (
      <>
        <Text
          {...props}
          {...instance.object}
          ref={textRef}
          visible={false}
        />
        <KonvaHtml>
          <textarea ref={textareaRef} />
        </KonvaHtml>
      </>
    );
  }

  return (
    <Text
      ref={textRef}
      {...props}
      {...instance.object}
      onDblClick={() => {
        updateInstance(instance.id, (inst) => ({
          ...inst,
          editing: true,
        }));
      }}
      onTransformEnd={onTransformEndText}
    />
  );
};

import { create } from 'zustand';
import type { AIMessages } from '../types';
import React from 'react';
import type Konva from 'konva';

interface DesignWorkspaceState {
  stageRef: React.RefObject<Konva.Stage | null> | null;
  stageSize: { width: number; height: number };
  aiMessages: AIMessages;
  showAIPartner: boolean;
  zoom: number;
  transformerRef: React.RefObject<Konva.Transformer | null> | null;
  setStagePos: ((pos: { x: number; y: number }) => void) | null;

  // setters
  setStageRef: (ref: React.RefObject<Konva.Stage | null>) => void;
  setStageSize: (size: { width: number; height: number }) => void;
  setShowAIPartner: (v: boolean) => void;
  setAIMessages: (messages: AIMessages) => void;
  setZoom: (zoom: number) => void,
  setTransformerRef: (ref: React.RefObject<Konva.Transformer | null>) => void;
  registerSetStagePos: (fn: (pos: { x: number; y: number }) => void) => void;
}

export const useDesignWorkspaceStore = create<DesignWorkspaceState>((set) => ({
  transformerRef: null,
  stageSize: { width: 500, height: 500 },
  selectedObject: null,
  aiMessages: [],
  showAIPartner: false,
  stageRef: null,
  zoom: 1,
  setStagePos: null,
  setZoom: (zoom: number)=> set({zoom:zoom}),
  setStageRef: (ref) => set({stageRef: ref}),
  setStageSize: (size) => set({ stageSize: size }),
  setShowAIPartner: (v) => set({ showAIPartner: v }),
  setAIMessages: (messages) => set({ aiMessages: messages }),
  setTransformerRef: (ref) => set({ transformerRef: ref }),
  registerSetStagePos: (fn) => set({ setStagePos: fn }),
}));

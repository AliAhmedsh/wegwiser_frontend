import { FrameTypes, InclinedTypes, MouseTypes, PenTypes, ShapeTypes } from '@/workspaces/designWorkspace/types';
import React from 'react';


export interface ShapeOption  {
  name : ShapeTypes;
  label : string;
  icon : React.ComponentType<{ className?: string }>;
  hotkeyTitle?:string
}
export interface FrameOption  {
  name : FrameTypes;
  label : string;
  icon : React.ComponentType<{ className?: string }>;
  hotkeyTitle?:string
}
export interface InclinedOption {
  name : InclinedTypes;
  label : string;
  icon : React.ComponentType<{ className?: string }>;
  hotkeyTitle?:string
}
export interface MouseOption {
  name: MouseTypes;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hotkeyTitle?:string
}

export interface PenOption {
  name : PenTypes;
  label : string;
  icon : React.ComponentType<{ className?: string }>;
  hotkeyTitle?:string
}
export type ToolbarMenuOption = ShapeOption | FrameOption | PenOption | MouseOption | InclinedOption;

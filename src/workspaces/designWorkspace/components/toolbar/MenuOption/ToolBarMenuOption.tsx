import React from 'react';
import CheckIconIsSelected from '@/workspaces/designWorkspace/components/toolbar/CheckIconIsSelected';

interface Props {
  Icon: React.ComponentType<{ className?: string }>;
  label: string;
  hotkey: string | undefined;
  onClick: () => void;
  ExtraComponent?: React.ReactNode;
  isSuchToolSelected: boolean;
}

export const ToolbarShapeMenuOption: React.FC<Props> = ({
                                                          Icon,
                                                          label,
                                                          onClick,
                                                          ExtraComponent,
                                                          isSuchToolSelected,
                                                          hotkey,
                                                        }) => {
  return (
    <div
      onClick={() => {
        onClick();
      }}
      className={`flex items-center gap-2 px-3 py-2 text-nowrap opacity-80 hover:bg-[#F3F3F3] ${
        isSuchToolSelected && 'bg-[#E9ECF1]'}`}
    >
      <CheckIconIsSelected isSelected={isSuchToolSelected} />
      <Icon className="w-4 h-4" />
      <span className="pl-4">{label}</span>
      {ExtraComponent}
      <span className="pl-4 ml-auto font-normal">{hotkey}</span>
    </div>
  );
};

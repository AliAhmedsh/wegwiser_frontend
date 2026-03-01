import * as ContextMenu from '@radix-ui/react-context-menu';
import React, { ReactNode } from 'react';

interface MenuItem {
  label?: string;
  iconComponent?: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface HorizontalContextMenuProps {
  children: ReactNode;
  menuItems: MenuItem[];
}

const HorizontalContextMenu: React.FC<HorizontalContextMenuProps> = ({
  children,
  menuItems,
}) => {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>

      <ContextMenu.Portal container={document.body}>
        <ContextMenu.Content className="bg-[#000] rounded-md shadow-md px-2 w-auto flex space-x-2 font-arial font-[400] text-[12px] text-[#fff] z-100">
          {menuItems.map(({ label, iconComponent, onClick, disabled }, idx) => (
            <ContextMenu.Item
              key={idx}
              className={`px-1 py-2 cursor-pointer rounded whitespace-nowrap`}
              onSelect={disabled ? undefined : onClick}
              disabled={disabled}
            >
              {iconComponent}
              {label}
            </ContextMenu.Item>
          ))}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  );
};

export default HorizontalContextMenu;

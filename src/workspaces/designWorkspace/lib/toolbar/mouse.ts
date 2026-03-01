import MouseIcon from '@/shared/icons/MouseIcon';
import { MouseOption } from '@/workspaces/designWorkspace/types';
import HandToolIcon from '@/shared/icons/HandToolIcon';
import ExpandIcon from '@/shared/icons/ExpandIcon';

export const mouseOptions: MouseOption[] = [
  { name: 'move', label: 'Move', icon: MouseIcon, hotkeyTitle: 'V' },
  { name: 'hand', label: 'Hand Tool', icon: HandToolIcon, hotkeyTitle: 'H' },
  { name: 'scale', label: 'Scale', icon: ExpandIcon , hotkeyTitle: 'K' },
];

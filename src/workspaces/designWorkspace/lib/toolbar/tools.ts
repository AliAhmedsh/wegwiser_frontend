import MouseIcon from '@/shared/icons/MouseIcon';
import HashtagIcon from '@/shared/icons/HashtagIcon';
import InclinedStick from '@/shared/icons/InclinedStick';
import TextIcon from '@/shared/icons/TextIcon';
import ShapesIcon from '@/shared/icons/ShapesIcon';
import ChainIcon from '@/shared/icons/ChainIcon';
import CodeIcon from '@/shared/icons/CodeIcon';
import { FC } from 'react';
import { ToolType } from '@/workspaces/designWorkspace/types/toolbar/toolType';

type Tool = {
  name: ToolType;
  icon: FC;
}
export const toolsOptions: Tool[]  = [
  { name: 'mouse', icon: MouseIcon },
  { name: 'frame', icon: HashtagIcon },
  { name: 'inclined', icon: InclinedStick },
  { name: 'text', icon: TextIcon },
  { name: 'pen', icon: CodeIcon },
  { name: 'shapes', icon: ShapesIcon },
  { name: 'chain', icon: ChainIcon },
  { name: 'code', icon: CodeIcon },
];
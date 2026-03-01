import { CanvasInstance } from '../../../types';
import  ListBullets from "../../../assets/icons/ListBullets.svg";
import  TextIcon from "../../../assets/icons/Text.svg";
import  TriangleIcon from "../../../assets/icons/Triangle.svg";
import  LineIcon from "../../../assets/icons/Line.svg";
import  PenIcon from "../../../assets/icons/Pen.svg";
import RectangleIcon from '@/shared/icons/RectangleIcon';
import HexagonIcon from '@/shared/icons/HexagonIcon';
import EllipseIcon from '@/shared/icons/EllipseIcon';
import StarIcon from '@/shared/icons/StarIcon';

// Helper to get icon
export const getIconForInstance = (instance: CanvasInstance) => {
  if (instance.type === 'text') return <TextIcon size={12} />;
  if (instance.type === 'rectangle') return <RectangleIcon size={12} />;
  if (instance.type === 'group') return <ListBullets size={12} />;
  if (instance.type === 'line') return <LineIcon size={12} />;
  if (instance.type === 'pen') return <PenIcon size={12} />;
  if (instance.type === 'polygon') return <HexagonIcon size={12} />;
  if (instance.type === 'ellipse') return <EllipseIcon size={12} />;
  if (instance.type === 'star') return <StarIcon size={12} />;
  if (instance.type === 'arrow') return <TriangleIcon size={12} />;
  return <ListBullets size={12} />;
};
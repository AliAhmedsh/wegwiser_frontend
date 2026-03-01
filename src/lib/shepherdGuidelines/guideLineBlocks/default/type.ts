import { StepOptionsAttachTo } from 'shepherd.js';

interface DefaultGuidelineBlockProps {
  media: string;
  title: string;
  text: string;
  count: number;
  maxCount: number;
  mediaType: 'video' | 'image' | 'GIF';
  onCancel: () => void;
  onNext: () => void;
}

interface DefaultGuidelineSteps {
  id: string;
  count: number;
  attachTo?: StepOptionsAttachTo;
  title: string;
  text: string;
}

export type { DefaultGuidelineBlockProps, DefaultGuidelineSteps };

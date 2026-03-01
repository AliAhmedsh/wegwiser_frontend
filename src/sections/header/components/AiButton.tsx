import Button from '@/shared/ui/button';
import useAiStore from '@/store/AiStore';
import { useGuidelineStore } from '@/store/guidelinesStore';
import useWorkspaceStore from '@/store/workSpaceStore';

export default function AiButton() {
  const { step } = useGuidelineStore();
  const { setFullScreen } = useWorkspaceStore();
  const { toggleAiWindow } = useAiStore();

  return (
    <div
      className={`ai-button fixed h-10 w-10 right-3 bottom-3 ${
        step === 3 ? 'z-110 pointer-events-none' : 'z-60'
      }`}
      onMouseDown={() => setFullScreen(false)}
      onClick={toggleAiWindow}
    >
      <Button image="/corner-buttons/AI.svg" />
    </div>
  );
}

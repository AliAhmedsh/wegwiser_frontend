import Button from '@/shared/ui/button';
import { useGuidelineStore } from '@/store/guidelinesStore';
import useWorkspaceStore from '@/store/workSpaceStore';
import { useModalWindowStore } from '@/store/modalWindowsStore';

export default function HelpButton() {
  const { step, setIsGuidelining } = useGuidelineStore();
  const { setFullScreen, isFullScreen } = useWorkspaceStore();
  const { iconographyPopupOpen, setIconographyPopupOpen } = useModalWindowStore();

  const handleClick = () => {
    setFullScreen(false);
    if (iconographyPopupOpen) {
      setIconographyPopupOpen(false);
    } else {
      setIconographyPopupOpen(true);
      setIsGuidelining(false); // Close guideline if open
    }
  };

  return (
    <div
      className={`education-button h-10 w-10 fixed left-3 top-3 ${
        step === 1 && isFullScreen ? 'z-110 pointer-events-none' : 'z-20'
      }`}
      onMouseDown={() => setFullScreen(false)}
      onClick={handleClick}
    >
      <Button image="/corner-buttons/education.svg" />
    </div>
  );
}

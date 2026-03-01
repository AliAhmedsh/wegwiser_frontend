import { useMessagingModalStore } from '@/entities/messagingModal/model';
import Button from '@/shared/ui/button';
import { useGuidelineStore } from '@/store/guidelinesStore';
import useWorkspaceStore from '@/store/workSpaceStore';

export default function MessageButton() {
  const { step } = useGuidelineStore();
  const { isFullScreen, setFullScreen } = useWorkspaceStore();
  const { isOpen, openModal: openMessagingModal, closeModal: closeMessagingModal } = useMessagingModalStore();

  const handleToggleMessaging = () => {
    setFullScreen(false);
    if (isOpen) {
      closeMessagingModal();
    } else {
      openMessagingModal();
    }
  };

  return (
    <div
      className={`message-button fixed left-3 bottom-3 ${step === 2 ? 'z-110 pointer-events-none' : 'z-50'
        } ${isFullScreen ? '' : 'w-10 h-10'}`}
      onMouseDown={handleToggleMessaging}
    >
      <Button image="/corner-buttons/messages.svg" />
    </div>
  );
}

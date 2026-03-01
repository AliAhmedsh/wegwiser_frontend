import { useWorkspaceStore } from '@/entities/workspace';
import Modal from '@/shared/portals/ModalWindow';
import EngineerWorkspace from '@/workspaces/engineerWorkspace/EngineerWorkspace';

export default function WorkspaceModal() {
  const { isOpen, closeWorkspace } = useWorkspaceStore();

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={closeWorkspace}>
      <EngineerWorkspace onClose={closeWorkspace} />
    </Modal>
  );
}

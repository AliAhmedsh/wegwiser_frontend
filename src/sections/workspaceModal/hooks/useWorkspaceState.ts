import { useState } from 'react';

type SidebarTab =
  | 'explorer'
  | 'people'
  | 'design'
  | 'stars'
  | 'plus'
  | 'settings';

interface UseWorkspaceStateReturn {
  activeSidebarTab: SidebarTab;
  setActiveSidebarTab: (tab: SidebarTab) => void;
  aiCollapsed: boolean;
  setAiCollapsed: (collapsed: boolean) => void;
  selectedDesignId: number | null;
  setSelectedDesignId: (id: number | null) => void;
  showGenModal: 'none' | 'generating' | 'preview';
  setShowGenModal: (state: 'none' | 'generating' | 'preview') => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
}

export const useWorkspaceState = (): UseWorkspaceStateReturn => {
  const [activeSidebarTab, setActiveSidebarTab] =
    useState<SidebarTab>('explorer');
  const [aiCollapsed, setAiCollapsed] = useState(false);
  const [selectedDesignId, setSelectedDesignId] = useState<number | null>(null);
  const [showGenModal, setShowGenModal] = useState<
    'none' | 'generating' | 'preview'
  >('none');
  const [prompt, setPrompt] = useState('');

  return {
    activeSidebarTab,
    setActiveSidebarTab,
    aiCollapsed,
    setAiCollapsed,
    selectedDesignId,
    setSelectedDesignId,
    showGenModal,
    setShowGenModal,
    prompt,
    setPrompt,
  };
};

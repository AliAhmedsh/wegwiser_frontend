import { useEffect, useRef, useState } from 'react';

import globalUseWorkspaceStore from '@/store/workSpaceStore';
import { useWorkspaceState } from './hooks/useWorkspaceState';
import { useWorkspaceStore, WorkspaceFile, WorkspaceTab } from './store/store';

import { useProductStore } from '@/entities/product/store';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';
import { useQueryClient } from '@tanstack/react-query';
import { fastApiService } from '@/lib/api/services/fastApiService';
import { useEngineeringGenerateByVehicleMutation } from '@/lib/api/hooks/useFastApi';
import DesignPanel from '@/sections/designPanel/DesignPanel';
import CodeEditor from './core/CodeEditor';
import GenModal from './modals/GenModal';
import AIPartner from './sections/ai-partner/AIPartner';
import Console from './sections/console/Console';
import DesignFilesPreview from './sections/design-files-preview/DesignFilesPreview';
import Header from './sections/header/Header';
import PanelHeader from './sections/panel-header/PanelHeader';
import ExplorerPanel from './sections/panels/ExplorerPanel';
import PeoplePanel from './sections/panels/PeoplePanel';
import PlusPanel from './sections/panels/PlusPanel';
import AiLogPanel from './sections/panels/StarsPanel';
import Sidebar from './sections/sidebar/Sidebar';
import FileList from './sections/tabs/FileList';
import Tabs from './sections/tabs/Tabs';

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import PlayIcon from '@/shared/icons/PlayIcon';
import SideBarIcon from '@/shared/icons/SideBarIcon';
import { Open_Sans } from 'next/font/google';

const OpenSans600 = Open_Sans({
  weight: ['600'],
  subsets: ['latin'],
});

const EngineerWorkspace = function ({ onClose }: { onClose?: () => void } = {}) {
  const [runCodeFunction, setRunCodeFunction] = useState<((code: string, fileName?: string) => void) | null>(null);
  const { chosenProduct } = useProductStore();

  // Check if a product is selected
  if (!chosenProduct) {
    return (
      <div className="fixed inset-0 z-5 flex items-center justify-center bg-black/30">
        <div className="relative h-auto w-[400px] bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#FFA500" />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900">No Product Selected</h3>
          <p className="text-center text-gray-600">
            Please select a product before opening the Engineering Workspace.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-[#627899] text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSetRunCodeFunction = (fn: (code: string, fileName?: string) => void) => {
    setRunCodeFunction(() => fn);
  };

  const {
    explorer,
    tabs,
    currentTab,
    currentFile,
    addTab,
    closeTab,
    setCurrentTab,
    setCurrentFile,
  } = useWorkspaceStore();
  
  const { selectedVehicleId } = useSelectedVehicleStore();
  const queryClient = useQueryClient();
  const fastApiCodegen = useEngineeringGenerateByVehicleMutation();

  const {
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
    generatedCode,
    setGeneratedCode,
    generationError,
    setGenerationError,
  } = useWorkspaceState();

  const onSelectDesign = (id: number) => {
    setActiveSidebarTab('filesPreview');
    setSelectedDesignId(id);
  };

  const handleAddTab = async (file: WorkspaceFile) => {
    console.log('🔵 handleAddTab called with file:', file);
    
    // Check if file has backend ID (numeric ID means it's from backend)
    const fileIdNum = parseInt(file.id);
    const isBackendFile = !isNaN(fileIdNum) && fileIdNum > 0;
    
    console.log('📋 File details:', {
      id: file.id,
      fileIdNum,
      isBackendFile,
      type: file.type,
      hasContent: !!file.content
    });
    
    // For backend files, use React Query cache for instant display + background refresh
    if (isBackendFile && file.type === 'file' && selectedVehicleId) {
      // Check cache first for instant display
      const cacheKey = ['engineering-file-content', 'detail', fileIdNum, selectedVehicleId];
      const cachedData = queryClient.getQueryData<{ success: boolean; file?: any; error?: string }>(cacheKey);
      
      if (cachedData?.success && cachedData.file) {
        console.log('⚡ Using cached file content');
        // Use cached data immediately
        const fileWithContent: WorkspaceFile = {
          ...file,
          content: cachedData.file.content || ''
        };
        const newTab: WorkspaceTab = { id: file.id, name: file.name, file: fileWithContent };
        addTab(newTab);
        setCurrentTab(newTab);
        setCurrentFile(fileWithContent);
        
        queryClient.fetchQuery({
          queryKey: cacheKey,
          queryFn: async () => {
            const { engineeringFilesService } = await import('@/entities/tickets/api/engineeringFilesService');
            return engineeringFilesService.getFileContent(fileIdNum, selectedVehicleId);
          },
          staleTime: 5 * 60 * 1000,
        }).then((response) => {
          if (response.success && response.file) {
            // Check if content changed
            const currentContent = fileWithContent.content || '';
            const newContent = response.file.content || '';
            
            if (currentContent !== newContent) {
              console.log('🔄 File content updated silently from background fetch');
              // Update the file content silently
              const updatedFile: WorkspaceFile = {
                ...fileWithContent,
                content: newContent
              };
              const currentState = useWorkspaceStore.getState();
              if (currentState.currentFile?.id === file.id) {
                currentState.setCurrentFile(updatedFile);
                // Update the tab as well
                const updatedTab: WorkspaceTab = { id: file.id, name: file.name, file: updatedFile };
                currentState.setCurrentTab(updatedTab);
              }
            }
          }
        }).catch((error) => {
          console.error('❌ Background fetch error:', error);
        });
        
        return;
      } else {
        // No cache, fetch immediately
        console.log('📥 Fetching file content (no cache)');
        try {
          const { engineeringFilesService } = await import('@/entities/tickets/api/engineeringFilesService');
          const response = await engineeringFilesService.getFileContent(fileIdNum, selectedVehicleId);
          
          // Cache the response
          queryClient.setQueryData(cacheKey, response);
          
          if (response.success && response.file) {
            console.log('✅ File content fetched and cached');
            const fileWithContent: WorkspaceFile = {
              ...file,
              content: response.file.content || ''
            };
            const newTab: WorkspaceTab = { id: file.id, name: file.name, file: fileWithContent };
            addTab(newTab);
            setCurrentTab(newTab);
            setCurrentFile(fileWithContent);
            return;
          }
        } catch (error) {
          console.error('❌ Error fetching file content:', error);
        }
      }
    } else if (isBackendFile && file.type === 'file') {
      console.warn('⚠️ No selectedVehicleId, cannot fetch file content');
    } else {
      console.log('ℹ️ Skipping API call - not a backend file or is a folder');
    }
    
    // Use file as-is if it's a local file or folder, or if API call failed
    const newTab: WorkspaceTab = { id: file.id, name: file.name, file };
    addTab(newTab);
    setCurrentTab(newTab);
    setCurrentFile(file);
  };

  const handleCloseTab = (tab: WorkspaceTab) => {
    closeTab(tab);

    if (tabs.length === 1) {
      setCurrentFile(null);
      setCurrentTab(null);
      return;
    }

    const deletedTabPos = tabs.findIndex((storeTab) => storeTab.id === tab.id);
    let nextActiveTab: WorkspaceTab;
    if (deletedTabPos === tabs.length - 1) {
      nextActiveTab = tabs[deletedTabPos - 1];
    } else {
      nextActiveTab = tabs[deletedTabPos + 1];
    }

    setCurrentFile(nextActiveTab.file);
    setCurrentTab(nextActiveTab);
  };

  const handleTabChange = (tab: WorkspaceTab) => {
    setCurrentTab(tab);
    setCurrentFile(tab.file);
  };

  const sidebarPanels = {
    explorer: <ExplorerPanel explorer={explorer} onTabAdd={handleAddTab} currentFile={currentFile} />,
    people: <PeoplePanel />,
    design: (
      <DesignPanel
      // Don't pass workspaceId - let DesignFilesTab fetch it from product
      />
    ),
    stars: <AiLogPanel productId={chosenProduct.id} currentFile={currentFile} />,
    // settings: <SettingsPanel />,
    plus: <PlusPanel />,
    filesPreview: <DesignFilesPreview />,
  };

  useEffect(() => {
    if (activeSidebarTab !== 'design' && selectedDesignId !== null) {
      setSelectedDesignId(null);
    }
  }, [activeSidebarTab, selectedDesignId, setSelectedDesignId]);

  async function handlePromptSend(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setShowGenModal('generating');
    setGenerationError(null);
    setGeneratedCode(null);

    try {
      const prdId = localStorage.getItem('prd_id');
      const vehicleId = selectedVehicleId;
      
      if (prdId && vehicleId) {
        const filename = currentFile?.name || 'generated_code.py';
        const fileExtension = currentFile?.name?.split('.').pop()?.toLowerCase() || '';
        const filePath = currentFile?.path || '';
        
        let language = 'python';
        let framework = '';
        let target = 'backend';
        
        if (fileExtension === 'py') {
          language = 'python';
          framework = '';
          target = 'backend';
        } else if (fileExtension === 'ts' || fileExtension === 'tsx') {
          language = 'typescript';
          framework = 'react';
          target = 'frontend';
        } else if (fileExtension === 'js' || fileExtension === 'jsx') {
          language = 'javascript';
          framework = 'react';
          target = 'frontend';
        } else if (fileExtension === 'java') {
          language = 'java';
          framework = 'spring';
          target = 'backend';
        } else if (fileExtension === 'go') {
          language = 'go';
          framework = '';
          target = 'backend';
        } else if (fileExtension === 'rs') {
          language = 'rust';
          framework = '';
          target = 'backend';
        } else if (fileExtension === 'php') {
          language = 'php';
          framework = 'laravel';
          target = 'backend';
        } else if (fileExtension === 'rb') {
          language = 'ruby';
          framework = 'rails';
          target = 'backend';
        }
        
        if (filePath.includes('frontend') || filePath.includes('client') || filePath.includes('ui')) {
          target = 'frontend';
        } else if (filePath.includes('backend') || filePath.includes('server') || filePath.includes('api')) {
          target = 'backend';
        }
        
        console.log('[Engineering Workspace] Calling FastAPI POST /engineering/generate-by-vehicle');
        console.log('Request:', {
          prd_id: prdId,
          vehicle_id: vehicleId,
          filename,
          target,
          instruction: prompt,
          language,
          framework
        });
        
        try {
          const response = await fastApiService.generateCodeByVehicle(
            prdId,
            vehicleId,
            filename,
            target,
            prompt,
            language,
            framework
          );
          console.log('[Engineering Workspace] FastAPI Response:', response);

          if (response.code) {
            setGeneratedCode(response.code);
            setShowGenModal('preview');
            
            console.log('[Engineering Workspace] Calling POST /evaluation/evaluate after code generation');
            try {
              const evalResponse = await fastApiService.evaluateByVehicle(prdId, vehicleId);
              console.log('[Engineering Workspace] Evaluation Response:', evalResponse);
            } catch (evalError: any) {
              console.error('[Engineering Workspace] Evaluation Error:', evalError);
            }
            
            return;
          } else if (response.filename_suggestion) {
            setGeneratedCode(response.code || '');
            setShowGenModal('preview');
            
            console.log('[Engineering Workspace] Calling POST /evaluation/evaluate after code generation');
            try {
              const evalResponse = await fastApiService.evaluateByVehicle(prdId, vehicleId);
              console.log('[Engineering Workspace] Evaluation Response:', evalResponse);
            } catch (evalError: any) {
              console.error('[Engineering Workspace] Evaluation Error:', evalError);
            }
            
            return;
          } else {
            throw new Error('No code in response');
          }
        } catch (fastApiError: any) {
          console.error('[Engineering Workspace] FastAPI Error:', fastApiError);
          setGenerationError(fastApiError.response?.data?.detail || fastApiError.message || 'FastAPI call failed');
          setShowGenModal('preview');
          return;
        }
      } else {
        console.warn('[Engineering Workspace] FastAPI call skipped - missing:', {
          prdId: !prdId,
          vehicleId: !vehicleId
        });
      }

      console.log('[Engineering Workspace] Using fallback API - Node.js backend');

      const { engineeringFilesService } = await import('@/entities/tickets/api/engineeringFilesService');
      const type: 'code' | 'testcase' = prompt.toLowerCase().includes('test') || prompt.toLowerCase().includes('testcase') 
        ? 'testcase' 
        : 'code';
      const context = currentFile?.content || '';
      const fileExtension = currentFile?.name?.split('.').pop()?.toLowerCase() || '';
      let language = 'typescript';
      let framework = 'react';
      
      if (fileExtension === 'py') {
        language = 'python';
        framework = '';
      } else if (fileExtension === 'js' || fileExtension === 'jsx') {
        language = 'javascript';
        framework = 'react';
      } else if (fileExtension === 'ts' || fileExtension === 'tsx') {
        language = 'typescript';
        framework = 'react';
      }

      const response = await engineeringFilesService.generateAI(chosenProduct.id, {
        prompt: prompt.trim(),
        type,
        context,
        language,
        framework,
      });

      if (response.success && response.result) {
        setGeneratedCode(response.result);
        setShowGenModal('preview');
      } else {
        setGenerationError(response.error || response.details || 'Failed to generate code');
        setShowGenModal('preview');
      }

      // Also fire FastAPI vehicle-aware code generation if a vehicle is selected
      if (selectedVehicleId) {
        try {
          const fastApiResult = await fastApiCodegen.mutateAsync({
            prd_id: String(chosenProduct.id),
            vehicle_id: Number(selectedVehicleId),
            filename: currentFile?.name || 'generated.ts',
          });
          console.log('FastAPI code-gen result:', fastApiResult);
          // If Express codegen failed but FastAPI succeeded, use FastAPI result
          if (!response.success && fastApiResult) {
            const code = typeof fastApiResult === 'string' ? fastApiResult : (fastApiResult as any)?.code || JSON.stringify(fastApiResult);
            setGeneratedCode(code);
            setGenerationError(null);
            setShowGenModal('preview');
          }
        } catch (fastApiErr) {
          console.warn('FastAPI code-gen failed (non-blocking):', fastApiErr);
        }
      }
    } catch (error) {
      console.error('Error generating AI code:', error);
      setGenerationError(error.response?.data?.detail || error.message || 'An unexpected error occurred');
      setShowGenModal('preview');
    }
  }

  function handleGenModalClose() {
    setShowGenModal('none');
    setPrompt('');
    setGeneratedCode(null);
    setGenerationError(null);
  }

  const handleRunCode = () => {
    if (runCodeFunction && currentFile?.content) {
      runCodeFunction(currentFile.content, currentFile.name);
    } else {
      console.error('Cannot run code: runCodeFunction not available or no file content');
    }
  };

  const { isFullScreen, setFullScreen, fullScreenStyles, notFullScreenStyles } =
    globalUseWorkspaceStore();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onEnterFullScreen = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setFullScreen(true);
      timeoutRef.current = null;
    }, 250);
  };

  const isFilesPreviewTab = activeSidebarTab === 'filesPreview';

  return (
    <div
      onMouseEnter={onEnterFullScreen}
      className={`relative h-[83vh] w-[90vw] rounded-xl bg-[#FFF] shadow-2xl overflow-hidden flex flex-col ${isFullScreen ? fullScreenStyles : notFullScreenStyles
        }`}
      style={{
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: 'auto',
      }}
    >
      <Header />

      <div className={`grid grid-cols-[41px_1fr] flex-1 ${OpenSans600.className}`} >
        <Sidebar
          activeTab={activeSidebarTab}
          onTabChange={setActiveSidebarTab}
        />
        <div className='grid grid-rows-[42px_1fr] px-2 pt-2'>

          <div className="flex px-1 items-center justify-between">
            <PanelHeader activeTab={activeSidebarTab} />

            <div className="flex items-center gap-2 mr-2">
              <button
                onClick={handleRunCode}
                className="flex justify-center items-center w-6 h-6 rounded-sm hover:bg-gray-200 cursor-pointer"
              >
                <PlayIcon width={24} className="text-[#343330]" />
              </button>
              <button
                className={`flex justify-center items-center w-6 h-6 rounded-sm hover:bg-gray-200 cursor-pointer ${!aiCollapsed && 'bg-gray-300'
                  }`}
                onClick={() => setAiCollapsed(!aiCollapsed)}
              >
                <SideBarIcon height={24} className="text-[#343330]" />
              </button>
            </div>
          </div>

          <ResizablePanelGroup direction="horizontal" className="h-full w-full">
            <ResizablePanel
              defaultSize={isFilesPreviewTab ? 25 : 18}
              minSize={isFilesPreviewTab ? 35 : 18}
              maxSize={isFilesPreviewTab ? 45 : 25}
              className="bg-white pr-2 overflow-y-auto flex flex-row gap-4 relative h-[calc(100%-10px)]"
            >
              <div className="flex flex-col w-full h-full justify-start">
                {sidebarPanels[activeSidebarTab] ?? null}
              </div>
            </ResizablePanel>

            <ResizableHandle />

            <ResizablePanel defaultSize={30} minSize={20}>
              <ResizablePanelGroup direction="vertical" className="flex-1">
                <ResizablePanel className='rounded-t-2xl' defaultSize={70} minSize={30}>
                  <Tabs
                    tabs={tabs}
                    currentTab={currentTab}
                    onTabChange={handleTabChange}
                    onTabClose={handleCloseTab}
                  />
                  <FileList
                    currentFile={currentFile}
                    explorer={explorer}
                    onFileSelect={handleAddTab}
                  />
                  <div className="h-full bg-[#EAEDF2] flex flex-col">
                    <CodeEditor />
                  </div>
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel
                  defaultSize={isFilesPreviewTab ? 45 : 30}
                  minSize={isFilesPreviewTab ? 35 : 20}

                >
                  {isFilesPreviewTab && !aiCollapsed ? (
                    <AIPartner
                      text="Would you like to generate code for the selected screen?"
                      width="100%"
                      isResizing={false}
                      prompt={prompt}
                      onPromptChange={setPrompt}
                      onSubmit={handlePromptSend}
                    />
                  ) : (
                    <Console productId={1} onRunCode={handleSetRunCodeFunction} />
                  )}
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle className='w-1 bg-white' />
            <ResizablePanel
              defaultSize={aiCollapsed ? 15 : 0}
              minSize={aiCollapsed ? 15 : 0}
              maxSize={aiCollapsed ? 40 : 0}
              style={{ display: aiCollapsed ? 'block' : 'none' }}
            >
              <AIPartner
                text={isFilesPreviewTab ? "Would you like to generate code for the selected screen?" : (activeSidebarTab === 'explorer' ? "Looks like the highlighted code lines are showing an error. Wegwiser has generated a correction. Choose from the options of what to do?" : "Select design file to start development")}
                width="100%"
                isResizing={false}
                prompt={prompt}
                onPromptChange={setPrompt}
                onSubmit={handlePromptSend}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
      <GenModal 
        showGenModal={showGenModal} 
        onClose={handleGenModalClose}
        generatedCode={generatedCode}
        error={generationError}
      />
    </div>
  );
};

export default EngineerWorkspace;

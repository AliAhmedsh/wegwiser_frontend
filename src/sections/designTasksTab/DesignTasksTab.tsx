import { useDesignTasks } from '@/entities/designTasks';
import { useProductStore } from '@/entities/product/store';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';
import { isDesigner, isEngineer } from '@/lib/utils/userRole';
import { Open_Sans } from 'next/font/google';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fastApiService } from '@/lib/api/services/fastApiService';

// Removed dummy tasks - all tasks should be dynamic from API

const OpenSans400 = Open_Sans({
  weight: ['400'],
  subsets: ['cyrillic'],
});

interface DesignTasksTabProps {
  workspaceId?: number;
  refreshTrigger?: number;
}

export default function DesignTasksTab({ workspaceId: propWorkspaceId, refreshTrigger = 0 }: DesignTasksTabProps) {
  const { chosenProduct } = useProductStore();
  const { selectedVehicleId } = useSelectedVehicleStore();
  const canCreateTasks = isDesigner() || isEngineer();
  const [effectiveWorkspaceId, setEffectiveWorkspaceId] = useState<number | undefined>(propWorkspaceId);
  const [isInitializing, setIsInitializing] = useState(true);
  const productIdForQuery = effectiveWorkspaceId ? undefined : chosenProduct?.id;

  const { tasks: apiTasks, loading, error, workspace, createTask, updateTask, deleteTask } = useDesignTasks(
    effectiveWorkspaceId ?? null,
    productIdForQuery,
    refreshTrigger,
    selectedVehicleId || undefined
  );
  const [tasks, setTasks] = useState<any[]>([]);
  const [isAddingNewTask, setIsAddingNewTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  // Set workspace ID from props or auto-fetch from product
  useEffect(() => {
    if (propWorkspaceId) {
      setEffectiveWorkspaceId(propWorkspaceId);
      setIsInitializing(false); // We have a workspace ID, no longer initializing
    } else {
      // No workspace ID provided; product-based endpoints will be used directly
      setEffectiveWorkspaceId(undefined);
      setIsInitializing(false);
    }
  }, [propWorkspaceId, chosenProduct?.id]);


  // Always use API tasks - no more dummy tasks
  const isLoadingTasks = isInitializing || loading;
  const displayTasks = apiTasks;
  const useAPI = true; // Always use API

  // Debug logging
  console.log('DesignTasksTab Debug:', {
    propWorkspaceId,
    effectiveWorkspaceId,
    chosenProduct: chosenProduct?.id,
    useAPI,
    isInitializing,
    loading,
    isLoadingTasks,
    apiTasksCount: apiTasks.length,
    displayTasksCount: displayTasks.length,
    error
  });

  const toggleTask = async (id: number) => {
    const task = apiTasks.find((t: any) => t.id === id);
    if (task) {
      const newDoneStatus = !task.done;
      await updateTask(id, { done: newDoneStatus });

      if (newDoneStatus && selectedVehicleId) {
        const userId = parseInt(localStorage.getItem('user_id') || '0');
        const prdId = localStorage.getItem('prd_id');
        if (userId && selectedVehicleId && prdId) {
          (async () => {
            try {
              const { useWorkspaceStore } = await import('@/workspaces/engineerWorkspace/store/store');
              const workspaceStore = useWorkspaceStore.getState();
              const codeSnippets: Array<{ language: string; snippet: string }> = [];
              
              const collectCodeFromFiles = (files: any[]) => {
                files.forEach(file => {
                  if (file.type === 'file' && file.content) {
                    const ext = file.name.split('.').pop()?.toLowerCase() || '';
                    let language = 'javascript';
                    if (ext === 'ts' || ext === 'tsx') language = 'typescript';
                    else if (ext === 'js' || ext === 'jsx') language = 'javascript';
                    else if (ext === 'py') language = 'python';
                    else if (ext === 'html') language = 'html';
                    else if (ext === 'css') language = 'css';
                    
                    codeSnippets.push({ language, snippet: file.content });
                  }
                  if (file.children) {
                    collectCodeFromFiles(file.children);
                  }
                });
              };
              
              collectCodeFromFiles(workspaceStore.explorer);
              
              if (codeSnippets.length > 0) {
                const sessionStorage = typeof window !== 'undefined' ? window.sessionStorage : null;
                const userRole = sessionStorage?.getItem('userRole') || 'engineer';
                const role = userRole.toLowerCase().includes('frontend') ? 'frontend' : 
                            userRole.toLowerCase().includes('backend') ? 'backend' : 
                            userRole.toLowerCase().includes('designer') ? 'ui_designer' : 'frontend';
                
                const now = Date.now();
                const oneDayAgo = now - (24 * 60 * 60 * 1000);
                
                console.log('[DesignTasksTab] Calling evaluation API:', {
                  userId,
                  vehicleId: selectedVehicleId,
                  prdId,
                  codeSnippetsCount: codeSnippets.length,
                  role
                });
                
                try {
                  const evaluationResult = await fastApiService.evaluateCode(
                    userId,
                    selectedVehicleId,
                    codeSnippets,
                    role,
                    { startTime: oneDayAgo, endTime: now }
                  );
                  
                  console.log('[DesignTasksTab] Evaluation result:', evaluationResult);
                } catch (evalError: any) {
                  if (evalError.response?.status === 404 && evalError.response?.data?.detail?.includes('No PRD link found')) {
                    console.warn('[DesignTasksTab] Vehicle not linked to PRD in database. Skipping evaluation.');
                    console.warn('[DesignTasksTab] Vehicle ID:', selectedVehicleId, 'PRD ID from localStorage:', prdId);
                  } else {
                    throw evalError;
                  }
                }
              } else {
                console.warn('[DesignTasksTab] No code snippets found in workspace');
              }
            } catch (error: any) {
              console.error('[DesignTasksTab] Error in evaluation process:', error);
            }
          })();
        }
      }
    }
  };

  const handleAddNewClick = () => {
    setIsAddingNewTask(true);
  };

  const handleAddTask = async () => {
    if (!newTaskText.trim()) return;

    // Check if a product is selected
    if (!chosenProduct) {
      alert('Please select a product to create tasks.');
      return;
    }

    // No need to check for workspace - tasks are linked to product directly
    // Use API to create task with product ID
    const success = await createTask({
      text: newTaskText.trim(),
      productId: chosenProduct.id
    });

    if (success) {
      setNewTaskText('');
      setIsAddingNewTask(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
    setEditingTaskId(null); // Reset editing state when toggling edit mode
    setEditingText('');
  };

  const startEditing = (task: any) => {
    setEditingTaskId(task.id);
    setEditingText(task.text);
  };

  const saveEditing = async (id: number) => {
    if (editingText.trim()) {
      if (useAPI) {
        // Use API to update task
        const success = await updateTask(id, { text: editingText.trim() });
        if (success) {
          setEditingTaskId(null);
          setEditingText('');
        }
      } else {
        // Fallback to local state for mock tasks
        setTasks((tasks) =>
          tasks.map((t) => (t.id === id ? { ...t, text: editingText.trim() } : t))
        );
        setEditingTaskId(null);
        setEditingText('');
      }
    }
  };

  const cancelEditing = () => {
    setEditingTaskId(null);
    setEditingText('');
  };

  return (
    <div className="w-full h-full flex flex-col pr-8">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">Error: {error}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-6 border-b-2 pb-3 border-b-[#535354]">
        <div className="text-sm font-semibold text-[#272727]">Tasks</div>
        <div className="flex items-center gap-4">
          {/* {workspace?.product && (
            <span
              className={`font-medium text-[#3B82F6] text-[14px] ${OpenSans400.className}`}
            >
              Product: {workspace.product.name}
            </span>
          )}
          {effectiveWorkspaceId && (
            <span
              className={`font-medium text-[#10B981] text-[14px] ${OpenSans400.className}`}
            >
              Workspace ID: {effectiveWorkspaceId}
            </span>
          )}
          {!useAPI && (
            <span
              className={`font-medium text-[#F59E0B] text-[14px] ${OpenSans400.className}`}
            >
              Demo Mode
            </span>
          )}
          {loading && (
            <span
              className={`font-medium text-[#6B7280] text-[14px] ${OpenSans400.className}`}
            >
              Loading...
            </span>
          )} */}
          <span
            className={`font-medium text-[#3B82F6] text-[14px] ${OpenSans400.className}`}
          >
            {(() => {
              const formatDate = (dateString: string) => {
                const date = new Date(dateString);
                const now = new Date();
                const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

                if (diffInDays === 0) {
                  return 'Today';
                } else if (diffInDays === 1) {
                  return 'Yesterday';
                } else if (diffInDays < 7) {
                  return `${diffInDays} days ago`;
                } else {
                  return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: '2-digit'
                  });
                }
              };

              if (!chosenProduct) {
                return "No product selected";
              } else if (workspace?.updatedAt) {
                return `Last updated ${formatDate(workspace.updatedAt)}`;
              } else if (apiTasks.length > 0) {
                const latestTask = apiTasks.reduce((latest, task) =>
                  new Date(task.updatedAt) > new Date(latest.updatedAt) ? task : latest
                );
                return `Last updated ${formatDate(latestTask.updatedAt)}`;
              } else {
                return "No tasks yet";
              }
            })()}
          </span>
          <button
            className="text-sm flex items-center gap-1 font-normal text-black cursor-pointer hover:underline"
            onClick={handleEditClick}
          >
            <Image alt="edit" src={'/icons/edit.svg'} width={12} height={12} />
            {isEditing ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 pl-6 overflow-y-auto custom-scrollbar flex-1">
        {/* Show no product selected message */}
        {!chosenProduct && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-[#9D9D9D]">
              <p className="text-sm font-medium mb-1">No product selected</p>
              <p className="text-xs">Please select a product to view and manage tasks</p>
            </div>
          </div>
        )}

        {/* Show loading state during initialization or API loading */}
        {chosenProduct && isLoadingTasks && (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-[#9D9D9D]">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm">Loading tasks...</span>
            </div>
          </div>
        )}

        {/* Show no tasks message when product is selected but no tasks */}
        {chosenProduct && !isLoadingTasks && displayTasks.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <div className="text-center text-[#9D9D9D]">
              <p className="text-sm font-medium mb-1">No tasks yet</p>
              <p className="text-xs">Click "Add New" to create your first task</p>
            </div>
          </div>
        )}

        {/* Show tasks when not loading and product is selected */}
        {chosenProduct && !isLoadingTasks && displayTasks.map((task: any) => (
          <div
            key={task.id}
            className="flex items-center gap-2 text-[14px] text-[#181818]"
          >
            {/* Checkbox for marking task as done */}
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleTask(task.id)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              title="Mark as complete"
            />
            
            {/* Task text with strikethrough when done */}
            <div 
              className="flex items-center gap-2 cursor-pointer flex-1"
              onClick={() => toggleTask(task.id)}
            >
            {editingTaskId === task.id && isEditing ? (
              <input
                type="text"
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') saveEditing(task.id);
                  if (e.key === 'Escape') cancelEditing();
                }}
                  className="flex-1 border-none outline-none bg-transparent text-[14px]"
                autoFocus
              />
            ) : (
                <span className={task.done ? 'line-through text-gray-500' : ''}>
                {task.text}
                </span>
            )}
            </div>
            {isEditing &&
              editingTaskId === task.id && ( // Show Save/Cancel buttons when editing
                <div className="flex gap-2">
                  <button
                    onClick={() => saveEditing(task.id)}
                    className="px-5 py-2 rounded-lg bg-[#EAEDF2] text-[#535354] text-sm font-semibold hover:text-green-600 transition-all cursor-pointer"
                    style={{
                      boxShadow:
                        '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEditing}
                    className="px-5 py-2 rounded-lg bg-[#EAEDF2] text-[#535354] text-sm font-semibold hover:text-red-600 transition-all cursor-pointer"
                    style={{
                      boxShadow:
                        '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            {isEditing &&
              editingTaskId !== task.id && ( // Show Edit icon when not currently editing this task in edit mode
                <button
                  onClick={() => startEditing(task)}
                  className="text-[#535354]"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                  </svg>
                </button>
              )}
          </div>
        ))}

        {/* Show "Add New Task" input when not loading */}
        {!isLoadingTasks && isAddingNewTask && (
          <div className="flex items-center gap-3 pl-6">
            <input
              type="text"
              placeholder="New task description"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              className="w-full rounded-lg px-4 py-2 text-base text-black bg-white outline-none transition-all duration-300 ease-in-out border border-transparent focus:ring-2 focus:ring-transparent"
              style={{
                background:
                  'linear-gradient(#fff, #fff) padding-box, linear-gradient(93.9deg, #2086FE 1.16%, #AB55DC 93.59%) border-box',
                border: '1px solid transparent',
                borderRadius: '0.5rem',
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') handleAddTask();
              }}
              autoFocus
            />
            <button
              onClick={handleAddTask}
              className="px-5 py-2 rounded-lg bg-[#EAEDF2] text-[#535354] text-sm font-semibold hover:text-green-600 transition-all cursor-pointer"
              style={{
                boxShadow:
                  '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
              }}
            >
              Add
            </button>
            <button
              onClick={() => setIsAddingNewTask(false)}
              className="px-5 py-2 rounded-lg bg-[#EAEDF2] text-[#535354] text-sm font-semibold hover:text-red-600 transition-all cursor-pointer"
              style={{
                boxShadow:
                  '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Add New button positioned right after tasks list */}
        {!isAddingNewTask && !isLoadingTasks && canCreateTasks && (
          <div className="mt-6 flex items-start">
            <button
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${!chosenProduct
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#EAEDF2] text-[#535354] cursor-pointer hover:bg-gray-300'
                }`}
              style={chosenProduct ? {
                boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
              } : {}}
              onClick={chosenProduct ? handleAddNewClick : undefined}
              disabled={!chosenProduct}
              title={!chosenProduct ? 'Please select a product to create tasks' : 'Add new task'}
            >
              Add New
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

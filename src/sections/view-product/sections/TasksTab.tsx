import { useProductTasksQuery, useCreateTaskMutation, useUpdateTaskMutation } from '@/entities/product/model/query';
import { useQueryClient } from '@tanstack/react-query';
import { useProductStore } from '@/entities/product/store';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';
import { forwardRef, useState, useRef, useEffect } from 'react';
import TabHeader from '../ui/TabHeader';
import { fastApiService } from '@/lib/api/services/fastApiService';
import { showToast } from '@/lib/utils/toast';

interface TasksTabProps {
  lastUpdated: string;
  wrapperDataId: string;
}



const TasksTab = forwardRef<HTMLDivElement, TasksTabProps>(
  ({ lastUpdated, wrapperDataId }, ref) => {
    const { chosenProduct } = useProductStore();
    const [tabStatus, setTabStatus] = useState<'idle' | 'adding'>('idle');
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const editInputRef = useRef<HTMLInputElement>(null);

    // Use product tasks API
    const { selectedVehicleId } = useSelectedVehicleStore();
    const queryClient = useQueryClient();
    const { data: tasksData, isLoading: loading } = useProductTasksQuery(chosenProduct?.id || 0, !!chosenProduct?.id, selectedVehicleId || undefined);
    const createTaskMutation = useCreateTaskMutation();
    const updateTaskMutation = useUpdateTaskMutation();

    const apiTasks = tasksData?.tasks || [];

    const handleAddTask = async (taskText: string) => {
      if (!taskText.trim()) return;

      if (!chosenProduct) {
        alert('Please select a product to create tasks.');
        return;
      }

      if (!selectedVehicleId) {
        showToast.error('Please select a vehicle before creating tasks.');
        return;
      }

      try {
       
        await createTaskMutation.mutateAsync({
          productId: chosenProduct.id,
          data: {
            text: taskText.trim(),
            vehicleId: selectedVehicleId
          }
        });
        
     
        queryClient.invalidateQueries({ queryKey: ['productTasks', chosenProduct.id] });
      } catch (error) {
        console.error('Failed to create task:', error);
      }
    };

    const handleSelectTask = (taskId: number) => {
      setSelectedTaskId(selectedTaskId === taskId ? null : taskId);
    };

    const handleToggleTask = async (taskId: number) => {
      const task = apiTasks.find(t => t.id === taskId);
      if (task && chosenProduct) {
        const newDoneStatus = !task.done;
        await updateTaskMutation.mutateAsync({
          productId: chosenProduct.id,
          taskId: taskId,
          data: { done: newDoneStatus }
        });

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
                  
                  console.log('[TasksTab] Calling evaluation API:', {
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
                    
                    console.log('[TasksTab] Evaluation result:', evaluationResult);
                  } catch (evalError: any) {
                    if (evalError.response?.status === 404 && evalError.response?.data?.detail?.includes('No PRD link found')) {
                      console.warn('[TasksTab] Vehicle not linked to PRD in database. Skipping evaluation.');
                      console.warn('[TasksTab] Vehicle ID:', selectedVehicleId, 'PRD ID from localStorage:', prdId);
                    } else {
                      throw evalError;
                    }
                  }
                } else {
                  console.warn('[TasksTab] No code snippets found in workspace');
                }
              } catch (error: any) {
                console.error('[TasksTab] Error in evaluation process:', error);
              }
            })();
          }
        }
      }
    };

    const handleEditSelectedTask = () => {
      if (selectedTaskId) {
        const task = apiTasks.find(t => t.id === selectedTaskId);
        if (task) {
          setEditingTaskId(selectedTaskId);
          setEditingText(task.text);
        }
      }
    };

    const handleSaveEdit = async () => {
      if (!editingText.trim() || !editingTaskId || !chosenProduct) return;

      const updatedText = editingText.trim();
      const currentTaskId = editingTaskId; 
      
      setIsSaving(true);
      try {
        await updateTaskMutation.mutateAsync({
          productId: chosenProduct.id,
          taskId: currentTaskId,
          data: { text: updatedText }
        });
        
  
        setEditingTaskId(null);
        setEditingText('');
        setSelectedTaskId(null);
      } catch (error) {
        console.error('Failed to update task:', error);
      } finally {
        setIsSaving(false);
      }
    };

    const handleCancelEdit = () => {
      setEditingTaskId(null);
      setEditingText('');
      setSelectedTaskId(null);
    };

   
    useEffect(() => {
      if (editingTaskId && editInputRef.current) {
        editInputRef.current.focus();
        editInputRef.current.select();
      }
    }, [editingTaskId]);

    return (
      <div
        data-tab-id={wrapperDataId}
        ref={ref}
        className="min-h-[calc(80vh-100px)]"
      >
        <TabHeader
          label="Tasks"
          lastUpdated={lastUpdated}
          onEdit={handleEditSelectedTask}
          showEdit={true}
          editDisabled={!selectedTaskId}
        />

        <div className="flex flex-col gap-4 mt-4">
          {!chosenProduct ? (
            <div className="text-center py-8 text-[#9D9D9D]">
              <p className="text-sm font-medium mb-1">No product selected</p>
              <p className="text-xs">Please select a product to view tasks</p>
            </div>
          ) : loading ? (
            <div className="text-center py-8 text-[#9D9D9D]">
              <p className="text-sm">Loading tasks...</p>
            </div>
          ) : apiTasks.length === 0 ? (
            <div className="text-center py-8 text-[#9D9D9D]">
              <p className="text-sm font-medium mb-1">No tasks yet</p>
              <p className="text-xs">Add your first task below</p>
            </div>
          ) : (
            apiTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 text-[14px] text-[#181818]">
               
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => handleToggleTask(task.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  title="Mark as complete"
                />
                
        
                <div 
                  className="flex items-center gap-2 cursor-pointer flex-1"
                  onClick={() => handleToggleTask(task.id)}
                >
                 
                  
                    {editingTaskId === task.id ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit();
                          } else if (e.key === 'Escape') {
                            handleCancelEdit();
                          }
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

              
                {editingTaskId === task.id && (
                  <div className="flex gap-1">
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="text-green-600 hover:text-green-800 text-xs px-2 py-1 rounded disabled:opacity-50"
                    >
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="text-red-600 hover:text-red-800 text-xs px-2 py-1 rounded disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))
          )}

          {tabStatus === 'adding' && (
            <input
              ref={inputRef}
              type="text"
              className="w-full max-w-[300px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-[14px]"
              placeholder="Write down and hit enter to add"
              onKeyDown={async (e) => {
                if (e.key === 'Enter') {
                  const inputValue = e.currentTarget?.value || '';
                  await handleAddTask(inputValue);
                  setTabStatus('idle');
                  if (inputRef.current) {
                    inputRef.current.value = '';
                  }
                } else if (e.key === 'Escape') {
                  setTabStatus('idle');
                  if (inputRef.current) {
                    inputRef.current.value = '';
                  }
                }
              }}
            />
          )}

          {tabStatus !== 'adding' && (
            <button
              onClick={() => chosenProduct ? setTabStatus('adding') : alert('Please select a product to create tasks.')}
              className={`flex items-center gap-2 px-4 py-2 mt-4 rounded-md transition-colors font-poppins font-[600] text-[14px] ${
                chosenProduct
                  ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!chosenProduct}
              title={!chosenProduct ? 'Please select a product to create tasks' : 'Add new task'}
            >
              <span className="text-lg">+</span>
              <span>Add New</span>
            </button>
          )}
        </div>
      </div>
    );
  }
);

TasksTab.displayName = 'TasksTab';

export default TasksTab;

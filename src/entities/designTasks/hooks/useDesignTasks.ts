import { useEffect, useState } from 'react';
import { CreateDesignTaskRequest, DesignTask, designTasksService, UpdateDesignTaskRequest } from '../api/designTasksService';
import { useQueryClient } from '@tanstack/react-query';
import { vehicleKeys } from '@/lib/api/hooks/useVehicle';

interface UseDesignTasksReturn {
  tasks: DesignTask[];
  loading: boolean;
  error: string | null;
  workspace: {
    id: number;
    name: string;
    productId: number;
    updatedAt: string;
    product: {
      id: number;
      name: string;
    };
  } | null;
  createTask: (data: CreateDesignTaskRequest) => Promise<DesignTask | null>;
  updateTask: (taskId: number, data: UpdateDesignTaskRequest) => Promise<DesignTask | null>;
  deleteTask: (taskId: number) => Promise<boolean>;
  refreshTasks: () => Promise<void>;
}

export const useDesignTasks = (
  workspaceId: number | null,
  productId?: number,
  refreshTrigger: number = 0,
  vehicleId?: number
): UseDesignTasksReturn => {
  const [tasks, setTasks] = useState<DesignTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<{
    id: number;
    name: string;
    productId: number;
    product: {
      id: number;
      name: string;
    };
  } | null>(null);

  const fetchTasks = async () => {
    // Require either workspaceId or productId
    if (!workspaceId && !productId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await designTasksService.getDesignTasks(workspaceId, productId, vehicleId);
      if (response.success) {
        setTasks(response.tasks);
        setWorkspace(response.workspace);
      } else {
        setError(response.error || 'Failed to fetch tasks');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const queryClient = useQueryClient();
  
  const createTask = async (data: CreateDesignTaskRequest): Promise<DesignTask | null> => {
    // Require either workspaceId or productId
    if (!workspaceId && !productId) return null;
    
    try {
      // Automatically add vehicleId if not already present
      const taskData = {
        ...data,
        vehicleId: data.vehicleId !== undefined ? data.vehicleId : (vehicleId || undefined)
      };
      const response = await designTasksService.createDesignTask(workspaceId, taskData);
      if (response.success) {
        setTasks(prev => [...prev, response.task]);
        // Invalidate vehicles to refresh task completion percentages
        if (productId) {
          queryClient.invalidateQueries({ 
            queryKey: [...vehicleKeys.all, 'byProduct', productId] 
          });
        }
        return response.task;
      } else {
        setError(response.error || 'Failed to create task');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to create task');
      return null;
    }
  };

  const updateTask = async (taskId: number, data: UpdateDesignTaskRequest): Promise<DesignTask | null> => {
    try {
      // Automatically add vehicleId if not already present
      const updateData = {
        ...data,
        vehicleId: data.vehicleId !== undefined ? data.vehicleId : (vehicleId || undefined)
      };
      
      if (!updateData.vehicleId) {
        setError('vehicleId is required to update task');
        return null;
      }
      
      const response = await designTasksService.updateDesignTask(taskId, updateData);
      if (response.success) {
        setTasks(prev => prev.map(task => 
          task.id === taskId ? response.task : task
        ));
        // Invalidate vehicles to refresh task completion percentages
        if (productId) {
          queryClient.invalidateQueries({ 
            queryKey: [...vehicleKeys.all, 'byProduct', productId] 
          });
        }
        return response.task;
      } else {
        setError(response.error || 'Failed to update task');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update task');
      return null;
    }
  };

  const deleteTask = async (taskId: number): Promise<boolean> => {
    try {
      const response = await designTasksService.deleteDesignTask(taskId);
      if (response.success) {
        setTasks(prev => prev.filter(task => task.id !== taskId));
        return true;
      } else {
        setError(response.error || 'Failed to delete task');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to delete task');
      return false;
    }
  };

  const refreshTasks = async () => {
    await fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, [workspaceId, productId, vehicleId, refreshTrigger]);

  return {
    tasks,
    loading,
    error,
    workspace,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks,
  };
};

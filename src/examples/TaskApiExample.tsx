import { useDesignTasks } from '@/entities/designTasks';
import { useProductStore } from '@/entities/product/store';
import React, { useState } from 'react';

/**
 * Example component demonstrating how to use the updated task API with product ID association
 */
export const TaskApiExample: React.FC = () => {
  const { chosenProduct } = useProductStore();
  const [workspaceId, setWorkspaceId] = useState<number | null>(null);
  const [newTaskText, setNewTaskText] = useState('');

  // Use the hook with product ID for validation
  const {
    tasks,
    loading,
    error,
    workspace,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks
  } = useDesignTasks(workspaceId, chosenProduct?.id);

  const handleCreateTask = async () => {
    if (!newTaskText.trim() || !workspaceId) return;

    try {
      const result = await createTask({
        text: newTaskText.trim(),
        productId: chosenProduct?.id // This validates that the task is for the correct product
      });

      if (result) {
        setNewTaskText('');
        console.log('Task created successfully:', result);
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleToggleTask = async (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(taskId, { done: !task.done });
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    const confirmed = window.confirm('Are you sure you want to delete this task?');
    if (confirmed) {
      await deleteTask(taskId);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Task API Example with Product Association</h1>

      {/* Workspace ID Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Workspace ID:
        </label>
        <input
          type="number"
          value={workspaceId || ''}
          onChange={(e) => setWorkspaceId(e.target.value ? parseInt(e.target.value) : null)}
          className="border rounded px-3 py-2 w-48"
          placeholder="Enter workspace ID"
        />
      </div>

      {/* Product Information */}
      {chosenProduct && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-800">Selected Product:</h3>
          <p className="text-blue-600">ID: {chosenProduct.id} - {chosenProduct.name}</p>
        </div>
      )}

      {/* Workspace Information */}
      {workspace && (
        <div className="mb-6 p-4 bg-green-50 rounded-lg">
          <h3 className="font-semibold text-green-800">Workspace Information:</h3>
          <p className="text-green-600">Name: {workspace.name}</p>
          <p className="text-green-600">Product: {workspace.product.name} (ID: {workspace.productId})</p>
        </div>
      )}

      {/* Create Task Form */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">Create New Task</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            className="flex-1 border rounded px-3 py-2"
            placeholder="Enter task description..."
          />
          <button
            onClick={handleCreateTask}
            disabled={!newTaskText.trim() || !workspaceId || loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Task'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}

      {/* Tasks List */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Tasks ({tasks.length})</h3>
          <button
            onClick={refreshTasks}
            disabled={loading}
            className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        {tasks.length === 0 ? (
          <p className="text-gray-500">No tasks found. Create a workspace and add some tasks!</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={task.done}
                  onChange={() => handleToggleTask(task.id)}
                  className="w-4 h-4"
                />
                <span className={`flex-1 ${task.done ? 'line-through text-gray-500' : ''}`}>
                  {task.text}
                </span>
                <span className="text-sm text-gray-500">
                  by {task.creator.name}
                </span>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Usage Instructions */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">How to Use:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
          <li>Select a product from the product store</li>
          <li>Enter a workspace ID that belongs to that product</li>
          <li>Create tasks - they will be automatically associated with the selected product</li>
          <li>The API validates that tasks are created in the correct product's workspace</li>
          <li>Tasks include full workspace and product information in the response</li>
        </ol>
      </div>
    </div>
  );
};

export default TaskApiExample;

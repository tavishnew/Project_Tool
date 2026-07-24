import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Checkbox from "@/components/ui/checkbox";
import { PriorityBadge } from '@/components/orbit/PriorityBadge';
import { StatusPill } from '@/components/orbit/StatusPill';
import type { Task, TaskStatus, TaskPriority } from '@/types';

interface TaskDialogProps {
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export default function TaskDialog({ 
  task, 
  onClose, 
  onSave, 
  onDelete 
}: TaskDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { notify } = useToast();
  
  const handleSave = async () => {
    // Create a basic task object
    const taskData: Task = {
      id: task?.id ?? Math.random().toString(36).substr(2, 9),
      project_id: task?.project_id ?? '',
      title: task?.title ?? '',
      description: task?.description ?? '',
      assignee_id: task?.assignee_id ?? null,
      status: task?.status ?? 'todo',
      priority: task?.priority ?? 'medium',
      due_date: task?.due_date ?? null,
      created_at: task?.created_at ?? new Date().toISOString(),
    };
    
    await onSave(taskData);
    onClose();
    notify('Task saved');
  };

  const handleDelete = async () => {
    if (!task) return;
    setIsDeleting(true);
    try {
      await onDelete(task.id);
      onClose();
      notify('Task deleted');
    } catch (err) {
      notify('Failed to delete task', 'error');
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex pointer-events-none">
      <div className="relative flex w-full max-w-2xl h-full max-h-screen mx-auto pointer-events-auto">
        <div className="relative flex flex-col h-full bg-white dark:bg-darkmd rounded-lg border border-border/50 shadow-xl">
          <div className="flex flex-col h-full p-6">
            <h2 className="text-xl font-bold mb-4">{task ? 'Edit Task' : 'Add Task'}</h2>
            <form className="space-y-4">
              <div>
                <label className="block mb-1 font-medium">Title</label>
                <input 
                  type="text" 
                  value={task?.title ?? ''}
                  onChange={(e) => { /* handle change */ }}
                  className="w-full px-3 py-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea 
                  value={task?.description ?? ''}
                  onChange={(e) => { /* handle change */ }}
                  className="w-full px-3 py-2 border rounded"
                  rows={4}
                />
              </div>
              {/* Simplified form fields */}
            </form>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={false}
              >
                {task ? 'Save Changes' : 'Add Task'}
              </button>
              {task && (
                <button 
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Task'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





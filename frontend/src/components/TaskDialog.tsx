import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
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
  const isEditMode = !!task;
  const [isDeleting, setIsDeleting] = useState(false);
  const { notify } = useToast();
  
  const form = useForm<{
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string | null;
  }>({
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      status: task?.status ?? 'todo',
      priority: task?.priority ?? 'medium',
      dueDate: task?.dueDate ?? null,
    }
  });

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      await onSave(values);
      onClose();
      notify('Task saved successfully');
    } catch (err) {
      notify('Failed to save task', 'error');
    }
  });

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
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between p-4 border-b border-border/50">
              <h2 className="text-lg font-semibold text-foreground/90">
                {isEditMode ? 'Edit task' : 'New task'}
              </h2>
              <button
                className="btn-ghost btn-icon"
                aria-label="Close"
                onClick={onClose}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Form */}
            <form
              className="flex-1 p-6 space-y-6 overflow-y-auto"
              onSubmit={handleSubmit}
            >
              <div className="space-y-4">
                <div>
                  <Label htmlFor="td-title">Title</Label>
                  <Input
                    id="td-title"
                    placeholder="Enter task title"
                    {...form.register('title', {
                      required: 'Title is required',
                      minLength: {
                        value: 3,
                        message: 'Title must be at least 3 characters',
                      },
                    })}
                  />
                  {form.formState.errors.title && (
                    <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="td-description">Description</Label>
                  <Textarea
                    id="td-description"
                    placeholder="Enter task description"
                    {...form.register('description')}
                    rows={5}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="td-status">Status</Label>
                    <Select
                      id="td-status"
                      {...form.register('status')}
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    {form.formState.errors.status && (
                      <p className="text-xs text-destructive">{form.formState.errors.status.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="td-priority">Priority</Label>
                    <Select
                      id="td-priority"
                      {...form.register('priority')}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    {form.formState.errors.priority && (
                      <p className="text-xs text-destructive">{form.formState.errors.priority.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="td-dueDate">Due date</Label>
                  <Input
                    id="td-dueDate"
                    type="date"
                    {...form.register('dueDate')}
                  />
                  {form.formState.errors.dueDate && (
                    <p className="text-xs text-destructive">{form.formState.errors.dueDate.message}</p>
                  )}
                </div>

                {(!isEditMode || task?.assigneeId) && (
                  <div className="flex items-center gap-3">
                    <Checkbox
                      {...form.register('notifyAssignee', { value: true })}
                      className="h-4 w-4 text-primary"
                    >
                      Notify assignee
                    </Checkbox>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:gap-3 pt-4">
                {!isEditMode && (
                  <button
                    className="btn-ghost"
                    disabled={form.isPending}
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                )}
                <button
                  className="btn btn-primary w-full sm:w-auto"
                  disabled={form.isPending}
                  type="submit"
                >
                  {isEditMode ? 'Save changes' : 'Add task'}
                </button>
                {isEditMode && !form.isPending && (
                  <div className="mt-3 flex justify-end">
                    <button
                      className="btn btn-ghost btn-error"
                      disabled={isDeleting}
                      onClick={handleDelete}
                    >
                      {isDeleting ? 'Deleting...' : 'Delete task'}
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

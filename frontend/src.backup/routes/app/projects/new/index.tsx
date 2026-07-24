import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { NewProjectDialog } from '@/components/orbit/new-project-dialog';
import { useAuth } from '@/auth';
import { api } from '@/api';
import { useQueryClient } from '@tanstack/react-query';

export const Route = createFileRoute('/app/projects/new/')({
  component: NewProjectPage,
});

function NewProjectPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Dialog state
  const [open, setOpen] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.createProject({ name, description });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate('/app/projects', { replace: true });
    } catch (err) {
      console.error('Failed to create project:', err);
      // In a real app, we'd show an error message
    } finally {
      setLoading(false);
    }
  };

  const handleDialogClose = (created: boolean) => {
    setOpen(false);
    if (created) {
      navigate('/app/projects', { replace: true });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <NewProjectDialog 
          open={open} 
          onOpenChange={setOpen}
          onCreateProject={handleSubmit}
        />
      </div>
    </div>
  );
}
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { NewProjectDialog } from '@/components/orbit/new-project-dialog';
import { useAuth } from '@/auth';
import { api } from '@/api';
import { useQueryClient } from '@tanstack/react-query';

export const Route = createFileRoute('/app/projects/new')({
  component: NewProjectPage,
});

function NewProjectPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Dialog state
  const [open, setOpen] = useState(true);

  const handleCreateProject = async (name: string, description: string, color?: string) => {
    try {
      await api.createProject(name, description, color);
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate({ to: '/app/projects', replace: true });
    } catch (err) {
      console.error('Failed to create project:', err);
    }
  };

  const handleCancel = () => {
    navigate({ to: '/app/projects', replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <NewProjectDialog 
          open={open} 
          onOpenChange={setOpen}
          onCreateProject={handleCreateProject}
        />
      </div>
    </div>
  );
}
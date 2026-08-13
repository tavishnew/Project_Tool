import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { api } from '@/api';
import { CheckCircle2 } from 'lucide-react';

export const Route = createFileRoute('/app/members/invite')({
  component: InviteMemberPage,
});

function InviteMemberPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.createWorkspaceInvite(email.trim());
      setSuccess(true);
      setTimeout(() => {
        navigate({ to: '/app/members', replace: true });
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 mx-auto mb-4">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold">Invitation Sent!</h2>
          <p className="text-muted-foreground">
            An invitation has been sent to {email}. They'll receive an email with instructions to join your workspace.
          </p>
        <Button onClick={() => navigate({ to: '/app/members', replace: true })} className="w-full">
            Back to Members
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4.5rem)] flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Invite Team Member</h2>
          <p className="text-muted-foreground">
            Send a secure workspace invitation. The recipient will create their account from the emailed link.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="teammate@company.com"
              />
            </div>
            
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading || !email}
            >
              {loading ? 'Sending invitation...' : 'Send Invitation'}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              <Button type="button" variant="ghost" className="p-0 h-auto" onClick={() => navigate({ to: '/app/members', replace: true })}>
                Cancel
              </Button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
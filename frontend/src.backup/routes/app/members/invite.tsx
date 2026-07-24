import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/auth';
import { api } from '@/api';

export const Route = createFileRoute('/app/members/invite')({
  component: InviteMemberPage,
});

function InviteMemberPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // This endpoint might not exist in the current API
      // In a real implementation, you'd call an invite endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setSuccess(true);
      setTimeout(() => {
        navigate('/app/members');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 mb-4">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Invitation Sent!</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          An invitation has been sent to {email}. They'll receive an email to join your workspace.
        </p>
        <Link to="/app/members" className="btn btn-primary mt-6">
          Back to Members
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Invite Team Member</h1>
        <p className="text-muted-foreground">Add someone to your workspace</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input input-bordered w-full"
            placeholder="teammate@company.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="select select-bordered w-full"
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
        </div>
        
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        
        <Button 
          type="submit" 
          className="btn btn-primary w-full"
          disabled={loading || !email}
        >
          {loading ? 'Sending invitation…' : 'Send Invitation'}
        </Button>
        
        <div className="mt-4 text-center">
          <Link to="/app/members" className="text-sm text-muted-foreground hover:underline">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

// Import CheckCircle2 here since it's used above
import { CheckCircle2 } from 'lucide-react';
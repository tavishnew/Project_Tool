import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { OrbitMark } from '@/components/orbit/orbit-mark';
import { AuroraBlob } from '@/components/orbit/aurora-blob';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/auth';
import { api } from '@/api';

export const Route = createFileRoute('/invite/$token/')({
  beforeLoad: ({ params }) => {
    // You could add validation here if needed
    return {};
  },
  component: InvitePage,
});

function InvitePage({ params }: { params: { token: string } }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  async function onAccept(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.acceptInvite(params.token);
      setSuccess(true);
      // Optionally redirect after a short delay
      setTimeout(() => {
        navigate({ to: '/projects' });
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="relative min-h-svh overflow-hidden bg-background">
        <div className="flex min-h-svh items-center justify-center px-6 py-12">
          <div className="text-center space-y-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 mb-4">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Welcome aboard!</h1>
            <p className="text-lg text-muted-foreground">
              You've successfully joined the workspace. Redirecting to your dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-svh overflow-hidden bg-background">
      <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12">
        <Link to="/" className="flex items-center gap-2">
          <OrbitMark />
          <span className="font-display text-lg font-bold tracking-tight">Orbit</span>
        </Link>
        <div className="mt-8">
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            Accept invitation
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Please enter your name to join the workspace
          </p>
          <form onSubmit={onAccept} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full rounded-full"
              size="lg"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Accepting…' : 'Join Workspace'}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Orbit</p>
        </div>
      </div>
    </div>
  );
}

// Import CheckCircle2 here since it's used above
import { CheckCircle2 } from 'lucide-react';
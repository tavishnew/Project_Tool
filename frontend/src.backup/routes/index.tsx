import { createFileRoute, Link } from '@tanstack/react-router';
import { useAuth } from '@/auth';

export const Route = createFileRoute('/')({
  component: Landing,
});

function Landing() {
  const { user } = useAuth();

  if (user) {
    // In a real implementation, we'd use a proper redirect mechanism
    // This is simplified for demonstration
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Welcome to Orbit</h1>
        <p className="text-muted-foreground">Your calm project workspace</p>
        <div className="space-x-4">
          <a href="/login" className="btn btn-outline">Sign in</a>
          <a href="/register" className="btn btn-primary">Get started</a>
        </div>
      </div>
    </div>
  );
}
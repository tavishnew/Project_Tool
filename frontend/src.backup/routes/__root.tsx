import { createRootRoute } from '@tanstack/react-router';
import { Outlet } from '@tanstack/react-router';
import { useAuth } from '@/auth';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  const { user } = useAuth();
  
  // In a real implementation, we might want to handle redirects here
  // But for now, we'll let individual route components handle auth checks
  
  return (
    <div>
      <Outlet />
    </div>
  );
}
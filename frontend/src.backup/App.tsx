import './index.css';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rootRoute } from './routes/__root';
import { createRootRoute } from './routes/__root';
import { AuthProvider } from './auth';

// Create a query client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={rootRoute} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
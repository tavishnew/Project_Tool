import './index.css';
import { RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';
import { Route as rootRoute } from './routes/__root';
import { AuthProvider } from './auth';

// Create a query client
const queryClient = new QueryClient();

// Create the router
const router = createRouter({ routeTree: rootRoute });

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
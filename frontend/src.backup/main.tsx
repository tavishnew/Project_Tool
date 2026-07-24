import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from '@tanstack/react-router';
import { routeTree } from "./routeTree.gen";
import { getRouter } from "./router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./auth";
import { ToastProvider } from "./components/Toast";
import "./styles.css";

const queryClient = new QueryClient();
const router = getRouter();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
import { Routes, Route, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "./auth";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProjectsPage from "./pages/ProjectsPage";
import BoardPage from "./pages/BoardPage";
import ListPage from "./pages/ListPage";
import SettingsPage from "./pages/SettingsPage";
import InvitePage from "./pages/InvitePage";
import NotFoundPage from "./pages/NotFoundPage";
import LandingPage from "./pages/LandingPage";

function Protected({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="route-loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/projects" replace /> : <LandingPage />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/projects" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/projects" replace /> : <RegisterPage />}
      />
      <Route element={<Layout />}>
        <Route path="/projects" element={<Protected><ProjectsPage /></Protected>} />
        <Route path="/projects/:id" element={<Protected><BoardPage /></Protected>} />
        <Route path="/projects/:id/list" element={<Protected><ListPage /></Protected>} />
        <Route path="/projects/:id/settings" element={<Protected><SettingsPage /></Protected>} />
      </Route>
      <Route path="/invite/:token" element={<InvitePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

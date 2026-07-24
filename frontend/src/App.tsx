import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/auth";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProjectsPage from "./pages/ProjectsPage";
import BoardPage from "./pages/BoardPage";
import ListPage from "./pages/ListPage";
import SettingsPage from "./pages/SettingsPage";
import InvitePage from "./pages/InvitePage";
import MembersPage from "./pages/MembersPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/projects" replace /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/projects" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/projects" replace /> : <RegisterPage />} />
      <Route path="/invite/:token" element={<InvitePage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<BoardPage />} />
        <Route path="/projects/:id/list" element={<ListPage />} />
        <Route path="/projects/:id/settings" element={<SettingsPage />} />
        <Route path="/members" element={<MembersPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";
import { useToast } from "./Toast";

export default function Layout() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();

  const logout = async () => {
  await api.logout().catch(() => {});
  refresh();
  notify("Signed out");
  navigate("/");
};

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/projects" className="brand">
          <svg className="brand-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="orbitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E3A5F"/>
                <stop offset="50%" stopColor="#3DDC97"/>
                <stop offset="100%" stopColor="#1E3A5F"/>
              </linearGradient>
            </defs>
            <circle cx="16" cy="16" r="13" stroke="url(#orbitGradient)" strokeWidth="2.5" strokeDasharray="3 6"/>
            <circle cx="16" cy="16" r="9" stroke="#3DDC97" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.6"/>
            <circle cx="16" cy="16" r="4.5" fill="url(#orbitGradient)"/>
            <circle cx="14.5" cy="14.5" r="1.5" fill="#ffffff" opacity="0.3"/>
          </svg>
          Orbit
        </Link>
        <nav className="topnav">
          <NavLink to="/projects" className={({ isActive }) => (isActive ? "active" : "")}>
            Projects
          </NavLink>
        </nav>
        <div className="user-menu">
          <span className="user-name">{user?.name}</span>
          <button className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}

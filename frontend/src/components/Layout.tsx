import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { api } from '../api';
import { useToast } from './Toast';

export default function Layout() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();

  const logout = async () => {
    await api.logout().catch(() => {});
    refresh();
    notify('Signed out');
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/projects" className="brand">
          <span className="brand-mark" />
          Cadence
        </Link>
        <nav className="topnav">
          <NavLink to="/projects" className={({ isActive }) => (isActive ? 'active' : '')}>
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

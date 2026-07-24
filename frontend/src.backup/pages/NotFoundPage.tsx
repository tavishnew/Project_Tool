import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="auth-wrap">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <h1>404</h1>
        <p className="auth-sub">This page doesn't exist.</p>
        <Link to="/projects" className="btn btn-primary">
          Back to projects
        </Link>
      </div>
    </div>
  );
}

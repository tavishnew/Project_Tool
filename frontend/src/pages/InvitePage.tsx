import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../auth';
import { api } from '../api';
import { useToast } from '../components/Toast';

type State = 'checking' | 'need-auth' | 'done' | 'error';

export default function InvitePage() {
  const { token } = useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [state, setState] = useState<State>('checking');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setState('need-auth');
      return;
    }
    api
      .acceptInvite(token!)
      .then((r) => {
        setState('done');
        notify('You joined the project');
        navigate(`/projects/${r.projectId}`);
      })
      .catch((e) => {
        setState('error');
        setMsg(e instanceof Error ? e.message : 'Invite unavailable');
      });
  }, [loading, user, token]);

  if (state === 'checking') {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <p className="auth-sub">Joining project…</p>
        </div>
      </div>
    );
  }
  if (state === 'need-auth') {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <h1>Join project</h1>
          <p className="auth-sub">Sign in or create an account to join.</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link className="btn btn-primary" to={`/login?invite=${token}`}>
              Log in
            </Link>
            <Link className="btn btn-ghost" to={`/register?invite=${token}`}>
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }
  if (state === 'error') {
    return (
      <div className="auth-wrap">
        <div className="auth-card">
          <h1>Invite unavailable</h1>
          <p className="auth-sub">{msg}</p>
          <Link className="btn btn-primary" to="/projects">
            Back to projects
          </Link>
        </div>
      </div>
    );
  }
  return null;
}

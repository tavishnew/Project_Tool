import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { useToast } from "../components/Toast";

export default function LoginPage() {
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const { notify } = useToast();
  const [searchParams] = useSearchParams();
  const invite = searchParams.get("invite");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { user } = await api.login(email, password);
      setUser(user);
      notify(`Welcome back, ${user.name}`);
      if (invite) {
        try {
          const r = await api.acceptInvite(invite);
          navigate(`/projects/${r.projectId}`);
          return;
        } catch {
          /* invite already used/expired — go to projects */
        }
      }
      navigate("/projects");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
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
          <span>Orbit</span>
        </div>
        <h1>Sign in</h1>
        <p className="auth-sub">Modern project management for high-performing teams.</p>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="form-error">{error}</div>}
          <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={busy}>
            Sign in
          </button>
        </form>
        <p className="auth-switch">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}

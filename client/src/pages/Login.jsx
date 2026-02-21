import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const API = '/api';

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data.user) navigate('/dashboard', { replace: true });
      })
      .catch(() => {});
  }, [navigate]);

  function handleGoogleLogin() {
    const base = import.meta.env.VITE_API_URL || '';
    window.location.href = `${base}/api/auth/google`;
  }

  return (
    <div className="page login-page">
      <div className="login-card">
        <h1>Dashboard access</h1>
        <p>Sign in with Google to manage events and imports.</p>
        <button type="button" className="btn btn-google" onClick={handleGoogleLogin}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

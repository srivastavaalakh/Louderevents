import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

// Render backend base URL
const API = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!API) return;

    fetch(`${API}/api/auth/me`, {
      credentials: 'include',
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.user) {
          navigate('/dashboard', { replace: true });
        }
      })
      .catch(() => {});
  }, [navigate]);

  function handleGoogleLogin() {
    if (!API) {
      console.error('VITE_API_URL not defined');
      return;
    }

    // Google OAuth MUST be a redirect
    window.location.href = `${API}/api/auth/google`;
  }

  return (
    <div className="page login-page">
      <div className="login-card">
        <h1>Dashboard access</h1>
        <p>Sign in with Google to manage events and imports.</p>
        <button
          type="button"
          className="btn btn-google"
          onClick={handleGoogleLogin}
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

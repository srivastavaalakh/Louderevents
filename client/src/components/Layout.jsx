import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import './Layout.css';

export default function Layout() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setUser(data.user || null))
      .catch(() => setUser(null));
  }, []);

  function handleLogout() {
    fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      .then(() => { setUser(null); navigate('/'); });
  }

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" className="logo">Louder</Link>
        <nav>
          <Link to="/">Events</Link>
          <Link to="/dashboard">Dashboard</Link>
          {user ? (
            <button type="button" className="btn-link" onClick={handleLogout}>Log out</button>
          ) : (
            <Link to="/login">Log in</Link>
          )}
        </nav>
      </header>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}

import { useState } from 'react';
import './GetTicketsModal.css';

const API = '/api';

export default function GetTicketsModal({ event, onClose }) {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!consent) {
      setError('Please agree to be contacted.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/email-signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          consent: true,
          eventId: event._id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      if (data.redirectUrl) window.location.href = data.redirectUrl;
      else onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        <h2>Get tickets — {event.title}</h2>
        <p className="muted">We’ll save your interest and send you to the official ticketing page.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            I agree to be contacted about this event and related updates.
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving…' : 'Continue to tickets'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

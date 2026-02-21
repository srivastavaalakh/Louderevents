import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import './Dashboard.css';

const API = '/api';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [city, setCity] = useState('Sydney');
  const [keyword, setKeyword] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [importNotes, setImportNotes] = useState('');
  const [importingId, setImportingId] = useState(null);

  useEffect(() => {
    fetch(`${API}/auth/me`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (!data.user) setUser(false);
        else setUser(data.user);
      })
      .catch(() => setUser(false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user === false) return;
    if (!user) return;
    const params = new URLSearchParams({ city });
    if (keyword) params.set('keyword', keyword);
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    fetch(`${API}/dashboard/events?${params}`, { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]));
  }, [user, city, keyword, dateFrom, dateTo]);

  async function handleImport(eventId) {
    setImportingId(eventId);
    try {
      const res = await fetch(`${API}/dashboard/events/${eventId}/import`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ importNotes }),
      });
      const updated = await res.json();
      if (res.ok) {
        setEvents((prev) => prev.map((e) => (e._id === eventId ? updated : e)));
        setSelected((s) => (s?._id === eventId ? updated : s));
        setImportNotes('');
      }
    } finally {
      setImportingId(null);
    }
  }

  if (loading) return <div className="page dashboard"><p className="muted">Loading…</p></div>;
  if (user === false) return <Navigate to="/login" replace />;

  return (
    <div className="page dashboard">
      <div className="dashboard-header">
        <h1>Event dashboard</h1>
        <p className="muted">Filter, review and import events. Logged in as {user?.displayName || user?.email}.</p>
      </div>

      <div className="dashboard-filters">
        <label>
          City
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="Sydney">Sydney</option>
            <option value="Melbourne">Melbourne</option>
            <option value="Brisbane">Brisbane</option>
          </select>
        </label>
        <label>
          Keyword
          <input
            type="text"
            placeholder="Title, venue, description…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </label>
        <label>
          From
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </label>
        <label>
          To
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </label>
      </div>

      <div className="dashboard-body">
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Date</th>
                <th>Venue</th>
                <th>Source</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr
                  key={ev._id}
                  className={selected?._id === ev._id ? 'selected' : ''}
                  onClick={() => setSelected(ev)}
                >
                  <td>{ev.title}</td>
                  <td>{ev.dateTime ? new Date(ev.dateTime).toLocaleString('en-AU', { dateStyle: 'short', timeStyle: 'short' }) : '—'}</td>
                  <td>{ev.venueName || '—'}</td>
                  <td>{ev.sourceWebsite || '—'}</td>
                  <td><span className={`status-tag status-${ev.status}`}>{ev.status}</span></td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {ev.status !== 'imported' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        disabled={importingId === ev._id}
                        onClick={() => handleImport(ev._id)}
                      >
                        {importingId === ev._id ? '…' : 'Import'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <aside className="dashboard-preview">
          {selected ? (
            <>
              <h3>{selected.title}</h3>
              <p className="preview-meta">
                {selected.dateTime ? new Date(selected.dateTime).toLocaleString('en-AU') : ''}
              </p>
              <p><strong>Venue:</strong> {selected.venueName || '—'} {selected.venueAddress && ` · ${selected.venueAddress}`}</p>
              <p><strong>City:</strong> {selected.city}</p>
              <p><strong>Source:</strong> {selected.sourceWebsite} · <a href={selected.originalUrl} target="_blank" rel="noreferrer">Open link</a></p>
              <p><strong>Status:</strong> <span className={`status-tag status-${selected.status}`}>{selected.status}</span></p>
              {selected.description && <p className="preview-desc">{selected.description}</p>}
              {selected.importedAt && (
                <p className="muted">Imported {new Date(selected.importedAt).toLocaleString('en-AU')}{selected.importNotes ? ` · ${selected.importNotes}` : ''}</p>
              )}
              {selected.status !== 'imported' && (
                <div className="preview-import">
                  <input
                    type="text"
                    placeholder="Import notes (optional)"
                    value={importNotes}
                    onChange={(e) => setImportNotes(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={importingId === selected._id}
                    onClick={() => handleImport(selected._id)}
                  >
                    Import to platform
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="muted">Click a row to preview.</p>
          )}
        </aside>
      </div>
    </div>
  );
}

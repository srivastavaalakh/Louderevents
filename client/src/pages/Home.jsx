import { useState, useEffect } from 'react';
import EventCard from '../components/EventCard';
import GetTicketsModal from '../components/GetTicketsModal';
import './Home.css';

const API = '/api';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalEvent, setModalEvent] = useState(null);

  useEffect(() => {
    fetch(`${API}/events?city=Sydney`)
      .then((r) => r.json())
      .then((data) => { setEvents(Array.isArray(data) ? data : []); })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page home">
      <section className="hero">
        <h1>Events in Sydney</h1>
        <p>Discover what’s on — from gigs and markets to tours and workshops.</p>
      </section>

      {loading ? (
        <p className="muted">Loading events…</p>
      ) : events.length === 0 ? (
        <p className="muted">No upcoming events right now. Check back later.</p>
      ) : (
        <div className="event-grid">
          {events.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onGetTickets={() => setModalEvent(event)}
            />
          ))}
        </div>
      )}

      {modalEvent && (
        <GetTicketsModal
          event={modalEvent}
          onClose={() => setModalEvent(null)}
        />
      )}
    </div>
  );
}

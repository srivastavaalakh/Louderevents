export default function EventCard({ event, onGetTickets }) {
  const date = event.dateTime ? new Date(event.dateTime) : null;
  const dateStr = date
    ? date.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : '';
  const timeStr = date ? date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' }) : '';

  return (
    <article className="event-card">
      <div className="event-card-image">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt="" />
        ) : (
          <div className="event-card-placeholder" />
        )}
      </div>
      <div className="event-card-body">
        <h2 className="event-card-title">{event.title}</h2>
        <p className="event-card-meta">
          {dateStr}{timeStr ? ` · ${timeStr}` : ''}
        </p>
        {(event.venueName || event.venueAddress) && (
          <p className="event-card-venue">
            {[event.venueName, event.venueAddress].filter(Boolean).join(' · ')}
          </p>
        )}
        {event.description && (
          <p className="event-card-desc">{event.description.slice(0, 120)}{event.description.length > 120 ? '…' : ''}</p>
        )}
        <p className="event-card-source">
          Source: {event.sourceWebsite || '—'}
        </p>
        <button type="button" className="btn btn-primary" onClick={onGetTickets}>
          GET TICKETS
        </button>
      </div>
    </article>
  );
}

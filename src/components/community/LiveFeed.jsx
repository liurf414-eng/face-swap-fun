function LiveFeedItem({ event, onRemix }) {
  const handleClick = () => {
    onRemix?.(event)
  }

  return (
    <button type="button" className="live-feed-item" onClick={handleClick}>
      <div className="live-feed-media">
        <video src={event.previewUrl} autoPlay loop muted playsInline />
      </div>
      <div className="live-feed-detail">
        <p className="live-feed-author">{event.author}</p>
        <p className="live-feed-text">
          used <strong>{event.templateName}</strong>
        </p>
        <span className="live-feed-time">{event.timeAgo || 'moments ago'}</span>
      </div>
      <span className="live-feed-action">Remix</span>
    </button>
  )
}

export default function LiveFeed({ events = [], onRemix }) {
  return (
    <aside className="live-feed-panel">
      <div className="live-feed-header">
        <div>
          <p className="label">Live Remix Feed</p>
          <h3>See what creators remix right now</h3>
        </div>
      </div>
      <div className="live-feed-list">
        {events.length === 0 ? (
          <p className="live-feed-empty">Be the first to remix today.</p>
        ) : (
          events.map(event => (
            <LiveFeedItem key={event.id} event={event} onRemix={onRemix} />
          ))
        )}
      </div>
    </aside>
  )
}

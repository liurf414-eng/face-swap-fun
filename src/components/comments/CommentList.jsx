export default function CommentList({ comments = [], onRemix }) {
  if (!comments.length) {
    return <p className="comments-empty">No comments yet — be the first remix.</p>
  }

  return (
    <div className="comment-list">
      {comments.map(comment => (
        <div key={comment.id} className={`comment-item ${comment.type === 'video' ? 'media' : ''}`}>
          <div className="comment-avatar">
            <img src={comment.author?.avatar} alt={comment.author?.name} />
          </div>
          <div className="comment-body">
            <div className="comment-meta">
              <strong>{comment.author?.name}</strong>
              <span className="handle">{comment.author?.handle}</span>
              <span className="time">{comment.createdAt}</span>
            </div>
            {comment.type === 'video' ? (
              <>
                <video src={comment.mediaUrl} autoPlay loop muted controls />
                {comment.prompt && <p className="prompt">Prompt: {comment.prompt}</p>}
                <button className="ghost-btn" type="button" onClick={() => onRemix?.(comment)}>
                  Remix this too
                </button>
              </>
            ) : (
              <p>{comment.text}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

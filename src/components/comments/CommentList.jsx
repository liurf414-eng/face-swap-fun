export default function CommentList({ comments = [], onRemix }) {
  if (!comments.length) {
    return <p className="comments-empty">还没有任何评论，快来抢首条二创！</p>
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
                  我也玩这个
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

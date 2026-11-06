import React from 'react';

export default function PostList(props) {
  return (
    <ul>
      {props.posts.map((post) => (
        <li key={post.id}>
          <h3>{post.title}</h3>
          {post.subreddit && <p>r/{post.subreddit}</p>}
          <p>Score: {post.score}</p>
          <a href={'https://www.reddit.com/comments/' + post.id + '/'} target="_blank" rel="noopener noreferrer">Comments</a>
          {props.onRemove ? (
            <button type="button" onClick={() => props.onRemove(post.id)}>Remove</button>
          ) : (
            <button type="button" disabled={props.disabled || props.favouriteIds.includes(post.id)} onClick={() => props.onAdd(post)}>
              {props.favouriteIds.includes(post.id) ? 'Added' : 'Add to favourites'}
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

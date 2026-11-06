import React from 'react';
import PostList from './components/PostList.jsx';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      subreddit: '',
      searchedSubreddit: '',
      posts: [],
      favouriteIds: [],
      favourites: [],
      loading: false,
      favouritesLoading: false,
      error: '',
      favouritesError: '',
    };
  }

  async componentDidMount() {
    // Read only the saved IDs, then get the post details from Reddit.
    let ids;
    try {
      ids = JSON.parse(localStorage.getItem('threadmark.favouriteIds') || '[]');
      if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string' && /^[a-z0-9]+$/i.test(id))) {
        throw new Error('Invalid saved IDs');
      }
    } catch {
      this.setState({ favouritesError: 'Could not read saved favourites. Check that browser storage is enabled.' });
      return;
    }

    this.setState({ favouriteIds: ids, favouritesLoading: ids.length > 0 });
    try {
      let favourites = [];
      // Reddit allows up to 100 post IDs in one request.
      for (let i = 0; i < ids.length; i += 100) {
        const names = ids.slice(i, i + 100).map((id) => 't3_' + id).join(',');
        const posts = await this.getPosts('https://www.reddit.com/api/info.json?id=' + names + '&raw_json=1');
        favourites = favourites.concat(posts);
      }
      this.setState({ favourites, favouritesLoading: false });
    } catch {
      this.setState({ favouritesLoading: false, favouritesError: 'Could not load saved posts from Reddit. Try reloading the page.' });
    }
  }

  async getPosts(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Reddit request failed');
    }
    const result = await response.json();
    return result.data.children.map((post) => post.data);
  }

  async loadPosts(event) {
    event.preventDefault();
    const subreddit = this.state.subreddit.trim().replace(/^\/?r\//i, '');
    if (!/^[a-z0-9_]{2,21}$/i.test(subreddit)) {
      this.setState({ error: 'Enter a subreddit name using letters, numbers, or underscores.' });
      return;
    }

    this.setState({ loading: true, error: '', posts: [], searchedSubreddit: subreddit });
    try {
      const posts = await this.getPosts('https://www.reddit.com/r/' + subreddit + '/hot.json?limit=10&raw_json=1');
      this.setState({ posts: posts.slice(0, 10), loading: false });
    } catch {
      this.setState({ loading: false, error: 'Could not load posts. Check the subreddit name and your connection. Reddit may be blocking access.' });
    }
  }

  addFavourite(post) {
    if (this.state.favouriteIds.includes(post.id)) return;
    const favouriteIds = this.state.favouriteIds.concat(post.id);
    try {
      // Do not save titles, scores, or other post data in localStorage.
      localStorage.setItem('threadmark.favouriteIds', JSON.stringify(favouriteIds));
      this.setState({ favouriteIds, favourites: this.state.favourites.concat(post) });
    } catch {
      this.setState({ favouritesError: 'Could not save the change. Check that browser storage is enabled.' });
    }
  }

  removeFavourite(id) {
    const favouriteIds = this.state.favouriteIds.filter((savedId) => savedId !== id);
    try {
      localStorage.setItem('threadmark.favouriteIds', JSON.stringify(favouriteIds));
      this.setState({ favouriteIds, favourites: this.state.favourites.filter((post) => post.id !== id) });
    } catch {
      this.setState({ favouritesError: 'Could not save the change. Check that browser storage is enabled.' });
    }
  }

  render() {
    const { subreddit, searchedSubreddit, posts, favouriteIds, favourites, loading, favouritesLoading, error, favouritesError } = this.state;
    // Keep saved IDs visible even if Reddit no longer returns a post.
    const savedPosts = favouriteIds.map((id) => favourites.find((post) => post.id === id) || { id, title: 'Post unavailable', score: 'Unavailable' });

    return (
      <main>
        <h1>Reddit Favourite Posts</h1>

        <form onSubmit={(event) => this.loadPosts(event)}>
          <label htmlFor="subreddit">Subreddit: </label>
          <input id="subreddit" value={subreddit} required onChange={(event) => this.setState({ subreddit: event.target.value })} />
          <button type="submit" disabled={loading}>Load posts</button>
        </form>

        <section>
          <h2>Hot posts{searchedSubreddit && ' from r/' + searchedSubreddit}</h2>
          {loading && <p role="status">Loading posts...</p>}
          {error && <p className="error" role="alert">{error}</p>}
          {!loading && !error && posts.length === 0 && <p>{searchedSubreddit ? 'No posts found.' : 'Enter a subreddit to load posts.'}</p>}
          <PostList posts={posts} favouriteIds={favouriteIds} disabled={favouritesLoading} onAdd={(post) => this.addFavourite(post)} />
        </section>

        <section>
          <h2>Favourite posts</h2>
          {favouritesLoading && <p role="status">Loading favourites...</p>}
          {favouritesError && <p className="error" role="alert">{favouritesError}</p>}
          {favouriteIds.length === 0 && <p>No favourite posts yet.</p>}
          {!favouritesLoading && <PostList posts={savedPosts} onRemove={(id) => this.removeFavourite(id)} />}
        </section>
      </main>
    );
  }
}

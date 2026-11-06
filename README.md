# Reddit Favourite Posts

React assignment using class state, props, fetch, and localStorage.

## Run

Install Node.js 22.12 or newer. In this folder, run:

```sh
npm ci
npm start
```

Open the local URL printed in the terminal.

## Use

1. Enter a subreddit name and click **Load posts** to see its first 10 hot posts.
2. Click **Add to favourites** to save a post.
3. Saved posts appear in **Favourite posts** below the results, including posts from other subreddits.
4. Click **Remove** to remove a favourite.
5. Reload the page to check that favourites remain.

Both lists display titles, scores, and links to comments. The subreddit input starts empty.

## Code

- src/App.jsx: React class with state, API requests, and favourite actions.
- src/components/PostList.jsx: displays either list using props.
- src/styles.css: basic CSS.
- src/main.jsx: renders the app.

Only post IDs are stored in localStorage, under threadmark.favouriteIds. Titles, scores, and other details come from the Reddit API. Node and Vite are build tools; the deployed app has no backend or Reddit API wrapper.

To build static frontend files:

```sh
npm run build
```

The output is in dist/. See SUBMISSION.md for the public URL and demo checklist.

Reddit blocks API requests on some networks. If posts do not load, check Reddit access in your browser before recording the demo. Error messages do not use sample posts.

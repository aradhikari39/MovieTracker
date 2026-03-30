import { useEffect, useState } from 'react';
import useUser from '../useUser.js';
import { createWatchlist, getWatchlists } from '../watchlistApi.js';


export default function MyWatchlistsPage() {
  const { user, isLoading } = useUser();
  const [watchlists, setWatchlists] = useState([]);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    async function loadWatchlists() {
      if (!user) {
        setPageLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const data = await getWatchlists(token);
        setWatchlists(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setPageLoading(false);
      }
    }

    if (!isLoading) {
      loadWatchlists();
    }
  }, [user, isLoading]);

  async function handleCreateWatchlist() {
    if (!newWatchlistName.trim()) {
      setError('Please enter a watchlist name');
      return;
    }

    try {
      setError('');
      const token = await user.getIdToken();
      const created = await createWatchlist(token, newWatchlistName);

      setWatchlists((current) => [
        {
          ...created,
          totalMovies: 0,
          completedMovies: 0,
          progressPercent: 0,
          borderStatus: 'RED',
          movies: [],
        },
        ...current,
      ]);

      setNewWatchlistName('');
    } catch (e) {
      setError(e.message);
    }
  }

  if (isLoading || pageLoading) {
    return <div><h1>Loading watchlists...</h1></div>;
  }

  if (!user) {
    return (
      <div>
        <h1>My Watchlists</h1>
        <p>Please log in first.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>My Watchlists</h1>

      {error && <p>{error}</p>}

      <input
        placeholder="New watchlist name"
        value={newWatchlistName}
        onChange={(e) => setNewWatchlistName(e.target.value)}
      />
      <button onClick={handleCreateWatchlist}>Create Watchlist</button>

      {watchlists.length === 0 ? (
        <p>No watchlists yet.</p>
      ) : (
        watchlists.map((watchlist) => (
          <div
            key={watchlist.id}
            style={{
              border: `3px solid ${
                watchlist.borderStatus === 'GREEN'
                  ? 'green'
                  : watchlist.borderStatus === 'YELLOW'
                  ? 'yellow'
                  : 'red'
              }`,
              marginTop: '16px',
              padding: '16px',
            }}
          >
            <h2>{watchlist.name}</h2>
            <p>
              {watchlist.completedMovies}/{watchlist.totalMovies} movies completed
            </p>
            <p>{watchlist.progressPercent}% progress</p>
          </div>
        ))
      )}
    </div>
  );
}

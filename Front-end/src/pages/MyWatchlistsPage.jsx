import { useEffect, useState } from 'react';
import useUser from '../useUser.js';
import { createWatchlist, getWatchlists } from '../watchlistApi.js'

function getBorderColor(borderStatus) {
  if (borderStatus === 'GREEN') return '#22c55e';
  if (borderStatus === 'YELLOW') return '#eab308';
  return '#ef4444';
}

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
    return (
      <div style={{ padding: '24px' }}>
        <h1>Loading watchlists...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '24px' }}>
        <h1>My Watchlists</h1>
        <p>Please log in first.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>My Watchlists</h1>

      {error && <p>{error}</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          alignItems: 'stretch',
          marginTop: '24px',
        }}
      >
        {watchlists.map((watchlist) => (
          <div
            key={watchlist.id}
            style={{
              border: `4px solid ${getBorderColor(watchlist.borderStatus)}`,
              borderRadius: '16px',
              padding: '18px',
              minHeight: '360px',
              background: '#181818',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <h2 style={{ marginTop: 0 }}>{watchlist.name}</h2>

              {watchlist.movies.length === 0 ? (
                <p>No movies added yet.</p>
              ) : (
                <div>
                  {watchlist.movies.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '10px 0',
                        borderBottom: '1px solid #333',
                      }}
                    >
                      <strong>{item.movie.title}</strong>
                      <div style={{ fontSize: '14px', color: '#bbb' }}>
                        {item.movie.releaseYear ?? 'Unknown year'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <p style={{ margin: 0 }}>
                {watchlist.completedMovies}/{watchlist.totalMovies} movies completed
              </p>
              <p style={{ margin: 0 }}>{watchlist.progressPercent}% progress</p>
            </div>
          </div>
        ))}

        <div
          style={{
            border: '2px dashed #666',
            borderRadius: '16px',
            padding: '18px',
            minHeight: '360px',
            background: '#111',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <h2 style={{ textAlign: 'center' }}>+ Add More Watchlist</h2>

          <input
            placeholder="New watchlist name"
            value={newWatchlistName}
            onChange={(e) => setNewWatchlistName(e.target.value)}
            style={{
              padding: '12px',
              marginTop: '16px',
              marginBottom: '12px',
              fontSize: '16px',
            }}
          />

          <button onClick={handleCreateWatchlist}>Create Watchlist</button>
        </div>
      </div>
    </div>
  );
}

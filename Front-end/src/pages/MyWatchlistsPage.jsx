import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUser from '../useUser.js';
import { createWatchlist, getWatchlists } from '../watchlistApi.js';

function getBorderColor(borderStatus) {
  if (borderStatus === 'GREEN') return '#22c55e';
  if (borderStatus === 'YELLOW') return '#eab308';
  return '#ef4444';
}

export default function MyWatchlistsPage() {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();

  const [watchlists, setWatchlists] = useState([]);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [showCreateBox, setShowCreateBox] = useState(false);
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
      setShowCreateBox(false);
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
    <div className="page-shell">
      <h1 className="page-title" style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', marginBottom: '8px' }}>My Watchlists</h1>
      <p style={{ marginBottom: '20px', maxWidth: '720px' }}>
        Your shelves for every mood, marathon, and obsession. Click any movie to jump back into its details.
      </p>

      {error && <p>{error}</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
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
              padding: '18px',
              minHeight: '360px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
            className="watchlist-card"
          >
            <div>
              <h2 style={{ marginTop: 0 }}>{watchlist.name}</h2>

              {watchlist.movies.length === 0 ? (
                <p>No movies added yet.</p>
              ) : (
                <div>
                  {watchlist.movies.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/movies/${item.movie.externalMovieId}`)}
                      style={{
                        width: '100%',
                        padding: '12px 0',
                        borderBottom: '1px dashed rgba(29, 36, 48, 0.12)',
                        background: 'transparent',
                        color: '#1d2430',
                        borderLeft: 'none',
                        borderRight: 'none',
                        borderTop: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                      >
                        <strong style={{ fontSize: '1rem' }}>{item.movie.title}</strong>
                      <div style={{ fontSize: '14px', color: '#606774' }}>
                        {item.movie.releaseYear ?? 'Unknown year'}
                      </div>
                    </button>
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

        {!showCreateBox ? (
          <button
            onClick={() => setShowCreateBox(true)}
            style={{ minHeight: '360px', fontSize: '64px', cursor: 'pointer' }}
            className="watchlist-card"
          >
            <span style={{ color: '#194e57' }}>+</span>
          </button>
        ) : (
          <div
            style={{
              padding: '18px',
              minHeight: '360px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
            className="watchlist-card"
          >
            <h2 style={{ textAlign: 'center' }}>Create Watchlist</h2>

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

            <button onClick={handleCreateWatchlist}>Create</button>
            <button
              onClick={() => {
                setShowCreateBox(false);
                setNewWatchlistName('');
              }}
              style={{ marginTop: '10px' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

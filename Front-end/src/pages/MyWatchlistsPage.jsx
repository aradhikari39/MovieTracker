import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useUser from '../useUser.js';
import { createWatchlist, getWatchlists } from '../watchlistApi.js';
import '../css/MyWatchlistsPage.css';

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
      <div className="movie-details__loading">
        <h1>Loading watchlists...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-shell">
        <h1>My Watchlists</h1>
        <p>Please log in first.</p>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <h1 className="page-title watchlists-page__title">My Watchlists</h1>
      <p className="watchlists-page__intro">
        
      </p>

      {error && <p>{error}</p>}

      <div className="watchlists-page__grid">
        {watchlists.map((watchlist) => (
          <div
            key={watchlist.id}
            style={{ border: `4px solid ${getBorderColor(watchlist.borderStatus)}` }}
            className="watchlist-card watchlists-page__card"
          >
            <div>
              <h2 className="watchlists-page__card-title">{watchlist.name}</h2>

              {watchlist.movies.length === 0 ? (
                <p className="watchlists-page__empty">No movies added yet.</p>
              ) : (
                <div>
                  {watchlist.movies.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/movies/${item.movie.externalMovieId}`)}
                      className="watchlists-page__movie"
                    >
                      <strong className="watchlists-page__movie-title">{item.movie.title}</strong>
                      <div className="watchlists-page__movie-year">
                        {item.movie.releaseYear ?? 'Unknown year'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="watchlists-page__stats">
              <p>
                {watchlist.completedMovies}/{watchlist.totalMovies} movies completed
              </p>
              <p>{watchlist.progressPercent}% progress</p>
            </div>
          </div>
        ))}

        {!showCreateBox ? (
          <button onClick={() => setShowCreateBox(true)} className="watchlist-card watchlists-page__add-card">
            <span>+</span>
          </button>
        ) : (
          <div className="watchlist-card watchlists-page__create-card">
            <h2>Create Watchlist</h2>

            <input
              placeholder="New watchlist name"
              value={newWatchlistName}
              onChange={(e) => setNewWatchlistName(e.target.value)}
            />

            <button onClick={handleCreateWatchlist}>Create</button>
            <button
              onClick={() => {
                setShowCreateBox(false);
                setNewWatchlistName('');
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

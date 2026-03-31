import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import useUser from '../useUser.js';
import {
  getMyMovieData,
  getTmdbMovieDetails,
  saveMovieComment,
  saveMovieRating,
  saveMovieStatus,
} from '../movieDetailsApi.js';
import {
  addMovieToWatchlist,
  createWatchlist,
  getWatchlists,
  removeMovieFromWatchlist,
} from '../watchlistApi.js';

function getPosterUrl(posterPath) {
  if (!posterPath) return null;
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
}

function getStatusStyle(status) {
  if (status === 'WATCHED') {
    return { background: '#14532d', border: '1px solid #22c55e', label: 'Watched' };
  }

  if (status === 'WATCHING') {
    return { background: '#713f12', border: '1px solid #eab308', label: 'Watching' };
  }

  return { background: '#7f1d1d', border: '1px solid #ef4444', label: 'Not Watched' };
}

const statusCycle = {
  NOT_WATCHED: 'WATCHING',
  WATCHING: 'WATCHED',
  WATCHED: 'NOT_WATCHED',
};

export default function MovieDetailsPage() {
  const { movieId } = useParams();
  const { user, isLoading } = useUser();

  const [movie, setMovie] = useState(null);
  const [status, setStatus] = useState('NOT_WATCHED');
  const [rating, setRating] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [watchlists, setWatchlists] = useState([]);
  const [allWatchlists, setAllWatchlists] = useState([]);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showCommentEditor, setShowCommentEditor] = useState(false);
  const [showWatchlistPanel, setShowWatchlistPanel] = useState(false);

  const posterUrl = movie?.poster_path ? getPosterUrl(movie.poster_path) : null;
  const statusStyle = getStatusStyle(status);

  const selectedWatchlistIds = useMemo(
    () => new Set(watchlists.map((watchlist) => watchlist.id)),
    [watchlists]
  );

  useEffect(() => {
    async function loadPage() {
      try {
        setError('');
        setPageLoading(true);

        const tmdbMovie = await getTmdbMovieDetails(movieId);
        setMovie(tmdbMovie);

        if (user) {
          const token = await user.getIdToken();
          const personalData = await getMyMovieData(token, movieId);

          if (personalData?.status?.status) {
            setStatus(personalData.status.status);
          }

          if (personalData?.rating?.score) {
            setRating(String(personalData.rating.score));
          }

          if (personalData?.comment?.content) {
            setComment(personalData.comment.content);
          }

          setWatchlists(personalData?.watchlists || []);

          const fullWatchlists = await getWatchlists(token);
          setAllWatchlists(fullWatchlists);
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setPageLoading(false);
      }
    }

    if (!isLoading) {
      loadPage();
    }
  }, [movieId, user, isLoading]);

  async function refreshWatchlists(token) {
    const personalData = await getMyMovieData(token, movieId);
    setWatchlists(personalData?.watchlists || []);

    const fullWatchlists = await getWatchlists(token);
    setAllWatchlists(fullWatchlists);
  }

  async function handleCycleStatus() {
    if (!user || !movie) return;

    const nextStatus = statusCycle[status];

    try {
      setError('');
      setMessage('');

      const token = await user.getIdToken();

      await saveMovieStatus(token, movieId, {
        title: movie.title,
        releaseYear: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
        apiRating: movie.vote_average ?? null,
        status: nextStatus,
      });

      setStatus(nextStatus);
      setMessage('Watch status updated');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleSetRating(score) {
    if (!user || !movie) return;

    try {
      setError('');
      setMessage('');
      setRating(String(score));

      const token = await user.getIdToken();

      await saveMovieRating(token, movieId, {
        title: movie.title,
        releaseYear: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
        apiRating: movie.vote_average ?? null,
        score,
      });

      setMessage('Rating saved');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleSaveComment() {
    if (!user || !movie) return;

    try {
      setError('');
      setMessage('');

      const token = await user.getIdToken();

      await saveMovieComment(token, movieId, {
        title: movie.title,
        releaseYear: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
        apiRating: movie.vote_average ?? null,
        content: comment,
      });

      setShowCommentEditor(false);
      setMessage('Comment saved');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleToggleWatchlist(watchlistId) {
    if (!user || !movie) return;

    try {
      setError('');
      setMessage('');

      const token = await user.getIdToken();
      const alreadyAdded = selectedWatchlistIds.has(watchlistId);

      if (alreadyAdded) {
        await removeMovieFromWatchlist(token, watchlistId, Number(movieId));
        setMessage('Movie removed from watchlist');
      } else {
        await addMovieToWatchlist(token, watchlistId, {
          externalMovieId: Number(movieId),
          title: movie.title,
          releaseYear: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
          apiRating: movie.vote_average ?? null,
        });
        setMessage('Movie added to watchlist');
      }

      await refreshWatchlists(token);
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleCreateWatchlist() {
    if (!user || !movie) return;
    if (!newWatchlistName.trim()) {
      setError('Please enter a watchlist name');
      return;
    }

    try {
      setError('');
      setMessage('');

      const token = await user.getIdToken();
      const createdWatchlist = await createWatchlist(token, newWatchlistName);

      await addMovieToWatchlist(token, createdWatchlist.id, {
        externalMovieId: Number(movieId),
        title: movie.title,
        releaseYear: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
        apiRating: movie.vote_average ?? null,
      });

      setNewWatchlistName('');
      setMessage('Watchlist created and movie saved');

      await refreshWatchlists(token);
    } catch (e) {
      setError(e.message);
    }
  }

  if (isLoading || pageLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <h1>Loading movie...</h1>
      </div>
    );
  }

  if (error && !movie) {
    return (
      <div style={{ padding: '24px' }}>
        <h1>Movie Details</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div style={{ padding: '24px' }}>
        <h1>Movie Details</h1>
        <p>Movie not found.</p>
      </div>
    );
  }

  const activeStarCount = hoveredRating || Number(rating) || 0;

  return (
    <div className="page-shell" style={{ maxWidth: '1100px' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '300px 1fr',
          gap: '28px',
          alignItems: 'start',
        }}
      >
        <div>
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              style={{
                width: '100%',
                borderRadius: '18px',
                border: '1px solid #333',
              }}
            />
          ) : (
            <div
              style={{
                height: '450px',
                borderRadius: '18px',
                border: '1px solid #333',
                background: '#111',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#777',
              }}
            >
              No poster available
            </div>
          )}
        </div>

        <div>
          <h1>{movie.title}</h1>
          <p>{movie.release_date ? movie.release_date.slice(0, 4) : 'Unknown year'}</p>
          <p>{movie.overview || 'No description available.'}</p>
          <p>TMDB Rating: {movie.vote_average ?? 'N/A'}</p>

          {error && <p>{error}</p>}
          {message && <p>{message}</p>}

          {!user ? (
            <p>Please log in to use private tracking features.</p>
          ) : (
            <>
              <div style={{ marginTop: '28px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleCycleStatus}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    cursor: 'pointer',
                    color: 'white',
                    ...statusStyle,
                  }}
                >
                  {statusStyle.label}
                </button>

                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    border: '1px solid #444',
                    background: '#1b1b1b',
                    color: 'white',
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>
                    {rating ? `My Rating: ${rating}/10` : 'Not Rated'}
                  </div>

                  <div
                    style={{ display: 'flex', gap: '4px' }}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    {Array.from({ length: 10 }, (_, index) => {
                      const starValue = index + 1;
                      const active = starValue <= activeStarCount;

                      return (
                        <button
                          key={starValue}
                          onMouseEnter={() => setHoveredRating(starValue)}
                          onClick={() => handleSetRating(starValue)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: active ? '#facc15' : '#555',
                            fontSize: '20px',
                            padding: 0,
                          }}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setShowCommentEditor((current) => !current)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    border: '1px solid #444',
                    background: '#1b1b1b',
                    color: 'white',
                    cursor: 'pointer',
                  }}
                >
                  {comment ? 'My Note' : 'My Note'}
                </button>

                <button
                  onClick={() => setShowWatchlistPanel((current) => !current)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    border: '1px solid #444',
                    background: '#1b1b1b',
                    color: 'white',
                    cursor: 'pointer',
                    fontWeight: watchlists.length > 0 ? 'bold' : 'normal',
                  }}
                >
                  Save to Watchlist
                </button>
              </div>

              <div
                style={{
                  marginTop: '20px',
                  padding: '18px',
                  border: '1px solid #333',
                  borderRadius: '14px',
                  background: '#161616',
                }}
              >
                <h3>My Note</h3>
                <p>{comment || 'No comment written yet.'}</p>

                {showCommentEditor && (
                  <div style={{ marginTop: '14px' }}>
                    <textarea
                      rows="5"
                      cols="60"
                      placeholder="Write your private comment here..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <br />
                    <button onClick={handleSaveComment} style={{ marginTop: '12px' }}>
                      Save Comment
                    </button>
                  </div>
                )}
              </div>

              {showWatchlistPanel && (
                <div
                  style={{
                    marginTop: '20px',
                    padding: '18px',
                    border: '1px solid #333',
                    borderRadius: '14px',
                    background: '#161616',
                  }}
                >
                  <h3>Save to Watchlist</h3>

                  <div
                    style={{
                      display: 'flex',
                      gap: '10px',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    {allWatchlists.map((watchlist) => {
                      const active = selectedWatchlistIds.has(watchlist.id);

                      return (
                        <button
                          key={watchlist.id}
                          onClick={() => handleToggleWatchlist(watchlist.id)}
                          style={{
                            padding: '10px 14px',
                            borderRadius: '12px',
                    border: active ? '1px solid #22c55e' : '1px solid var(--line)',
                    background: active ? '#123b23' : 'var(--bg-card)',
                            color: 'white',
                            fontWeight: active ? 'bold' : 'normal',
                            cursor: 'pointer',
                          }}
                        >
                          {watchlist.name}
                        </button>
                      );
                    })}

                    <div
                      style={{
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="text"
                        placeholder="New watchlist"
                        value={newWatchlistName}
                        onChange={(e) => setNewWatchlistName(e.target.value)}
                        style={{ padding: '10px 12px' }}
                      />
                      <button
                        onClick={handleCreateWatchlist}
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          border: '1px solid #444',
                          background: '#1b1b1b',
                          color: 'white',
                          fontSize: '20px',
                          cursor: 'pointer',
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

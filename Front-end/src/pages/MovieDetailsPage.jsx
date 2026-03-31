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
import '../css/MovieDetailsPage.css';

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
      <div className="movie-details__loading">
        <h1>Loading movie...</h1>
      </div>
    );
  }

  if (error && !movie) {
    return (
      <div className="movie-details__error">
        <h1>Movie Details</h1>
        <p>{error}</p>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="movie-details__error">
        <h1>Movie Details</h1>
        <p>Movie not found.</p>
      </div>
    );
  }

  const activeStarCount = hoveredRating || Number(rating) || 0;

  return (
    <div className="page-shell movie-details">
      <div className="movie-details__layout">
        <div className="movie-details__poster-wrap">
          {posterUrl ? (
            <img src={posterUrl} alt={movie.title} className="movie-details__poster" />
          ) : (
            <div className="movie-details__poster-fallback">No poster available</div>
          )}
        </div>

        <div className="movie-details__meta">
          <h1 className="page-title movie-details__headline">{movie.title}</h1>
          <p className="movie-details__year">
            {movie.release_date ? movie.release_date.slice(0, 4) : 'Unknown year'}
          </p>
          <p className="movie-details__overview">{movie.overview || 'No description available.'}</p>
          <p className="movie-details__tmdb">TMDB Rating: {movie.vote_average ?? 'N/A'}</p>

          {(error || message) && (
            <div className="movie-details__feedback">
              {error && <p>{error}</p>}
              {message && <p>{message}</p>}
            </div>
          )}

          {!user ? (
            <p>Please log in to use private tracking features.</p>
          ) : (
            <>
              <div className="movie-details__controls">
                <button onClick={handleCycleStatus} style={statusStyle} className="movie-details__status">
                  {statusStyle.label}
                </button>

                <div className="movie-details__chip movie-details__rating-box">
                  <div className="movie-details__rating-label">
                    {rating ? `My Rating: ${rating}/10` : 'Not Rated'}
                  </div>

                  <div className="movie-details__stars" onMouseLeave={() => setHoveredRating(0)}>
                    {Array.from({ length: 10 }, (_, index) => {
                      const starValue = index + 1;
                      const active = starValue <= activeStarCount;

                      return (
                        <button
                          key={starValue}
                          onMouseEnter={() => setHoveredRating(starValue)}
                          onClick={() => handleSetRating(starValue)}
                          className={`movie-details__star ${active ? 'movie-details__star--active' : ''}`}
                        >
                          ★
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setShowCommentEditor((current) => !current)}
                  className={`movie-details__chip ${comment ? 'movie-details__chip--active' : ''}`}
                >
                  My Note
                </button>

                <button
                  onClick={() => setShowWatchlistPanel((current) => !current)}
                  className={`movie-details__chip ${watchlists.length > 0 ? 'movie-details__chip--active' : ''}`}
                >
                  Save to Watchlist
                </button>
              </div>

              <div className="soft-panel movie-details__panel">
                <h3 className="movie-details__panel-title">My Note</h3>
                <p className="movie-details__comment">{comment || 'No comment written yet.'}</p>

                {showCommentEditor && (
                  <div className="movie-details__comment-editor">
                    <textarea
                      rows="5"
                      placeholder="Write your private comment here..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <button onClick={handleSaveComment}>Save Comment</button>
                  </div>
                )}
              </div>

              {showWatchlistPanel && (
                <div className="soft-panel movie-details__panel">
                  <h3 className="movie-details__panel-title">Save to Watchlist</h3>

                  <div className="movie-details__watchlists">
                    {allWatchlists.map((watchlist) => {
                      const active = selectedWatchlistIds.has(watchlist.id);

                      return (
                        <button
                          key={watchlist.id}
                          onClick={() => handleToggleWatchlist(watchlist.id)}
                          className={`movie-details__watchlist-pill ${active ? 'movie-details__watchlist-pill--active' : ''}`}
                        >
                          {watchlist.name}
                        </button>
                      );
                    })}

                    <div className="movie-details__watchlist-create">
                      <input
                        type="text"
                        placeholder="New watchlist"
                        value={newWatchlistName}
                        onChange={(e) => setNewWatchlistName(e.target.value)}
                      />
                      <button onClick={handleCreateWatchlist} className="movie-details__watchlist-add">
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

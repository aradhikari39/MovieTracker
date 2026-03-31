import { useEffect, useState } from 'react';
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
} from '../watchlistApi.js';


export default function MovieDetailsPage() {
  const { movieId } = useParams();
  const { user, isLoading } = useUser();

  const [movie, setMovie] = useState(null);
  const [status, setStatus] = useState('NOT_WATCHED');
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');
  const [watchlists, setWatchlists] = useState([]);
  const [allWatchlists, setAllWatchlists] = useState([]);
  const [newWatchlistName, setNewWatchlistName] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

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

          if (personalData?.watchlists) {
            setWatchlists(personalData.watchlists);
          }

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

  async function handleSaveStatus() {
    if (!user || !movie) return;

    try {
      setError('');
      setMessage('');

      const token = await user.getIdToken();

      await saveMovieStatus(token, movieId, {
        title: movie.title,
        releaseYear: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
        apiRating: movie.vote_average ?? null,
        status,
      });

      setMessage('Watch status saved');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleSaveRating() {
    if (!user || !movie) return;

    try {
      setError('');
      setMessage('');

      const token = await user.getIdToken();

      await saveMovieRating(token, movieId, {
        title: movie.title,
        releaseYear: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
        apiRating: movie.vote_average ?? null,
        score: Number(rating),
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

      setMessage('Comment saved');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleAddToWatchlist(watchlistId) {
    if (!user || !movie) return;

    try {
      setError('');
      setMessage('');

      const token = await user.getIdToken();

      await addMovieToWatchlist(token, watchlistId, {
        externalMovieId: Number(movieId),
        title: movie.title,
        releaseYear: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
        apiRating: movie.vote_average ?? null,
      });

      const personalData = await getMyMovieData(token, movieId);
      setWatchlists(personalData.watchlists || []);

      const fullWatchlists = await getWatchlists(token);
      setAllWatchlists(fullWatchlists);

      setMessage('Movie added to watchlist');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleCreateAndAddWatchlist() {
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

      const personalData = await getMyMovieData(token, movieId);
      setWatchlists(personalData.watchlists || []);

      const fullWatchlists = await getWatchlists(token);
      setAllWatchlists(fullWatchlists);

      setNewWatchlistName('');
      setMessage('New watchlist created and movie added');
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

  return (
    <div style={{ padding: '24px', maxWidth: '800px' }}>
      <h1>{movie.title}</h1>
      <p>{movie.release_date ? movie.release_date.slice(0, 4) : 'Unknown year'}</p>
      <p>{movie.overview || 'No description available.'}</p>
      <p>TMDB Rating: {movie.vote_average ?? 'N/A'}</p>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      {!user ? (
        <p>Please log in to save your rating, comment, and watch status.</p>
      ) : (
        <>
          <div style={{ marginTop: '24px' }}>
            <h2>My Watch Status</h2>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="NOT_WATCHED">Not Watched</option>
              <option value="WATCHING">Watching</option>
              <option value="WATCHED">Watched</option>
            </select>
            <button onClick={handleSaveStatus} style={{ marginLeft: '12px' }}>
              Save Status
            </button>
          </div>

          <div style={{ marginTop: '24px' }}>
            <h2>My Rating</h2>
            <input
              type="number"
              min="1"
              max="10"
              placeholder="Rate 1 to 10"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
            />
            <button onClick={handleSaveRating} style={{ marginLeft: '12px' }}>
              Save Rating
            </button>
          </div>

          <div style={{ marginTop: '24px' }}>
            <h2>My Private Comment</h2>
            <textarea
              rows="6"
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

          <div style={{ marginTop: '24px' }}>
            <h2>Already in Watchlists</h2>
            {watchlists.length === 0 ? (
              <p>This movie is not in any watchlist yet.</p>
            ) : (
              watchlists.map((watchlist) => (
                <p key={watchlist.id}>{watchlist.name}</p>
              ))
            )}
          </div>

          <div style={{ marginTop: '24px' }}>
            <h2>Add to Existing Watchlist</h2>
            {allWatchlists.length === 0 ? (
              <p>No watchlists available yet.</p>
            ) : (
              allWatchlists.map((watchlist) => (
                <button
                  key={watchlist.id}
                  onClick={() => handleAddToWatchlist(watchlist.id)}
                  style={{ marginRight: '10px', marginBottom: '10px' }}
                >
                  {watchlist.name}
                </button>
              ))
            )}
          </div>

          <div style={{ marginTop: '24px' }}>
            <h2>Create New Watchlist and Add Movie</h2>
            <input
              type="text"
              placeholder="New watchlist name"
              value={newWatchlistName}
              onChange={(e) => setNewWatchlistName(e.target.value)}
            />
            <button onClick={handleCreateAndAddWatchlist} style={{ marginLeft: '12px' }}>
              Create and Add
            </button>
          </div>
        </>
      )}
    </div>
  );
}

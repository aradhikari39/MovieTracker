import { useState } from 'react';
import useUser from '../useUser.js';
import { saveComment, saveRating, updateMovieStatus } from '../movieApi.js';
import '../css/MovieTesterPage.css';

export default function MovieTesterPage() {
  const { user, isLoading } = useUser();

  const [externalMovieId, setExternalMovieId] = useState('');
  const [title, setTitle] = useState('');
  const [releaseYear, setReleaseYear] = useState('');
  const [status, setStatus] = useState('NOT_WATCHED');
  const [score, setScore] = useState('');
  const [comment, setComment] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSaveStatus() {
    try {
      setError('');
      setMessage('');

      const token = await user.getIdToken();

      await updateMovieStatus(token, externalMovieId, {
        title,
        releaseYear: releaseYear ? Number(releaseYear) : null,
        status,
      });

      setMessage('Status saved successfully');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleSaveRating() {
    try {
      setError('');
      setMessage('');

      const token = await user.getIdToken();

      await saveRating(token, externalMovieId, {
        title,
        releaseYear: releaseYear ? Number(releaseYear) : null,
        score: Number(score),
      });

      setMessage('Rating saved successfully');
    } catch (e) {
      setError(e.message);
    }
  }

  async function handleSaveComment() {
    try {
      setError('');
      setMessage('');

      const token = await user.getIdToken();

      await saveComment(token, externalMovieId, {
        title,
        releaseYear: releaseYear ? Number(releaseYear) : null,
        content: comment,
      });

      setMessage('Comment saved successfully');
    } catch (e) {
      setError(e.message);
    }
  }

  if (isLoading) {
    return <div className="movie-details__loading"><h1>Loading...</h1></div>;
  }

  if (!user) {
    return (
      <div className="page-shell tester-page">
        <h1 className="page-title tester-page__title">Movie Tester</h1>
        <p>Please log in first.</p>
      </div>
    );
  }

  return (
    <div className="page-shell tester-page">
      <div className="panel tester-page__panel">
      <h1 className="page-title tester-page__title">Movie Tester</h1>

      {error && <p>{error}</p>}
      {message && <p>{message}</p>}

      <div className="tester-page__grid">
        <input
          placeholder="External Movie ID"
          value={externalMovieId}
          onChange={(e) => setExternalMovieId(e.target.value)}
        />

        <input
          placeholder="Movie title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          placeholder="Release year"
          value={releaseYear}
          onChange={(e) => setReleaseYear(e.target.value)}
        />

        <div className="tester-page__actions">
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="NOT_WATCHED">Not Watched</option>
            <option value="WATCHING">Watching</option>
            <option value="WATCHED">Watched</option>
          </select>
          <button onClick={handleSaveStatus}>Save Status</button>
        </div>

        <div className="tester-page__actions">
          <input
            placeholder="Rating 1-10"
            value={score}
            onChange={(e) => setScore(e.target.value)}
          />
          <button onClick={handleSaveRating}>Save Rating</button>
        </div>

        <textarea
          placeholder="Private comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="5"
        />
        <button onClick={handleSaveComment}>Save Comment</button>
      </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrendingMovies, searchMovies } from '../movieSearchApi.js';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTrending() {
      try {
        setError('');
        setLoading(true);
        const data = await getTrendingMovies();
        setMovies(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    loadTrending();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        setError('');
        setLoading(true);
        const data = await searchMovies(searchText);
        setMovies(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchText]);

  return (
    <div style={{ padding: '24px' }}>
      <h1>Search Movies</h1>

      <input
        type="text"
        placeholder="Search any movie..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        style={{
          width: '100%',
          maxWidth: '520px',
          padding: '12px',
          fontSize: '16px',
          marginBottom: '24px',
        }}
      />

      {error && <p>{error}</p>}
      {loading && <p>Loading movies...</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
        }}
      >
        {movies.map((movie) => (
          <button
            key={movie.externalMovieId}
            onClick={() => navigate(`/movies/${movie.externalMovieId}`)}
            style={{
              textAlign: 'left',
              padding: '16px',
              background: '#1b1b1b',
              color: 'white',
              border: '1px solid #444',
              borderRadius: '12px',
              cursor: 'pointer',
            }}
          >
            <h3>{movie.title}</h3>
            <p>{movie.releaseYear ?? 'Unknown year'}</p>
            <p>{movie.description}</p>
            <p>TMDB Rating: {movie.voteAverage ?? 'N/A'}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

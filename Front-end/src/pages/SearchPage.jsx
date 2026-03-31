import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrendingMovies, searchMovies } from '../movieSearchApi.js';

function getPosterUrl(posterPath) {
  if (!posterPath) return null;
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
}

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
    <div className="page-shell">
      <div style={{ maxWidth: '900px', marginBottom: '30px' }}>
        <h1 className="page-title" style={{ fontSize: 'clamp(2rem, 3vw, 3rem)', marginBottom: '12px' }}>Search Movies</h1>
        <p style={{ marginBottom: '20px' }}>
          Search for any movie and open its details page to rate it, comment on it,
          and add it to your watchlists.
        </p>

        <input
          type="text"
          placeholder="Search any movie..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: '700px', fontSize: '17px' }}
          />
      </div>

      {error && <p>{error}</p>}
      {loading && <p>Loading movies...</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '18px',
        }}
      >
        {movies.map((movie) => {
          const posterUrl = getPosterUrl(movie.posterPath);

          return (
            <button
              key={movie.externalMovieId}
              onClick={() => navigate(`/movies/${movie.externalMovieId}`)}
              style={{
                textAlign: 'left',
                padding: 0,
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              className="movie-card"
            >
              <div
                style={{
                  height: '320px',
                  background: '#111',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={movie.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div style={{ color: '#777', padding: '12px', textAlign: 'center' }}>
                    No poster available
                  </div>
                )}
              </div>

              <div style={{ padding: '16px' }}>
                <h3 style={{ marginTop: 0, marginBottom: '10px' }}>{movie.title}</h3>
                <p style={{ margin: '0 0 8px 0', color: '#bbb' }}>
                  {movie.releaseYear ?? 'Unknown year'}
                </p>
                <p
                  style={{
                    margin: '0 0 10px 0',
                    color: '#ddd',
                    fontSize: '14px',
                    lineHeight: 1.4,
                  }}
                >
                  {movie.description.length > 110
                    ? `${movie.description.slice(0, 110)}...`
                    : movie.description}
                </p>
                <p style={{ margin: 0, color: '#facc15', fontWeight: 'bold' }}>
                  TMDB Rating: {movie.voteAverage ?? 'N/A'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

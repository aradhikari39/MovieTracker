import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrendingMovies, searchMovies } from '../movieSearchApi.js';
import '../css/SearchPage.css';

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
      <div className="search-page__intro">
        <p className="search-page__eyebrow">Explore and collect your movies</p>
        <div className="search-page__intro-row">
          <div>
            <h1 className="page-title search-page__title">Search Movies</h1>
            <p className="search-page__description">
              
            </p>
          </div>
          <p className="search-page__hint"></p>
        </div>

        <input
          type="text"
          placeholder="Search any movie..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="search-page__input"
        />
      </div>

      {error && <p>{error}</p>}
      {loading && <p>Loading movies...</p>}

      <div className="search-page__grid">
        {movies.map((movie) => {
          const posterUrl = getPosterUrl(movie.posterPath);

          return (
            <button
              key={movie.externalMovieId}
              onClick={() => navigate(`/movies/${movie.externalMovieId}`)}
              className="movie-card search-page__card"
            >
              <div className="search-page__poster">
                {posterUrl ? (
                  <img src={posterUrl} alt={movie.title} />
                ) : (
                  <div className="search-page__poster-fallback">No poster available</div>
                )}
                <div className="search-page__poster-overlay" />
              </div>

              <div className="search-page__card-body">
                <div className="search-page__card-meta">
                  <p className="search-page__year">{movie.releaseYear ?? 'Unknown year'}</p>
                  <p className="search-page__rating">
                    TMDB {movie.voteAverage ?? 'N/A'}
                  </p>
                </div>
                <h3 className="search-page__card-title">{movie.title}</h3>
                <p className="search-page__overview">
                  {movie.description.length > 110
                    ? `${movie.description.slice(0, 110)}...`
                    : movie.description}
                </p>
                <span className="search-page__cta">Open details</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

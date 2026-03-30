const API_BASE_URL = 'http://localhost:8000/api';

function mapTmdbMovie(movie) {
  return {
    externalMovieId: movie.id,
    title: movie.title,
    releaseYear: movie.release_date ? Number(movie.release_date.slice(0, 4)) : null,
    description: movie.overview || 'No description available.',
    posterPath: movie.poster_path,
    voteAverage: movie.vote_average,
  };
}

export async function getTrendingMovies() {
  const response = await fetch(`${API_BASE_URL}/tmdb/trending`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to fetch trending movies');
  }

  const data = await response.json();
  return (data.results || []).slice(0, 20).map(mapTmdbMovie);
}

export async function searchMovies(query) {
  if (!query.trim()) {
    return getTrendingMovies();
  }

  const response = await fetch(
    `${API_BASE_URL}/tmdb/search?query=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to search movies');
  }

  const data = await response.json();
  return (data.results || []).slice(0, 20).map(mapTmdbMovie);
}

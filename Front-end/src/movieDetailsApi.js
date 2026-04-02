const API_BASE_URL = '/api';

export async function getTmdbMovieDetails(movieId) {
  const response = await fetch(`${API_BASE_URL}/tmdb/movie/${movieId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to fetch movie details');
  }

  return response.json();
}

export async function getMyMovieData(token, movieId) {
  const response = await fetch(`${API_BASE_URL}/movies/${movieId}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to fetch personal movie data');
  }

  return response.json();
}

export async function saveMovieStatus(token, movieId, payload) {
  const response = await fetch(`${API_BASE_URL}/movies/${movieId}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to save movie status');
  }

  return response.json();
}

export async function saveMovieRating(token, movieId, payload) {
  const response = await fetch(`${API_BASE_URL}/ratings/${movieId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to save rating');
  }

  return response.json();
}

export async function saveMovieComment(token, movieId, payload) {
  const response = await fetch(`${API_BASE_URL}/ratings/${movieId}/comment`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to save comment');
  }

  return response.json();
}

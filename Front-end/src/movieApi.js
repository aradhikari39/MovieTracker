const API_BASE_URL = '/api';

export async function updateMovieStatus(token, externalMovieId, payload) {
  const response = await fetch(`${API_BASE_URL}/movies/${externalMovieId}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to update movie status');
  }

  return response.json();
}

export async function saveRating(token, externalMovieId, payload) {
  const response = await fetch(`${API_BASE_URL}/ratings/${externalMovieId}`, {
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

export async function saveComment(token, externalMovieId, payload) {
  const response = await fetch(`${API_BASE_URL}/ratings/${externalMovieId}/comment`, {
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

export async function getRatings(token) {
  const response = await fetch(`${API_BASE_URL}/ratings`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to fetch ratings');
  }

  return response.json();
}

const API_BASE_URL = 'http://localhost:8000/api';

export async function getWatchlists(token) {
  const response = await fetch(`${API_BASE_URL}/watchlists`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to fetch watchlists');
  }

  return response.json();
}

export async function createWatchlist(token, name) {
  const response = await fetch(`${API_BASE_URL}/watchlists`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to create watchlist');
  }

  return response.json();
}

const API_BASE_URL = 'http://localhost:8000/api';

export async function syncUser(token) {
  const response = await fetch(`${API_BASE_URL}/users/sync`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to sync user');
  }

  return response.json();
}

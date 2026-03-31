const API_BASE_URL = 'http://localhost:8000/api';

export async function getPolls() {
  const response = await fetch(`${API_BASE_URL}/polls`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to fetch polls');
  }

  return response.json();
}

export async function createPoll(token, payload) {
  const response = await fetch(`${API_BASE_URL}/polls`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to create poll');
  }

  return response.json();
}

export async function voteOnPoll(token, pollId, pollOptionId) {
  const response = await fetch(`${API_BASE_URL}/polls/${pollId}/vote`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pollOptionId }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Failed to vote on poll');
  }

  return response.json();
}

import { useEffect, useState } from 'react';
import useUser from '../useUser.js';
import { getRatings } from '../movieApi.js';

export default function MyRatingsPage() {
  const { user, isLoading } = useUser();
  const [ratings, setRatings] = useState([]);
  const [error, setError] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    async function loadRatings() {
      if (!user) {
        setPageLoading(false);
        return;
      }

      try {
        const token = await user.getIdToken();
        const data = await getRatings(token);
        setRatings(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setPageLoading(false);
      }
    }

    if (!isLoading) {
      loadRatings();
    }
  }, [user, isLoading]);

  if (isLoading || pageLoading) {
    return <div><h1>Loading ratings...</h1></div>;
  }

  if (!user) {
    return (
      <div>
        <h1>My Ratings</h1>
        <p>Please log in first.</p>
      </div>
    );
  }

  return (
    <div>
      <h1>My Ratings</h1>

      {error && <p>{error}</p>}

      {ratings.length === 0 ? (
        <p>No ratings yet.</p>
      ) : (
        ratings.map((item) => (
          <div
            key={item.id}
            style={{
              border: '1px solid #555',
              marginTop: '16px',
              padding: '16px',
            }}
          >
            <h2>{item.movie.title}</h2>
            <p>Release Year: {item.movie.releaseYear ?? 'Unknown'}</p>
            <p>My Rating: {item.score}/10</p>
          </div>
        ))
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import useUser from '../useUser.js';
import { getRatings } from '../movieApi.js';
import { useNavigate } from 'react-router-dom';
import '../css/MyRatingsPage.css';

export default function MyRatingsPage() {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();

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
    return (
      <div className="movie-details__loading">
        <h1>Loading ratings...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-shell">
        <h1>My Ratings</h1>
        <p>Please log in first.</p>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <h1 className="page-title ratings-page__title">My Ratings</h1>

      {error && <p>{error}</p>}

      {ratings.length === 0 ? (
        <p>No ratings yet.</p>
      ) : (
        <div className="ratings-page__table-wrap">
          <table className="ratings-table ratings-page__table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Movie</th>
                <th>Release Year</th>
                <th>TMDB Rating</th>
                <th>My Rating</th>
                <th>First Rated</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <button
                      onClick={() => navigate(`/movies/${item.movie.externalMovieId}`)}
                      className="ratings-page__movie-link"
                    >
                      {item.movie.title}
                    </button>
                  </td>

                  <td>{item.movie.releaseYear ?? 'Unknown'}</td>
                  <td>{item.movie.apiRating ?? 'N/A'}</td>
                  <td>{item.score}/10</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

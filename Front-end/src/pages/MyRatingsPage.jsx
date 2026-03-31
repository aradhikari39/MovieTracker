import { useEffect, useState } from 'react';
import useUser from '../useUser.js';
import { getRatings } from '../movieApi.js';
import { useNavigate } from 'react-router-dom';


const cellStyle = {
  textAlign: 'left',
  padding: '12px',
};

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
      <div style={{ padding: '24px' }}>
        <h1>Loading ratings...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '24px' }}>
        <h1>My Ratings</h1>
        <p>Please log in first.</p>
      </div>
    );
  }

  return (
    <div className="page-shell">
      <h1 className="page-title" style={{ fontSize: 'clamp(2rem, 3vw, 3rem)' }}>My Ratings</h1>

      {error && <p>{error}</p>}

      {ratings.length === 0 ? (
        <p>No ratings yet.</p>
      ) : (
        <div style={{ overflowX: 'auto', marginTop: '20px' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
            }}
            className="ratings-table"
          >
            <thead>
              <tr style={{ background: '#222' }}>
                <th style={cellStyle}>Order</th>
                <th style={cellStyle}>Movie</th>
                <th style={cellStyle}>Release Year</th>
                <th style={cellStyle}>TMDB Rating</th>
                <th style={cellStyle}>My Rating</th>
                <th style={cellStyle}>First Rated</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((item, index) => (
                <tr key={item.id} style={{ borderTop: '1px solid #333' }}>
                  <td style={cellStyle}>{index + 1}</td>
                  <td style={cellStyle}>
                    <button
                      onClick={() => navigate(`/movies/${item.movie.externalMovieId}`)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#7dd3fc',
                        cursor: 'pointer',
                        padding: 0,
                        textAlign: 'left',
                        font: 'inherit',
                      }}
                    >
                      {item.movie.title}
                    </button>
                  </td>

                  <td style={cellStyle}>{item.movie.releaseYear ?? 'Unknown'}</td>
                  <td style={cellStyle}>{item.movie.apiRating ?? 'N/A'}</td>
                  <td style={cellStyle}>{item.score}/10</td>
                  <td style={cellStyle}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

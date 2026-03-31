import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPolls } from '../pollApi.js';

export default function HomePage() {
  const navigate = useNavigate();
  const [topPolls, setTopPolls] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadTopPolls() {
      try {
        const polls = await getPolls();
        setTopPolls(polls.slice(0, 2));
      } catch (e) {
        setError(e.message);
      }
    }

    loadTopPolls();
  }, []);

  return (
    <div style={{ padding: '24px' }}>
      <section
        style={{
          minHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <h1 style={{ fontSize: '42px', marginBottom: '18px' }}>MovieTracker</h1>
        <p style={{ maxWidth: '650px', marginBottom: '24px' }}>
          Track your movies privately, build watchlists, save personal ratings,
          and keep your own movie notes in one place.
        </p>

        <div
          onClick={() => navigate('/search')}
          style={{
            width: '100%',
            maxWidth: '700px',
            padding: '18px 22px',
            fontSize: '18px',
            border: '1px solid #555',
            borderRadius: '14px',
            background: '#1b1b1b',
            cursor: 'pointer',
          }}
        >
          Search for any movie...
        </div>

        <div style={{ marginTop: '24px' }}>
          <Link to="/features">Go to Features Page</Link>
        </div>
      </section>

      <section style={{ paddingTop: '60px' }}>
        <h2>Top User Polls</h2>
        <p>These are the most voted polls across users.</p>

        {error && <p>{error}</p>}

        {topPolls.length === 0 ? (
          <p>No polls yet.</p>
        ) : (
          <div style={{ marginTop: '20px' }}>
            {topPolls.map((poll, index) => (
              <div
                key={poll.id}
                style={{
                  marginBottom: '20px',
                  padding: '20px',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  background: '#181818',
                }}
              >
                <h3>
                  #{index + 1} {poll.question}
                </h3>
                <p>Total Votes: {poll.totalVotes}</p>
                <Link to="/polls">Open User Polls</Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

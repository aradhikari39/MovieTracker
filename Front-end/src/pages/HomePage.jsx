import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: '24px' }}>
      <h1>MovieTracker Home</h1>
      <p>This is the working home page for now.</p>
      <p>Next we will build real movie details and real API integration.</p>

      <div
        onClick={() => navigate('/search')}
        style={{
          marginTop: '24px',
          padding: '14px 18px',
          border: '1px solid #555',
          borderRadius: '10px',
          maxWidth: '420px',
          cursor: 'pointer',
          background: '#1b1b1b',
        }}
      >
        Tap here to search movies
      </div>
    </div>
  );
}

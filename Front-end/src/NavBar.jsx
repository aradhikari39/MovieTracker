import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase.js';
import useUser from './useUser.js';

export default function NavBar() {
  const { isLoading, user } = useUser();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate('/login');
  }

  return (
    <nav
      style={{
        padding: '16px 24px',
        borderBottom: '1px solid #333',
        background: '#111',
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Link to="/">Home</Link>
        <Link to="/search">Search</Link>
        <Link to="/features">Features</Link>
        <Link to="/polls">Polls</Link>
        <Link to="/my-watchlists">My Watchlists</Link>
        <Link to="/my-ratings">My Ratings</Link>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isLoading ? (
            <span>Loading...</span>
          ) : user ? (
            <>
              <span>{user.email}</span>
              <button onClick={handleLogout}>Log Out</button>
            </>
          ) : (
            <>
              <button onClick={() => navigate('/login')}>Log In</button>
              <button onClick={() => navigate('/create-account')}>Create Account</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from './firebase.js';
import useUser from './useUser.js';

export default function NavBar() {
  const { user, isLoading } = useUser();
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut(auth);
    navigate('/');
  }

  return (
    <nav
      style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        padding: '16px 24px',
        borderBottom: '1px solid #333',
      }}
    >
      <Link to="/">Home</Link>
      <Link to="/my-watchlists">My Watchlists</Link>
      <Link to="/my-ratings">My Ratings</Link>
      <Link to="/movie-tester">Movie Tester</Link>

      <div style={{ marginLeft: 'auto' }}>
        {isLoading ? (
          <span>Loading...</span>
        ) : user ? (
          <>
            <span style={{ marginRight: '12px' }}>{user.email}</span>
            <button onClick={handleLogout}>Log Out</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ marginRight: '12px' }}>
              Log In
            </Link>
            <Link to="/create-account">Create Account</Link>
          </>
        )}
      </div>
    </nav>
  );
}

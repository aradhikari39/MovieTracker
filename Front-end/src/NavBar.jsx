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
    <nav className="app-nav">
      <div className="app-nav__inner">
        <Link to="/" className="app-brand">MovieTracker</Link>

        <div className="app-nav__links">
          <Link to="/" className="app-nav__link">Home</Link>
          <Link to="/search" className="app-nav__link">Search</Link>
          <Link to="/features" className="app-nav__link">Features</Link>
          <Link to="/polls" className="app-nav__link">Polls</Link>
          <Link to="/my-watchlists" className="app-nav__link">My Watchlists</Link>
          <Link to="/my-ratings" className="app-nav__link">My Ratings</Link>
        </div>

        <div className="app-nav__auth">
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

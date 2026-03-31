import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.js';
import { syncUser } from '../api.js';
import '../css/LoginPage.css';

function getLoginErrorMessage(error) {
  if (
    error?.code === 'auth/invalid-credential' ||
    error?.code === 'auth/wrong-password' ||
    error?.code === 'auth/user-not-found' ||
    error?.code === 'auth/invalid-email'
  ) {
    return 'Wrong email or password';
  }

  return 'Unable to log in right now. Please try again.';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || '/';

  async function logIn() {
    try {
      setError('');

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      await syncUser(token);
      navigate(redirectTo, { replace: true });
    } catch (e) {
      setError(getLoginErrorMessage(e));
    }
  }

  return (
    <div className="page-shell auth-page">
      <div className="panel auth-page__panel">
      <p className="auth-page__eyebrow">Welcome back</p>
      <h1 className="page-title auth-page__title">Log In</h1>
      <p className="auth-page__copy">Step back into your private movie shelves, ratings, and notes.</p>

      <div className="auth-page__form">
        <input
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Your password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="auth-page__submit" onClick={logIn}>Log In</button>
      </div>

      <p className="auth-page__link">
        <Link to="/create-account">Don&apos;t have an account? Create one here</Link>
      </p>
      {error && <p className="auth-page__error auth-page__error--inline">{error}</p>}
      </div>
    </div>
  );
}

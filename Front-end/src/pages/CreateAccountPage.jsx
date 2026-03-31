import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.js';
import { syncUser } from '../api.js';
import '../css/CreateAccountPage.css';

function getCreateAccountErrorMessage(error) {
  if (error?.code === 'auth/email-already-in-use') {
    return 'An account with this email already exists';
  }

  if (error?.code === 'auth/invalid-email') {
    return 'Please enter a valid email address';
  }

  if (error?.code === 'auth/weak-password') {
    return 'Password should be at least 6 characters';
  }

  return 'Unable to create your account right now. Please try again.';
}

export default function CreateAccountPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  async function createAccount() {
    if (password !== confirmPassword) {
      setError('Password and confirm password do not match');
      return;
    }

    try {
      setError('');

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();

      await syncUser(token);
      navigate('/', { replace: true });
    } catch (e) {
      setError(getCreateAccountErrorMessage(e));
    }
  }

  return (
    <div className="page-shell auth-page">
      <div className="panel auth-page__panel">
      <p className="auth-page__eyebrow">Start your archive</p>
      <h1 className="page-title auth-page__title">Create Account</h1>
      <p className="auth-page__copy">Make your own space for watchlists, ratings, notes, and future features.</p>

      {error && <p className="auth-page__error">{error}</p>}

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

        <input
          placeholder="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button className="auth-page__submit" onClick={createAccount}>Create Account</button>
      </div>

      <p className="auth-page__link">
        <Link to="/login">Already have an account? Log In</Link>
      </p>
      </div>
    </div>
  );
}

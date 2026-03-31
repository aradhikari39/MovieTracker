import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.js';
import { syncUser } from '../api.js';

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
      setError(e.message);
    }
  }

  return (
    <div style={{ padding: '24px' }}>
      <h1>Log In</h1>

      {error && <p>{error}</p>}

      <input
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br />

      <input
        placeholder="Your password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />

      <button onClick={logIn}>Log In</button>

      <p>
        <Link to="/create-account">Don't have an account? Create one here</Link>
      </p>
    </div>
  );
}

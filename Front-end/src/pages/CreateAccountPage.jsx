import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.js';
import { syncUser } from '../api.js';

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
      navigate('/');
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <h1>Create Account</h1>

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

      <input
        placeholder="Confirm password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <br />

      <button onClick={createAccount}>Create Account</button>

      <p>
        <Link to="/login">Already have an account? Log In</Link>
      </p>
    </div>
  );
}

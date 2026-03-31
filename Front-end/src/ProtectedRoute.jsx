import { Navigate, useLocation } from 'react-router-dom';
import useUser from './useUser.js';

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useUser();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ padding: '24px' }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}

import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function PrivateRoute({ children }) {
  const { token } = useAuth();
  const { shopSlug } = useParams();
  if (!token) {
    return <Navigate to={`/${shopSlug}/login`} replace />;
  }
  return children;
}

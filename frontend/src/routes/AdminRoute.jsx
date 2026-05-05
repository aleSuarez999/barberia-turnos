import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';

export default function AdminRoute({ children }) {
  const { token, userType } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (userType !== 'admin') return <Navigate to="/" replace />;
  return children;
}

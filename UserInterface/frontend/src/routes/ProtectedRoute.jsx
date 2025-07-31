import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, role, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // or spinner

  if (!token) return <Navigate to="/login" />;
  if (!allowedRoles.includes(role)) return <Navigate to="/unauthorized" />;

  return children;
};

export default ProtectedRoute;

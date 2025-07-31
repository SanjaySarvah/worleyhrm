// src/routes/PublicRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleHome = (role) => {
  const r = role?.toLowerCase?.();
  if (r === 'admin') return '/admin';
  if (r === 'hr' || r === 'employee') return '/hr';
  if (r === 'staff' || r === 'user') return '/staff';
  return '/unauthorized';
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  if (user) {
    return <Navigate to={roleHome(user.role)} replace />;
  }
  return children;
};

export default PublicRoute;

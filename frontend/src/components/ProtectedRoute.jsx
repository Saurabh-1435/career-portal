import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function ProtectedRoute({ children, requireAuth = true, roles = [] }) {
  const { isLoggedIn, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (requireAuth && !isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles.length && user) {
    const hasRole = roles.some((r) => user.roles?.includes(r));
    if (!hasRole) return <Navigate to="/access-denied" replace />;
  }

  return children;
}

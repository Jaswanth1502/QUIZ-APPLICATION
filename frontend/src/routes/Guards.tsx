import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';

export function ProtectedRoute() {
  const {user, loading} = useAuth();
  const location = useLocation();
  if (loading) return <Loading/>;
  return user ? <Outlet/> : <Navigate to="/login" state={{from:location}} replace/>;
}

export function AdminRoute() {
  const {user, loading} = useAuth();
  if (loading) return <Loading/>;
  return user?.roles.includes('ROLE_ADMIN') ? <Outlet/> : <Navigate to="/unauthorized" replace/>;
}

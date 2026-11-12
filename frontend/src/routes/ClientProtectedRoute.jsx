import { Navigate, Outlet } from 'react-router-dom';

function ClientProtectedRoute() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'CLIENT') {
    return <Navigate to="/client" replace />;
  }

  return <Outlet />;
}

export default ClientProtectedRoute;
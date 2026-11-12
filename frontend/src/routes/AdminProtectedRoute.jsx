import { Navigate, Outlet } from 'react-router-dom';

function AdminProtectedRoute() {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  return <Outlet />;
}

export default AdminProtectedRoute;
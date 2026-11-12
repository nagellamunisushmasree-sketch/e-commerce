import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/client');
  };

  return {
    token,
    role,
    isLoggedIn: Boolean(token),
    logout,
  };
}
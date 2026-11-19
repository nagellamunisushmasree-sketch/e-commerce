import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { api } from '../services/api';

export function useAuth() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    dispatch(api.util.resetApiState());
    navigate('/login');
  };

  return {
    token,
    role,
    username,
    isLoggedIn: Boolean(token),
    logout,
  };
}
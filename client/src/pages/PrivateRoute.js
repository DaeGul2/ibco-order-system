// client/src/pages/PrivateRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>로딩 중...</div>;
  return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;

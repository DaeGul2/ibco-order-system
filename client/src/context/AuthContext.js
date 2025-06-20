// client/src/context/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // 사용자 정보
  const [token, setToken] = useState(null);     // JWT 토큰
  const [loading, setLoading] = useState(true); // 초기 로딩 여부

  // localStorage에서 인증 정보 복원
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      authService.getProfile(storedToken)
        .then(res => {
          setUser(res.user);
          setToken(storedToken);
        })
        .catch(() => {
          setUser(null);
          setToken(null);
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (loginData) => {
    const res = await authService.login(loginData);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('token', res.token);
  };

  const handleRegister = async (registerData) => {
    const res = await authService.register(registerData);
    setUser(res.user);
    setToken(res.token);
    localStorage.setItem('token', res.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, handleLogin, handleRegister, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

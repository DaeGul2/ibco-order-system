import axios from 'axios';

const API = process.env.REACT_APP_API_URL + '/api/auth';

export const register = async ({ userId, password, userName }) => {
  const res = await axios.post(`${API}/register`, { userId, password, userName });
  return res.data;
};

export const login = async ({ userId, password }) => {
  const res = await axios.post(`${API}/login`, { userId, password });
  return res.data;
};

export const getProfile = async (token) => {
  const res = await axios.get(`${API}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

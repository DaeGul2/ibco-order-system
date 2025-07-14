import axios from 'axios';

const API = process.env.REACT_APP_API_URL + '/api/orders/ingredients';

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// 1. 원료 발주 생성
export const createIngredientOrder = async (data, token) => {
  const res = await axios.post(API, data, authHeader(token));
  return res.data;
};

// 2. 전체 발주 목록 조회
export const getAllIngredientOrders = async (token) => {
  const res = await axios.get(API, authHeader(token));
  return res.data;
};

// 3. 단일 발주 상세 조회
export const getIngredientOrderById = async (id, token) => {
  const res = await axios.get(`${API}/${id}`, authHeader(token));
  return res.data;
};

// 4. 발주 수정
export const updateIngredientOrder = async (id, data, token) => {
  const res = await axios.put(`${API}/${id}`, data, authHeader(token));
  return res.data;
};

// 5. 발주 삭제
export const deleteIngredientOrder = async (id, token) => {
  await axios.delete(`${API}/${id}`, authHeader(token));
};

// 6. 창고 반영
export const applyIngredientOrder = async (id, token) => {
  const res = await axios.post(`${API}/${id}/apply`, {}, authHeader(token));
  return res.data;
};

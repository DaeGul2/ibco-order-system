import axios from 'axios';

const API = process.env.REACT_APP_API_URL + '/api/orders';

// [1] 발주 생성
export const createOrder = async (data, token) => {
  const res = await axios.post(API, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// [2] 전체 발주 목록 조회
export const getAllOrders = async (token) => {
  const res = await axios.get(API, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// [3] 발주 상세 조회
export const getOrderById = async (id, token) => {
  const res = await axios.get(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

// [4] 발주 삭제
export const deleteOrder = async (id, token) => {
  await axios.delete(`${API}/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
// [5] 발주 창고 적용 (우선순위 1 창고에서 차감)
export const applyOrder = async (id, token) => {
  const res = await axios.post(`${API}/${id}/apply`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const rollbackOrder = async (id, token) => {
  const res = await axios.post(`${API}/${id}/rollback`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

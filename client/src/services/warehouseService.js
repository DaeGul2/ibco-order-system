// client/src/services/warehouseService.js
import axios from 'axios';

const API = process.env.REACT_APP_API_URL + '/api/warehouses';

const authHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` },
});

// [1] 창고 생성
export const createWarehouse = async (data, token) => {
  const res = await axios.post(API, data, authHeader(token));
  return res.data;
};

// [2] 전체 창고 목록 조회
export const getAllWarehouses = async (token) => {
  const res = await axios.get(API, authHeader(token));
  return res.data;
};

// [3] 창고 상세 조회 (by ID)
export const getWarehouseById = async (id, token) => {
  const res = await axios.get(`${API}/${id}`, authHeader(token));
  return res.data;
};

// [4] 창고 수정
export const updateWarehouse = async (id, data, token) => {
  const res = await axios.put(`${API}/${id}`, data, authHeader(token));
  return res.data;
};

// [5] 창고 삭제
export const deleteWarehouse = async (id, token) => {
  await axios.delete(`${API}/${id}`, authHeader(token));
};

// [6] 창고별 보유 원료 목록 조회
export const getWarehouseIngredients = async (warehouseId, token) => {
  const res = await axios.get(`${API}/${warehouseId}/ingredients`, authHeader(token));
  return res.data;
};

// [7] 창고-원료 단일 조회
export const getWarehouseIngredientById = async (warehouseId, ingredientId, token) => {
  const res = await axios.get(`${API}/${warehouseId}/ingredients/${ingredientId}`, authHeader(token));
  return res.data;
};

// [8] 창고에 원료 추가 or 수정
export const addOrUpdateWarehouseIngredient = async (data, token) => {
  const res = await axios.post(`${API}/ingredients`, data, authHeader(token));
  return res.data;
};

// [9] 창고-원료 삭제
export const deleteWarehouseIngredient = async (warehouseId, ingredientId, token) => {
  await axios.delete(`${API}/${warehouseId}/ingredients/${ingredientId}`, authHeader(token));
};

export const bulkSetWarehouseIngredients = async (bulkData, token) => {
  const res = await axios.post(`${API}/ingredients/bulk-set`, bulkData, authHeader(token));
  return res.data;
};


export const updateWarehousePriorities = async (orderedPriorityIds, token) => {
  const res = await axios.patch(`${API}/priority`, { orderedPriorityIds }, authHeader(token));
  return res.data;
};
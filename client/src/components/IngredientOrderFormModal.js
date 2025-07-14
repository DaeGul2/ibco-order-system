import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Grid, Paper, TextField, Button, MenuItem, Snackbar, Alert
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getAllIngredients } from '../services/ingredientService';
import { getAllWarehouses } from '../services/warehouseService';
import { createIngredientOrder } from '../services/ingredientOrderService';

const IngredientOrderFormModal = ({ open, onClose, onSuccess }) => {
  const { token, user } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [title, setTitle] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = async () => {
    const ing = await getAllIngredients(token);
    const wh = await getAllWarehouses(token);
    setIngredients(ing);
    setWarehouses(wh.map(w => w.Warehouse));
  };

  useEffect(() => {
    if (open) {
      fetchData();
      setOrderItems([]);
      setTitle('');
      setSelectedWarehouse('');
    }
  }, [open]);

  const handleAddToOrder = (ingredient) => {
    setOrderItems(prev => [...prev, { ...ingredient, quantityKg: '' }]);
    setIngredients(prev => prev.filter(i => i.id !== ingredient.id));
  };

  const handleRemoveFromOrder = (id) => {
    const removed = orderItems.find(i => i.id === id);
    setIngredients(prev => [...prev, removed]);
    setOrderItems(prev => prev.filter(i => i.id !== id));
  };

  const handleQtyChange = (id, value) => {
    setOrderItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantityKg: value } : item
    ));
  };

  const getTotalCost = () => {
    return orderItems.reduce((sum, i) => {
      const kg = parseFloat(i.quantityKg || 0);
      const cost = parseFloat(i.cost || 0);
      return sum + kg * cost;
    }, 0);
  };

  const handleSubmit = async () => {
    try {
      if (!selectedWarehouse) return alert('창고를 선택하세요.');
      if (!title.trim()) return alert('발주명을 입력하세요.');
      if (orderItems.length === 0) return alert('발주 항목이 없습니다.');

      const items = orderItems.map(i => ({
        ingredientId: i.id,
        quantityKg: parseFloat(i.quantityKg)
      }));

      await createIngredientOrder({
        title,
        writer: user.userName,
        warehouseId: selectedWarehouse,
        items
      }, token);

      setSnackbar({ open: true, message: '발주가 완료되었습니다.', severity: 'success' });
      onSuccess(); // ✅ 발주 후 상위 페이지 리프레시
      onClose();
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: '발주 실패', severity: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>원료 발주 등록</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="발주명"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
          />
          <TextField
            select
            label="창고 선택"
            value={selectedWarehouse}
            onChange={(e) => setSelectedWarehouse(e.target.value)}
            fullWidth
          >
            {warehouses.map(w => (
              <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
            ))}
          </TextField>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle1">📦 전체 원료 목록</Typography>
            <Paper sx={{ maxHeight: 400, overflowY: 'auto', p: 2 }}>
              {ingredients.map(i => (
                <Box key={i.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>{i.name} (₩{i.cost}/kg)</Typography>
                  <Button size="small" variant="outlined" onClick={() => handleAddToOrder(i)}>담기</Button>
                </Box>
              ))}
            </Paper>
          </Grid>

          <Grid item xs={6}>
            <Typography variant="subtitle1">📝 발주 목록</Typography>
            <Paper sx={{ maxHeight: 400, overflowY: 'auto', p: 2 }}>
              {orderItems.map(item => (
                <Box key={item.id} sx={{ mb: 2 }}>
                  <Typography>{item.name} (₩{item.cost}/kg)</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <TextField
                      type="number"
                      label="수량 (kg)"
                      value={item.quantityKg}
                      onChange={(e) => handleQtyChange(item.id, e.target.value)}
                      size="small"
                    />
                    <Button color="error" onClick={() => handleRemoveFromOrder(item.id)}>삭제</Button>
                  </Box>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'right', mt: 2 }}>
          <Typography>💰 총 비용: ₩{getTotalCost().toLocaleString()}</Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        <Button onClick={handleSubmit} variant="contained">발주 생성</Button>
      </DialogActions>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Dialog>
  );
};

export default IngredientOrderFormModal;

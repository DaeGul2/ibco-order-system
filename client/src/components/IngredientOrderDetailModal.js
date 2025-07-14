import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Box, Button, Table, TableHead, TableRow,
  TableCell, TableBody, Snackbar, Alert
} from '@mui/material';
import {
  getIngredientOrderById,
  applyIngredientOrder
} from '../services/ingredientOrderService';
import { useAuth } from '../context/AuthContext';

const IngredientOrderDetailModal = ({ open, onClose, order, onUpdated }) => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [info, setInfo] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchDetail = async () => {
    try {
      const res = await getIngredientOrderById(order.id, token);
      setItems(res.items || []);
      setInfo(res.order);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (open) fetchDetail();
  }, [open]);

  const handleApply = async () => {
    try {
      await applyIngredientOrder(order.id, token);
      setSnackbar({ open: true, message: '창고 반영 완료', severity: 'success' });
      onUpdated(); // 리스트 새로고침
      onClose(); // 모달 닫기
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: '창고 반영 실패', severity: 'error' });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>원료 발주 상세</DialogTitle>
      <DialogContent dividers>
        {info && (
          <Box sx={{ mb: 2 }}>
            <Typography><strong>발주명:</strong> {info.title}</Typography>
            <Typography><strong>작성자:</strong> {info.writer}</Typography>
            <Typography><strong>창고 ID:</strong> {items[0]?.warehouseId || '-'}</Typography>
            <Typography><strong>창고 반영 상태:</strong> {info.isApplied ? '✅ 완료' : '❌ 미반영'}</Typography>
          </Box>
        )}

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>원료명</TableCell>
              <TableCell>단가 (₩/kg)</TableCell>
              <TableCell>수량 (kg)</TableCell>
              <TableCell>총금액</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map(item => (
              <TableRow key={item.id}>
                <TableCell>{item.Ingredient?.name}</TableCell>
                <TableCell>{item.unitCost}</TableCell>
                <TableCell>{item.quantityKg}</TableCell>
                <TableCell>{(item.unitCost * item.quantityKg).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        {!info?.isApplied && (
          <Button variant="contained" onClick={handleApply}>
            창고 반영
          </Button>
        )}
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

export default IngredientOrderDetailModal;

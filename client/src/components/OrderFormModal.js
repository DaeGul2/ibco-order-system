// client/src/components/OrderFormModal.js
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Typography, Grid, MenuItem
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orderService';
import { getAllProducts } from '../services/productService';

const OrderFormModal = ({ open, onClose }) => {
  const { user, token } = useAuth();
  const [title, setTitle] = useState('');
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (open) {
      getAllProducts(token).then(setProducts);
      setTitle('');
      setItems([]);
    }
  }, [open, token]);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantityKg: '' }]);
  };

  const handleItemChange = (index, key, value) => {
    const updated = [...items];
    updated[index][key] = value;
    setItems(updated);
  };

  const handleSubmit = async () => {
    try {
      await createOrder(
        {
          title,
          writer: user.userName,
          items: items.map((item) => ({
            productId: parseInt(item.productId),
            quantityKg: parseFloat(item.quantityKg),
          })),
        },
        token
      );
      onClose();
    } catch {
      alert('발주 등록 실패');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>발주 등록</DialogTitle>
      <DialogContent>
        <TextField
          label="발주명"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="발주자"
          value={user.userName}
          fullWidth
          margin="normal"
          disabled
        />

        <Typography variant="subtitle1" sx={{ mt: 2 }}>📦 제품 구성</Typography>
        {items.map((item, index) => (
          <Grid container spacing={2} key={index} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <TextField
                select
                label="제품 선택"
                fullWidth
                value={item.productId}
                onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
              >
                {products.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="제조량 (kg)"
                type="number"
                fullWidth
                value={item.quantityKg}
                onChange={(e) => handleItemChange(index, 'quantityKg', e.target.value)}
              />
            </Grid>
          </Grid>
        ))}

        <Button sx={{ mt: 2 }} onClick={handleAddItem}>+ 제품 추가</Button>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSubmit} variant="contained">등록</Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderFormModal;

// client/src/pages/IngredientPage.js
import { useEffect, useState } from 'react';
import {
  Container, Typography, Button, Box, Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, Snackbar, Alert, IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  getAllIngredients, createIngredient, deleteIngredient, updateIngredient
} from '../services/ingredientService';
import { useAuth } from '../context/AuthContext';

const IngredientPage = () => {
  const { token } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', description: '' }); // id 포함
  const [editMode, setEditMode] = useState(false); // 수정 or 등록 모드
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = () => {
    getAllIngredients(token)
      .then(setIngredients)
      .catch(() => showSnackbar('원료 조회 실패', 'error'));
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const openCreateModal = () => {
    setForm({ id: null, name: '', description: '' });
    setEditMode(false);
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    setForm({ id: row.id, name: row.name, description: row.description });
    setEditMode(true);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await updateIngredient(form.id, { name: form.name, description: form.description }, token);
        showSnackbar('수정 완료!');
      } else {
        await createIngredient({ name: form.name, description: form.description }, token);
        showSnackbar('원료가 추가되었습니다.');
      }
      setModalOpen(false);
      fetchData();
    } catch {
      showSnackbar('저장 실패', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteIngredient(id, token);
      fetchData();
      showSnackbar('삭제되었습니다.');
    } catch {
      showSnackbar('삭제 실패', 'error');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: '원료명', flex: 1 },
    { field: 'description', headerName: '설명', flex: 2 },
    {
      field: 'actions',
      headerName: '관리',
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => openEditModal(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </>
      )
    }
  ];

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, mb: 2 }}>
        <Typography variant="h6">원료 목록</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateModal}>
          원료 추가
        </Button>
      </Box>

      <Box sx={{ height: 400 }}>
        <DataGrid
          rows={ingredients}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Box>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>{editMode ? '원료 수정' : '원료 추가'}</DialogTitle>
        <DialogContent>
          <TextField
            label="원료명"
            name="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="설명"
            name="description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>취소</Button>
          <Button onClick={handleSubmit} variant="contained">{editMode ? '수정' : '등록'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default IngredientPage;

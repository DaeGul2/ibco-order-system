import {
  Container, Typography, Button, Box, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Snackbar, Alert, IconButton, Paper
} from '@mui/material';
import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../context/AuthContext';
import {
  getAllWarehouses, createWarehouse, updateWarehouse,
  deleteWarehouse, updateWarehousePriorities
} from '../services/warehouseService';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const WarehousePage = () => {
  const { token } = useAuth();
  const [priorities, setPriorities] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ id: null, name: '', isFavorite: false });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [orderChanged, setOrderChanged] = useState(false);

  const fetchData = () => {
    getAllWarehouses(token).then(setPriorities);
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenCreate = () => {
    setForm({ id: null, name: '', isFavorite: false });
    setEditMode(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (row) => {
    setForm({
      id: row.Warehouse.id,
      name: row.Warehouse.name,
      isFavorite: row.Warehouse.isFavorite
    });
    setEditMode(true);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editMode) {
        await updateWarehouse(form.id, form, token);
        showSnackbar('창고 수정 완료');
      } else {
        await createWarehouse(form, token);
        showSnackbar('창고 생성 완료');
      }
      setModalOpen(false);
      fetchData();
    } catch {
      showSnackbar('저장 실패', 'error');
    }
  };

  const handleDelete = async (warehouseId) => {
    try {
      await deleteWarehouse(warehouseId, token);
      fetchData();
      showSnackbar('삭제 완료');
    } catch {
      showSnackbar('삭제 실패', 'error');
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(priorities);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setPriorities(reordered);
    setOrderChanged(true);
  };

  const savePriorityOrder = async () => {
    const orderedPriorityIds = priorities.map((p) => p.id);
    try {
      await updateWarehousePriorities(orderedPriorityIds, token);
      showSnackbar('우선순위가 저장되었습니다.');
      setOrderChanged(false);
      fetchData();
    } catch {
      showSnackbar('우선순위 저장 실패', 'error');
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, mb: 2 }}>
        <Typography variant="h6">창고 목록</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
          창고 추가
        </Button>
      </Box>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="warehouseList">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
            >
              {priorities.map((item, index) => (
                <Draggable key={item.id} draggableId={String(item.id)} index={index}>
                  {(provided) => (
                    <Paper
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        p: 2
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle1">{item.Warehouse?.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          우선순위: {item.priorityOrder}
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton color="primary" onClick={() => handleOpenEdit(item)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDelete(item.Warehouse?.id)}
                          disabled={!item.Warehouse?.id}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Paper>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>

      {orderChanged && (
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" color="warning" onClick={savePriorityOrder}>
            우선순위 저장
          </Button>
        </Box>
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? '창고 수정' : '창고 등록'}</DialogTitle>
        <DialogContent>
          <TextField
            label="창고명"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>취소</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editMode ? '수정' : '등록'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default WarehousePage;

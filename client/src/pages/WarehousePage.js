import {
    Container, Typography, Button, Box, Dialog, DialogTitle, DialogContent,
    DialogActions, TextField, Snackbar, Alert, IconButton
} from '@mui/material';
import { useState, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useAuth } from '../context/AuthContext';
import {
    getAllWarehouses, createWarehouse, updateWarehouse,
    deleteWarehouse, updateWarehousePriorities
} from '../services/warehouseService';
import { DataGrid } from '@mui/x-data-grid';

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

    const moveItem = (direction, index) => {
        const updated = [...priorities];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= updated.length) return;

        [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
        setPriorities(updated);
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

    const columns = [
        { field: 'id', headerName: 'ID', width: 120 },
        {
            field: 'name',
            headerName: '창고명',
            flex: 1,
            valueGetter: (params) => params?.Warehouse?.name || ''
        },
        {
            field: 'isFavorite',
            headerName: '즐겨찾기',
            type: 'boolean',
            width: 100,
            valueGetter: (params) => params?.row?.Warehouse?.isFavorite ?? false
        },
        {
            field: 'priorityOrder',
            headerName: '우선순위',
            width: 100,
            valueGetter: (params) => params?.row?.priorityOrder ?? null
        },
        {
            field: 'actions', headerName: '관리', width: 120,
            renderCell: (params) => (
                <>
                    <IconButton color="primary" onClick={() => handleOpenEdit(params.row)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(params.row.Warehouse.id)}>
                        <DeleteIcon />
                    </IconButton>
                </>
            )
        }
    ];

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, mb: 2 }}>
                <Typography variant="h6">창고 목록</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    창고 추가
                </Button>
            </Box>

            <Box sx={{ height: 450 }}>
                <DataGrid
                    rows={priorities}
                    columns={columns}
                    getRowId={(row) => row.id}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
                />
            </Box>

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
                        fullWidth margin="normal"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalOpen(false)}>취소</Button>
                    <Button variant="contained" onClick={handleSubmit}>
                        {editMode ? '수정' : '등록'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>
        </Container>
    );
};

export default WarehousePage;

import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, IconButton, Tooltip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import WarehouseIcon from '@mui/icons-material/Warehouse';

import { useAuth } from '../context/AuthContext';
import {
    getAllIngredientOrders,
    deleteIngredientOrder,
    applyIngredientOrder
} from '../services/ingredientOrderService';
import IngredientOrderFormModal from '../components/IngredientOrderFormModal';
import IngredientOrderDetailModal from '../components/IngredientOrderDetailModal';

const IngredientOrderPage = () => {
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [formOpen, setFormOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);

    const fetchOrders = async () => {
        const res = await getAllIngredientOrders(token);
        setOrders(res);
        console.log(res)
    };

    useEffect(() => {
        fetchOrders();
    }, [token]);

    const handleDelete = async (id) => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            await deleteIngredientOrder(id, token);
            fetchOrders();
        }
    };

    const handleApply = async (id) => {
        if (window.confirm('창고에 반영하시겠습니까?')) {
            await applyIngredientOrder(id, token);
            fetchOrders();
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'title', headerName: '발주명', flex: 1 },
        { field: 'writer', headerName: '작성자', width: 120 },
        {
            field: 'isApplied',
            headerName: '창고반영',
            width: 120,
            renderCell: (params) =>
                params.value
                    ? <span style={{ color: 'green' }}>✅ 완료</span>
                    : <span style={{ color: 'red' }}>❌ 미반영</span>
        },
        {
            field: 'actions',
            headerName: '작업',
            width: 180,
            renderCell: (params) => (
                <>
                    <Tooltip title="상세">
                        <IconButton onClick={() => {
                            setSelectedOrder(params.row);
                            setDetailOpen(true);
                        }}>
                            <VisibilityIcon />
                        </IconButton>
                    </Tooltip>
                    {!params.row.isApplied && (
                        <>
                            <Tooltip title="창고반영">
                                <IconButton onClick={() => handleApply(params.row.id)}>
                                    <WarehouseIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="삭제">
                                <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Tooltip>
                        </>
                    )}
                </>
            )
        }
    ];

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">원료 발주 목록</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    onClick={() => setFormOpen(true)}
                >
                    발주 등록
                </Button>
            </Box>

            <DataGrid
                autoHeight
                rows={orders}
                columns={columns}
                pageSize={10}
                disableRowSelectionOnClick
            />

            <IngredientOrderFormModal
                open={formOpen}
                onClose={() => setFormOpen(false)}
                onSuccess={fetchOrders}
            />

            {selectedOrder && (
                <IngredientOrderDetailModal
                    open={detailOpen}
                    onClose={() => {
                        setDetailOpen(false);
                        setSelectedOrder(null);
                    }}
                    order={selectedOrder}
                    onUpdated={fetchOrders}
                />
            )}
        </Box>
    );
};

export default IngredientOrderPage;

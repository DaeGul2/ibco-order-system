// client/src/pages/OrderPage.js
import { useEffect, useState } from 'react';
import {
  Container, Typography, Button, Box, IconButton, Snackbar, Alert
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';

import { useAuth } from '../context/AuthContext';
import {
  getAllOrders, getOrderById, deleteOrder
} from '../services/orderService';
import OrderFormModal from '../components/OrderFormModal';
import OrderDetailModal from '../components/OrderDetailModal';
import FeasibilityCheckModal from '../components/FeasibilityCheckModal';

const OrderPage = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [feasibilityOpen, setFeasibilityOpen] = useState(false);

  const fetchOrders = () => {
    getAllOrders(token).then(setOrders);
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDetail = async (id) => {
    try {
      const data = await getOrderById(id, token);
      setSelectedOrder(data);
      setDetailOpen(true);
    } catch {
      showSnackbar('상세 조회 실패', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteOrder(id, token);
      fetchOrders();
      showSnackbar('삭제 완료');
    } catch {
      showSnackbar('삭제 실패', 'error');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'title', headerName: '발주명', flex: 1 },
    { field: 'writer', headerName: '발주자', flex: 1 },
    {
      field: 'createdAt',
      headerName: '생성일',
      flex: 1,
      renderCell: (params) => {
        const raw = params.row?.createdAt;
        if (!raw) return '-';
        const date = new Date(raw);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        const hh = String(date.getHours()).padStart(2, '0');
        const mi = String(date.getMinutes()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
      }
    },
    {
      field: 'isApplied',
      headerName: '창고 적용여부',
      width: 140,
      renderCell: (params) => {
        const applied = params.value;
        return (
          <Box
            sx={{
              width: '70%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                px: 1,
                py: 0.01,
                borderRadius: '30px',
                backgroundColor: applied ? 'success.main' : 'error.main',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 500,
              }}
            >
              {applied ? '적용됨' : '미적용'}
            </Box>
          </Box>
        );
      }
    },
    ,
    {
      field: 'actions',
      headerName: '관리',
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleOpenDetail(params.row.id)}>
            <VisibilityIcon />
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
        <Typography variant="h6">발주 목록</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
          발주 등록
        </Button>

        <Button onClick={() => setFeasibilityOpen(true)}>발주 가능성 확인</Button>


      </Box>

      <Box sx={{ height: 400 }}>
        <DataGrid
          rows={orders}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Box>

      {/* 등록 모달 */}
      <OrderFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          fetchOrders(); // 새로고침
        }}
      />

      {/* 상세 모달 */}
      <OrderDetailModal
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        data={selectedOrder}
      />

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
      <FeasibilityCheckModal
        open={feasibilityOpen}
        onClose={() => setFeasibilityOpen(false)}
      />
    </Container>
  );
};

export default OrderPage;

// client/src/pages/OrderPage.js
import { useEffect, useMemo, useState } from 'react';
import {
  Container, Typography, Button, Box, IconButton, Snackbar, Alert, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

import { useAuth } from '../context/AuthContext';
import {
  getAllOrders, getOrderById, deleteOrder, applyOrder
} from '../services/orderService';
import { getAllWarehouses, getWarehouseIngredients } from '../services/warehouseService';

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

  // 미리보기(반영 전 재고 변화)
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState([]); // [{ingredientId, name, requiredKg, currentKg, afterKg}]
  const [previewWarehouse, setPreviewWarehouse] = useState(null); // { id, name }

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

  // ✅ 창고 반영
  const handleApply = async (id) => {
    if (!window.confirm('창고에 반영하시겠습니까?')) return;
    try {
      await applyOrder(id, token);
      fetchOrders();
      showSnackbar('창고 반영 완료');
    } catch (err) {
      const msg = err?.response?.data?.message || '창고 반영 실패';
      showSnackbar(msg, 'error');
    }
  };

  // ✅ 반영 전 “재고변화 미리보기”
  const handlePreview = async (row) => {
    try {
      // 1) 주문 상세(스냅샷) 로드
      const detail = await getOrderById(row.id, token);
      const snap = detail?.orderProductIngredients || [];

      // 제품 발주가 아니거나 스냅샷 없음
      if (!snap.length) {
        showSnackbar('스냅샷 정보가 없습니다.', 'error');
        return;
      }

      // 2) 우선순위 1 창고 찾기
      const priorities = await getAllWarehouses(token);
      const top = [...(priorities || [])].sort(
        (a, b) => (a.priorityOrder ?? 9999) - (b.priorityOrder ?? 9999)
      )[0];
      if (!top?.Warehouse?.id) {
        showSnackbar('우선순위 창고 정보를 찾을 수 없습니다.', 'error');
        return;
      }
      const wid = top.Warehouse.id;

      // 3) 해당 창고 보유 재고
      const stocks = await getWarehouseIngredients(wid, token); // [{ingredientId, stockKg}...]
      const stockMap = {};
      for (const s of stocks || []) {
        stockMap[s.ingredientId] = parseFloat(s.stockKg || 0);
      }

      // 4) 스냅샷 → 원료별 총 필요량 집계
      const needMap = {};
      // snap rows: { ingredientId, totalAmountKg, Ingredient?.name ... }
      snap.forEach((r) => {
        const ingId = r.ingredientId;
        const need = parseFloat(r.totalAmountKg || 0);
        if (!needMap[ingId]) {
          needMap[ingId] = { requiredKg: 0, name: r?.Ingredient?.name || `ID ${ingId}` };
        }
        needMap[ingId].requiredKg += need;
      });

      // 5) 미리보기 테이블 구성
      const rows = Object.entries(needMap).map(([ingIdStr, info]) => {
        const ingId = parseInt(ingIdStr, 10);
        const current = parseFloat(stockMap[ingId] || 0);
        const after = +(current - info.requiredKg).toFixed(4);
        return {
          ingredientId: ingId,
          name: info.name,
          requiredKg: +info.requiredKg.toFixed(4),
          currentKg: +current.toFixed(4),
          afterKg: after,
        };
      });

      setPreviewRows(rows);
      setPreviewWarehouse({ id: wid, name: top.Warehouse.name });
      setPreviewOpen(true);
    } catch (err) {
      console.error(err);
      showSnackbar('미리보기 로드 실패', 'error');
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
    {
      field: 'actions',
      headerName: '작업',
      width: 220,
      renderCell: (params) => (
        <>
          <Tooltip title="상세">
            <IconButton color="primary" onClick={() => handleOpenDetail(params.row.id)}>
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="삭제">
            <IconButton color="error" onClick={() => handleDelete(params.row.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
          {!params.row.isApplied && (
            <>
              <Tooltip title="재고변화 미리보기 (우선순위 1 창고)">
                <IconButton onClick={() => handlePreview(params.row)}>
                  <Inventory2OutlinedIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="창고반영">
                <IconButton onClick={() => handleApply(params.row.id)}>
                  <WarehouseIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </>
      )
    }
  ];

  return (
    <Container>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, mb: 2 }}>
        <Typography variant="h6">발주 목록</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            발주 등록
          </Button>
          <Button onClick={() => setFeasibilityOpen(true)}>발주 가능성 확인</Button>
        </Box>
      </Box>

      <Box sx={{ height: 460 }}>
        <DataGrid
          rows={orders}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10]}
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

      {/* 재고변화 미리보기 모달 */}
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          재고변화 미리보기 {previewWarehouse ? `- ${previewWarehouse.name}` : ''}
        </DialogTitle>
        <DialogContent dividers>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>원료명</TableCell>
                <TableCell align="right">필요량 (kg)</TableCell>
                <TableCell align="right">현재 재고 (kg)</TableCell>
                <TableCell align="right">적용 후 (kg)</TableCell>
                <TableCell align="center">상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {previewRows.map((r) => {
                const lack = r.afterKg < 0;
                return (
                  <TableRow key={r.ingredientId}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell align="right">{r.requiredKg.toLocaleString()}</TableCell>
                    <TableCell align="right">{r.currentKg.toLocaleString()}</TableCell>
                    <TableCell align="right" style={{ color: lack ? '#d32f2f' : 'inherit' }}>
                      {r.afterKg.toLocaleString()}
                    </TableCell>
                    <TableCell align="center">
                      {lack ? '부족' : '충분'}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

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

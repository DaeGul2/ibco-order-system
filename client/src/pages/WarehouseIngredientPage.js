import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAuth } from '../context/AuthContext';
import {
  getAllWarehouses,
  getWarehouseIngredients,
  bulkSetWarehouseIngredients
} from '../services/warehouseService';
import { getAllIngredients } from '../services/ingredientService';

const WarehouseIngredientPage = () => {
  const { token } = useAuth(); // ✅ 여기에 통합
  const [warehouses, setWarehouses] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [warehouseIngredientMap, setWarehouseIngredientMap] = useState({});
  const [editDialog, setEditDialog] = useState({ open: false, warehouseId: null, ingredientId: null });
  const [inputKg, setInputKg] = useState('');

  useEffect(() => {
    if (!token) return;
    fetchData();
  }, [token]);

  const fetchData = async () => {
    const ws = await getAllWarehouses(token);
    const ing = await getAllIngredients(token);
    const map = {};
    for (const w of ws) {
      const list = await getWarehouseIngredients(w.Warehouse.id, token);
      map[w.Warehouse.id] = {};
      for (const i of list) {
        map[w.Warehouse.id][i.ingredientId] = parseFloat(i.stockKg);
      }
    }
    setWarehouses(ws);
    setIngredients(ing);
    setWarehouseIngredientMap(map);
  };

  const openDialog = (warehouseId, ingredientId) => {
    setEditDialog({ open: true, warehouseId, ingredientId });
    const existing = warehouseIngredientMap[warehouseId]?.[ingredientId] || 0;
    setInputKg(existing.toString());
  };

  const handleSave = () => {
    const { warehouseId, ingredientId } = editDialog;
    const updated = { ...warehouseIngredientMap };
    if (!updated[warehouseId]) updated[warehouseId] = {};
    updated[warehouseId][ingredientId] = parseFloat(inputKg);
    setWarehouseIngredientMap(updated);
    setEditDialog({ open: false, warehouseId: null, ingredientId: null });
  };

  const handleFinalSave = async () => {
    const payload = [];
    for (const wid in warehouseIngredientMap) {
      for (const iid in warehouseIngredientMap[wid]) {
        payload.push({
          warehouseId: parseInt(wid),
          ingredientId: parseInt(iid),
          stockKg: warehouseIngredientMap[wid][iid]
        });
      }
    }
    await bulkSetWarehouseIngredients(payload, token);
    alert('저장 완료');
    fetchData();
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>창고 원료 관리</Typography>

      {/* 세로 스크롤 가능한 전체 박스 */}
      <Box sx={{ display: 'flex', gap: 2, height: '50vh', overflow: 'auto' }}>
        {/* 왼쪽 창고 목록 */}
        <Box sx={{ width: '30%', overflowY: 'auto' }}>
          {warehouses.map((w) => (
            <Accordion key={w.id}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>{w.Warehouse.name}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {(warehouseIngredientMap[w.Warehouse.id] &&
                  Object.entries(warehouseIngredientMap[w.Warehouse.id]).map(([iid, kg]) => {
                    const ing = ingredients.find(i => i.id === parseInt(iid));
                    return (
                      <Typography key={iid}>{ing?.name}: {kg}kg</Typography>
                    );
                  })) || <Typography color="text.secondary">보유 원료 없음</Typography>}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>

        {/* 오른쪽 원료 리스트 */}
        <Box sx={{ width: '70%', overflowY: 'auto' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1">전체 원료 목록</Typography>
            {ingredients.map((i) => (
              <Box
                key={i.id}
                sx={{ cursor: 'pointer', '&:hover': { background: '#f5f5f5' }, p: 1 }}
                onClick={() => openDialog(warehouses[0]?.Warehouse.id || 0, i.id)}
              >
                {i.name}
              </Box>
            ))}
          </Paper>
        </Box>
      </Box>

      {/* 아래 교차 테이블 */}
      <Box sx={{ mt: 4, maxHeight: '400px', overflow: 'auto' }}>
        <Typography variant="h6">창고별 원료 현황</Typography>
        <TableContainer component={Paper}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>원료명</TableCell>
                {warehouses.map(w => (
                  <TableCell key={w.id}>{w.Warehouse.name}</TableCell>
                ))}
                <TableCell>총합</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ingredients.map((i) => {
                let total = 0;
                return (
                  <TableRow key={i.id}>
                    <TableCell>{i.name}</TableCell>
                    {warehouses.map(w => {
                      const value = warehouseIngredientMap[w.Warehouse.id]?.[i.id] || 0;
                      total += value;
                      return (
                        <TableCell
                          key={w.id}
                          onClick={() => openDialog(w.Warehouse.id, i.id)}
                          sx={{ cursor: 'pointer', '&:hover': { background: '#f0f0f0' } }}
                        >
                          {value}
                        </TableCell>
                      );
                    })}
                    <TableCell>{total}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ textAlign: 'right', mt: 2 }}>
          <Button variant="contained" onClick={handleFinalSave}>저장</Button>
        </Box>
      </Box>

      {/* kg 입력 Dialog */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false })}>
        <DialogTitle>재고 입력</DialogTitle>
        <DialogContent>
          <TextField
            label="kg"
            fullWidth
            type="number"
            value={inputKg}
            onChange={(e) => setInputKg(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog({ open: false })}>취소</Button>
          <Button variant="contained" onClick={handleSave}>확인</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WarehouseIngredientPage;

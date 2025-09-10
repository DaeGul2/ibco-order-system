import * as XLSX from 'xlsx';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box, Typography, Accordion, AccordionSummary, AccordionDetails,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import {
  getAllWarehouses, getWarehouseIngredients, bulkSetWarehouseIngredients
} from '../services/warehouseService';
import { getAllIngredients } from '../services/ingredientService';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  TableContainer, Table, TableHead, TableRow,
  TableCell, TableBody, TableSortLabel
} from '@mui/material';


const WarehouseIngredientPage = () => {
  const { token } = useAuth();
  const [warehouses, setWarehouses] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [warehouseIngredientMap, setWarehouseIngredientMap] = useState({});
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const toggleAccordion = (wid) => {
    setSelectedWarehouseId((prev) => (prev === wid ? null : wid));
  };
  const [dropTarget, setDropTarget] = useState(null);
  const [inputDialog, setInputDialog] = useState({ open: false, warehouseId: null, ingredientId: null, mode: 'add' });
  const [inputKg, setInputKg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermTable, setSearchTermTable] = useState('');

  // 교차표 정렬 상태
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // 창고별(왼쪽) 정렬 상태: { [warehouseId]: { key: 'name' | 'kg', direction: 'asc' | 'desc' } }
  const [warehouseSortMap, setWarehouseSortMap] = useState({});

  const ingredientNameMap = useMemo(() => {
    const m = new Map();
    for (const ing of ingredients) m.set(ing.id, ing.name);
    return m;
  }, [ingredients]);

  const filteredIngredients = ingredients.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const filteredTableIngredients = ingredients.filter(i =>
    i.name.toLowerCase().includes(searchTermTable.toLowerCase())
  );

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
    setSelectedWarehouseId(ws[0]?.Warehouse.id || null);
  };

  const openDialog = (warehouseId, ingredientId, mode = 'edit') => {
    const existing = warehouseIngredientMap[warehouseId]?.[ingredientId] || 0;
    setInputKg(mode === 'edit' ? existing.toString() : '');
    setInputDialog({ open: true, warehouseId, ingredientId, mode });
  };

  const handleSaveInput = () => {
    const { warehouseId, ingredientId, mode } = inputDialog;
    const updated = { ...warehouseIngredientMap };
    if (!updated[warehouseId]) updated[warehouseId] = {};
    const prev = updated[warehouseId][ingredientId] || 0;
    updated[warehouseId][ingredientId] =
      mode === 'add' ? prev + parseFloat(inputKg || '0') : parseFloat(inputKg || '0');
    setWarehouseIngredientMap(updated);
    setInputDialog({ open: false, warehouseId: null, ingredientId: null, mode: 'edit' });
  };

  const handleDelete = (warehouseId, ingredientId) => {
    const updated = { ...warehouseIngredientMap };
    delete updated[warehouseId][ingredientId];
    setWarehouseIngredientMap(updated);
  };

  const handleFinalSave = async () => {
    const payload = [];
    for (const wid in warehouseIngredientMap) {
      for (const iid in warehouseIngredientMap[wid]) {
        payload.push({
          warehouseId: parseInt(wid, 10),
          ingredientId: parseInt(iid, 10),
          stockKg: warehouseIngredientMap[wid][iid],
        });
      }
    }
    await bulkSetWarehouseIngredients(payload, token);
    alert('저장 완료');
    fetchData();
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const draggedIngredientId = parseInt(result.draggableId, 10);
    const targetWarehouseId = parseInt(result.destination.droppableId, 10);
    openDialog(targetWarehouseId, draggedIngredientId, 'add');
    setDropTarget(null);
  };

  // ===== 교차표 정렬 =====
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const sortedIngredients = [...filteredTableIngredients].sort((a, b) => {
    if (!sortConfig.key) return 0;

    if (sortConfig.key === 'total') {
      const totalA = warehouses.reduce((sum, w) => sum + (warehouseIngredientMap[w.Warehouse.id]?.[a.id] || 0), 0);
      const totalB = warehouses.reduce((sum, w) => sum + (warehouseIngredientMap[w.Warehouse.id]?.[b.id] || 0), 0);
      return sortConfig.direction === 'asc' ? totalA - totalB : totalB - totalA;
    }

    if (sortConfig.key === 'name') {
      return sortConfig.direction === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    }

    // 창고별 정렬 (key = warehouseId)
    const kgA = warehouseIngredientMap[sortConfig.key]?.[a.id] || 0;
    const kgB = warehouseIngredientMap[sortConfig.key]?.[b.id] || 0;
    return sortConfig.direction === 'asc' ? kgA - kgB : kgB - kgA;
  });

  // ===== 창고 패널(왼쪽) 정렬 =====
  const handleWarehouseSort = (wid, key) => {
    setWarehouseSortMap(prev => {
      const current = prev[wid] || { key: 'name', direction: 'asc' };
      const nextDirection = current.key === key && current.direction === 'asc' ? 'desc' : 'asc';
      return { ...prev, [wid]: { key, direction: nextDirection } };
    });
  };

  const getSortedWarehouseEntries = (wid) => {
    const entries = Object.entries(warehouseIngredientMap[wid] || {}) // [[ingredientId, kg], ...]
      .map(([iid, kg]) => ({ iid: parseInt(iid, 10), name: ingredientNameMap.get(parseInt(iid, 10)) || '-', kg }));

    const sc = warehouseSortMap[wid] || { key: 'name', direction: 'asc' };

    entries.sort((a, b) => {
      if (sc.key === 'name') {
        return sc.direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      // 'kg'
      return sc.direction === 'asc' ? a.kg - b.kg : b.kg - a.kg;
    });
    return entries;
  };


  const exportWarehouseExcel = (wid) => {
    const warehouseName = warehouses.find((w) => w.Warehouse.id === wid)?.Warehouse?.name || `warehouse-${wid}`;
    const rows = getSortedWarehouseEntries(wid);
    // 워크시트 데이터: 헤더 포함
    const data = [
      ['연번', '원료명', '수량(kg)'],
      ...rows.map((r, idx) => [idx + 1, r.name, r.kg]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(data);
    // 열 너비 약간 보기 좋게
    ws['!cols'] = [{ wch: 6 }, { wch: 24 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '창고현황');
    const ts = new Date();
    const yyyy = ts.getFullYear();
    const mm = String(ts.getMonth() + 1).padStart(2, '0');
    const dd = String(ts.getDate()).padStart(2, '0');
    XLSX.writeFile(wb, `${warehouseName}_창고현황_${yyyy}${mm}${dd}.xlsx`);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>창고 원료 관리</Typography>

      <DragDropContext
        onDragEnd={onDragEnd}
        onDragUpdate={({ destination }) => {
          setDropTarget(destination?.droppableId || null);
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, height: '60vh', overflow: 'auto' }}>
          {/* 왼쪽 창고 목록 */}
          <Box sx={{ width: '30%', overflowY: 'auto' }}>
            {warehouses.map((w) => {
              const wid = w.Warehouse.id;
              const isTarget = dropTarget === wid.toString();
              const sortState = warehouseSortMap[wid] || { key: 'name', direction: 'asc' };
              const rows = getSortedWarehouseEntries(wid);

              return (
                <Accordion
                  key={w.id}
                  expanded={selectedWarehouseId === wid}
                  onChange={() => toggleAccordion(wid)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1, justifyContent: 'space-between' }}>
                      <Typography fontWeight={selectedWarehouseId === wid ? 'bold' : 'normal'}>
                        {w.Warehouse.name}
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={(e) => {
                          e.stopPropagation(); // 아코디언 토글 방지
                          exportWarehouseExcel(wid);
                        }}
                      >
                        창고 상황 엑셀 다운로드
                      </Button>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      backgroundColor: isTarget ? '#e3f2fd' : 'inherit',
                      transition: 'background-color 0.3s',
                      p: 0
                    }}
                  >
                    {/* Droppable: 재료 드래그 추가용 컨테이너 */}
                    <Droppable droppableId={wid.toString()}>
                      {(provided) => (
                        <Box ref={provided.innerRef} {...provided.droppableProps}>
                          <TableContainer component={Paper} variant="outlined" sx={{ boxShadow: 'none', borderRadius: 0 }}>
                            <Table size="small" stickyHeader>
                              <TableHead>
                                <TableRow>
                                  <TableCell sx={{ backgroundColor: '#f7f7f7', fontWeight: 700, width: 56 }}>연번</TableCell>
                                  <TableCell sx={{ backgroundColor: '#f7f7f7', fontWeight: 700 }}>
                                    <TableSortLabel
                                      active={sortState.key === 'name'}
                                      direction={sortState.direction}
                                      onClick={() => handleWarehouseSort(wid, 'name')}
                                    >
                                      원료명
                                    </TableSortLabel>
                                  </TableCell>
                                  <TableCell sx={{ backgroundColor: '#f7f7f7', fontWeight: 700, textAlign: 'right', width: 120 }}>
                                    <TableSortLabel
                                      active={sortState.key === 'kg'}
                                      direction={sortState.direction}
                                      onClick={() => handleWarehouseSort(wid, 'kg')}
                                    >
                                      수량(kg)
                                    </TableSortLabel>
                                  </TableCell>
                                  <TableCell sx={{ backgroundColor: '#f7f7f7', width: 44 }} />
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {rows.length === 0 && (
                                  <TableRow>
                                    <TableCell colSpan={4} sx={{ color: 'text.secondary' }}>
                                      보유 원료 없음 (오른쪽 목록에서 드래그하여 추가)
                                    </TableCell>
                                  </TableRow>
                                )}

                                {rows.map((row, idx) => (
                                  <TableRow hover key={row.iid}>
                                    <TableCell>{idx + 1}</TableCell>
                                    <TableCell
                                      sx={{ cursor: 'pointer' }}
                                      onClick={() => openDialog(wid, row.iid, 'edit')}
                                    >
                                      {row.name}
                                    </TableCell>
                                    <TableCell align="right" onClick={() => openDialog(wid, row.iid, 'edit')} sx={{ cursor: 'pointer' }}>
                                      {row.kg.toLocaleString()}kg
                                    </TableCell>
                                    <TableCell align="center">
                                      <IconButton size="small" onClick={() => handleDelete(wid, row.iid)}>
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                                {provided.placeholder /* dnd placeholder */}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                    </Droppable>
                  </AccordionDetails>
                </Accordion>
              );
            })}
          </Box>

          {/* 오른쪽 원료 리스트 (드래그 원본) */}
          <Box sx={{ width: '70%' }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle1" gutterBottom>전체 원료 목록</Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="원료명 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Droppable droppableId="ingredient-list" isDropDisabled>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{ maxHeight: '45vh', overflowY: 'auto' }}
                  >
                    {filteredIngredients.map((i, idx) => (
                      <Draggable key={i.id} draggableId={i.id.toString()} index={idx}>
                        {(provided, snapshot) => (
                          <Box
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            sx={{
                              userSelect: 'none',
                              p: 1,
                              mb: 1,
                              borderRadius: 1,
                              background: snapshot.isDragging ? '#bbdefb' : '#f5f5f5',
                              transition: 'all 0.2s ease',
                              borderBottom: '1px solid #ccc',
                              cursor: 'grab',
                            }}
                          >
                            {i.name}
                          </Box>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>
            </Paper>
          </Box>
        </Box>
      </DragDropContext>

      {/* 저장 버튼 */}
      <Box sx={{ textAlign: 'right', mt: 3 }}>
        <Button variant="contained" onClick={handleFinalSave}>저장</Button>
      </Box>

      {/* 수량 입력 Dialog */}
      <Dialog open={inputDialog.open} onClose={() => setInputDialog({ open: false })}>
        <DialogTitle>재고 {inputDialog.mode === 'add' ? '추가' : '수정'}</DialogTitle>
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
          <Button onClick={() => setInputDialog({ open: false })}>취소</Button>
          <Button variant="contained" onClick={handleSaveInput}>확인</Button>
        </DialogActions>
      </Dialog>

      {/* 교차표 */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h6" gutterBottom>원료 보유 현황 (교차표)</Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="교차표 원료명 검색"
          value={searchTermTable}
          onChange={(e) => setSearchTermTable(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>연번</TableCell>
                <TableCell sx={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                  <TableSortLabel
                    active={sortConfig.key === 'name'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('name')}
                  >
                    원료명
                  </TableSortLabel>
                </TableCell>
                {warehouses.map((w) => (
                  <TableCell
                    key={w.id}
                    sx={{ backgroundColor: '#f0f0f0', fontWeight: 'bold', textAlign: 'right' }}
                  >
                    <TableSortLabel
                      active={sortConfig.key === w.Warehouse.id}
                      direction={sortConfig.direction}
                      onClick={() => handleSort(w.Warehouse.id)}
                    >
                      {w.Warehouse.name}
                    </TableSortLabel>
                  </TableCell>
                ))}
                <TableCell sx={{ backgroundColor: '#e0f7fa', fontWeight: 'bold', textAlign: 'right' }}>
                  <TableSortLabel
                    active={sortConfig.key === 'total'}
                    direction={sortConfig.direction}
                    onClick={() => handleSort('total')}
                  >
                    총합
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedIngredients.map((ingredient, index) => {
                let rowTotal = 0;
                return (
                  <TableRow key={ingredient.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{ingredient.name}</TableCell>
                    {warehouses.map((w) => {
                      const kg = warehouseIngredientMap[w.Warehouse.id]?.[ingredient.id] || 0;
                      rowTotal += kg;
                      return (
                        <TableCell key={w.id} align="right">
                          {kg.toLocaleString()}kg
                        </TableCell>
                      );
                    })}
                    <TableCell align="right" sx={{ backgroundColor: '#e0f7fa' }}>
                      {rowTotal.toLocaleString()}kg
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* 창고별 총합 row */}
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#fafafa' }} colSpan={2}>창고별 총합</TableCell>
                {warehouses.map((w) => {
                  let colTotal = 0;
                  for (const iid in warehouseIngredientMap[w.Warehouse.id] || {}) {
                    colTotal += warehouseIngredientMap[w.Warehouse.id][iid];
                  }
                  return (
                    <TableCell key={w.id} align="right" sx={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                      {colTotal.toLocaleString()}kg
                    </TableCell>
                  );
                })}
                <TableCell /> {/* 빈 셀 */}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
};

export default WarehouseIngredientPage;

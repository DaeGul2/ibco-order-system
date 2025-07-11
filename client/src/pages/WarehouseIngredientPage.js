import React, { useEffect, useState } from 'react';
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

const WarehouseIngredientPage = () => {
    const { token } = useAuth();
    const [warehouses, setWarehouses] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [warehouseIngredientMap, setWarehouseIngredientMap] = useState({});
    const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
    const [dropTarget, setDropTarget] = useState(null);
    const [inputDialog, setInputDialog] = useState({ open: false, warehouseId: null, ingredientId: null, mode: 'add' });
    const [inputKg, setInputKg] = useState('');
    // 상단에 상태 추가
    const [searchTerm, setSearchTerm] = useState('');
    const filteredIngredients = ingredients.filter(i =>
        i.name.toLowerCase().includes(searchTerm.toLowerCase())
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
            mode === 'add' ? prev + parseFloat(inputKg) : parseFloat(inputKg);
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
                    warehouseId: parseInt(wid),
                    ingredientId: parseInt(iid),
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
        const draggedIngredientId = parseInt(result.draggableId);
        const targetWarehouseId = parseInt(result.destination.droppableId);
        openDialog(targetWarehouseId, draggedIngredientId, 'add');
        setDropTarget(null);
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
                            return (
                                <Accordion
                                    key={w.id}
                                    expanded={selectedWarehouseId === wid}
                                    onChange={() => setSelectedWarehouseId(wid)}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Typography fontWeight={selectedWarehouseId === wid ? 'bold' : 'normal'}>
                                            {w.Warehouse.name}
                                        </Typography>
                                    </AccordionSummary>
                                    <AccordionDetails
                                        sx={{
                                            backgroundColor: isTarget ? '#e3f2fd' : 'inherit',
                                            transition: 'background-color 0.3s',
                                        }}
                                    >
                                        <Droppable droppableId={wid.toString()}>
                                            {(provided) => (
                                                <Box
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    sx={{ minHeight: 40 }}
                                                >
                                                    {Object.keys(warehouseIngredientMap[wid] || {}).length === 0 && (
                                                        <Typography color="text.secondary" sx={{ px: 1, py: 0.5 }}>
                                                            보유 원료 없음
                                                        </Typography>
                                                    )}
                                                    {Object.entries(warehouseIngredientMap[wid] || {}).map(([iid, kg], idx) => {
                                                        const ing = ingredients.find(i => i.id === parseInt(iid));
                                                        return (
                                                            <Box key={iid} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 0.5 }}>
                                                                <Typography
                                                                    sx={{ cursor: 'pointer' }}
                                                                    onClick={() => openDialog(wid, parseInt(iid), 'edit')}
                                                                >
                                                                    {ing?.name}: {kg}kg
                                                                </Typography>
                                                                <IconButton size="small" onClick={() => handleDelete(wid, parseInt(iid))}>
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </Box>
                                                        );
                                                    })}
                                                    {provided.placeholder}
                                                </Box>
                                            )}
                                        </Droppable>
                                    </AccordionDetails>
                                </Accordion>
                            );
                        })}
                    </Box>

                    {/* 오른쪽 원료 리스트 */}
                    {/* 오른쪽 원료 리스트 */}
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

            {/* 저장 버튼 (고정 위치) */}
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
        </Box>
    );
};

export default WarehouseIngredientPage;

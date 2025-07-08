import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, Table, TableHead, TableRow, TableCell, TableBody, Box,
    IconButton, Collapse
} from '@mui/material';
import { useState, useEffect } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useAuth } from '../context/AuthContext';
import { getProductById } from '../services/productService';
import React from 'react';
import { exportOrderDetailToExcel } from '../utils/excelExport';

const OrderDetailModal = ({ open, onClose, data }) => {
    const { token } = useAuth();
    const [openRows, setOpenRows] = useState({});
    const [productIngredientsMap, setProductIngredientsMap] = useState({});

    useEffect(() => {
        if (data?.items && open) {
            const fetchAll = async () => {
                const map = {};
                for (const item of data.items) {
                    try {
                        const result = await getProductById(item.productId, token);
                        map[item.productId] = result.ingredients;
                    } catch (err) {
                        console.error(`제품 ${item.productId} 구성 조회 실패`, err);
                    }
                }
                setProductIngredientsMap(map);
            };
            fetchAll();
        }
    }, [data, open, token]);

    const toggleRow = (productId) => {
        setOpenRows(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }));
    };

    if (!data) return null;
    const { order, items, ingredientSummary } = data;

    let totalOrderCost = 0; // 발주 전체 비용 누적

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>발주 상세 정보</DialogTitle>
            <DialogContent>
                <Typography variant="h6" gutterBottom>📄 발주 정보</Typography>
                <Box sx={{ mb: 2 }}>
                    <Typography>제목: {order.title}</Typography>
                    <Typography>발주자: {order.writer}</Typography>
                    <Typography>생성일: {new Date(order.createdAt).toLocaleString()}</Typography>
                </Box>

                <Typography variant="h6" gutterBottom>📦 발주한 제품</Typography>
                <Table size="small" sx={{ mb: 3 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell />
                            <TableCell>제품명</TableCell>
                            <TableCell align="right">제조량 (kg)</TableCell>
                            <TableCell align="right">총 비용 (₩)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item, idx) => {
                            let productTotalCost = 0;
                            const ingredients = productIngredientsMap[item.productId] || [];
                            ingredients.forEach((pi) => {
                                const cost = pi.Ingredient?.cost ?? 0;
                                const amount = (pi.amount / 100) * item.quantityKg;
                                productTotalCost += amount * cost;
                            });
                            totalOrderCost += productTotalCost;

                            return (
                                <React.Fragment key={idx}>
                                    <TableRow>
                                        <TableCell>
                                            <IconButton size="small" onClick={() => toggleRow(item.productId)}>
                                                {openRows[item.productId] ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell>{item.Product?.name || `ID ${item.productId}`}</TableCell>
                                        <TableCell align="right">{item.quantityKg}</TableCell>
                                        <TableCell align="right">{Math.round(productTotalCost)}</TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                                            <Collapse in={openRows[item.productId]} timeout="auto" unmountOnExit>
                                                <Box sx={{ ml: 4, mb: 2 }}>
                                                    <Typography variant="subtitle2" sx={{ mt: 1 }}>원료 구성</Typography>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell>원료명</TableCell>
                                                                <TableCell align="right">1kg당 함량 (%)</TableCell>
                                                                <TableCell align="right">필요 수량 (kg)</TableCell>
                                                                <TableCell align="right">단가 (₩/kg)</TableCell>
                                                                <TableCell align="right">총 비용 (₩)</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {ingredients.map((pi, i) => {
                                                                const ingredient = pi.Ingredient;
                                                                const amount = (pi.amount / 100) * item.quantityKg;
                                                                const cost = ingredient?.cost ?? 0;
                                                                const totalCost = amount * cost;
                                                                return (
                                                                    <TableRow key={i}>
                                                                        <TableCell>{ingredient?.name || `ID ${pi.ingredientId}`}</TableCell>
                                                                        <TableCell align="right">{pi.amount}</TableCell>
                                                                        <TableCell align="right">{amount.toFixed(4)}</TableCell>
                                                                        <TableCell align="right">{cost}</TableCell>
                                                                        <TableCell align="right">{Math.round(totalCost)}</TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            );
                        })}
                        <TableRow>
                            <TableCell colSpan={3}><strong>💰 발주 전체 총 비용</strong></TableCell>
                            <TableCell align="right"><strong>{Math.round(totalOrderCost)}</strong></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>

                <Typography variant="h6" gutterBottom>🧪 원료 정량 지시 (전체 발주 건에 대한 각 원료 총합)</Typography>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>원료명</TableCell>
                            <TableCell align="right">총 소요량 (kg)</TableCell>
                            <TableCell align="right">단가 (₩/kg)</TableCell>
                            <TableCell align="right">총 비용 (₩)</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ingredientSummary.map((sum, idx) => {
                            const ingredient = sum.Ingredient;
                            const cost = ingredient?.cost ?? 0;
                            const totalCost = sum.totalAmountKg * cost;
                            return (
                                <TableRow key={idx}>
                                    <TableCell>{ingredient?.name || `ID ${sum.ingredientId}`}</TableCell>
                                    <TableCell align="right">{sum.totalAmountKg}</TableCell>
                                    <TableCell align="right">{cost}</TableCell>
                                    <TableCell align="right">{Math.round(totalCost)}</TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>닫기</Button>
                <Button
                    variant="outlined"
                    onClick={() => exportOrderDetailToExcel(data, productIngredientsMap)}
                >
                    엑셀 다운로드
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OrderDetailModal;
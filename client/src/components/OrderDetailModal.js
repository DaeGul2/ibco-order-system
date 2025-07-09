import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Table, TableHead, TableRow, TableCell, TableBody, Box,
  IconButton, Collapse
} from '@mui/material';
import { useState } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import React from 'react';
import { exportOrderDetailToExcel } from '../utils/excelExport';

const OrderDetailModal = ({ open, onClose, data }) => {
  const [openRows, setOpenRows] = useState({});

  if (!data) return null;
  const { order, items, ingredientSummary, orderProductIngredients = [] } = data;

  // 📌 productId별로 groupBy 처리
  const snapshotMap = {};
  orderProductIngredients.forEach(row => {
    if (!snapshotMap[row.productId]) snapshotMap[row.productId] = [];
    snapshotMap[row.productId].push(row);
  });

  const toggleRow = (productId) => {
    setOpenRows(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  // 전체 발주 총 비용 누적용
  let totalOrderCost = 0;

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
              const ingredients = snapshotMap[item.productId] || [];
              const productTotalCost = ingredients.reduce(
                (sum, pi) => sum + (pi.totalCost || 0), 0
              );
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
                    <TableCell align="right">{Math.round(productTotalCost).toLocaleString()}</TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell colSpan={4} sx={{ p: 0, border: 0 }}>
                      <Collapse in={openRows[item.productId]} timeout="auto" unmountOnExit>
                        <Box sx={{ ml: 4, mb: 2 }}>
                          <Typography variant="subtitle2" sx={{ mt: 1 }}>원료 구성 (발주 시점 스냅샷)</Typography>
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
                              {ingredients.map((pi, i) => (
                                <TableRow key={i}>
                                  <TableCell>{pi.Ingredient?.name || `ID ${pi.ingredientId}`}</TableCell>
                                  <TableCell align="right">{pi.amountPerKg}</TableCell>
                                  <TableCell align="right">{parseFloat(pi.totalAmountKg).toFixed(4)}</TableCell>
                                  <TableCell align="right">{pi.unitCost.toLocaleString()}</TableCell>
                                  <TableCell align="right">{Math.round(pi.totalCost).toLocaleString()}</TableCell>
                                </TableRow>
                              ))}
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
              <TableCell align="right"><strong>{Math.round(totalOrderCost).toLocaleString()}</strong></TableCell>
            </TableRow>
          </TableBody>
        </Table>

        <Typography variant="h6" gutterBottom>🧪 전체 발주 원료 총합</Typography>
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
            {ingredientSummary.map((sum, idx) => (
              <TableRow key={idx}>
                <TableCell>{sum.Ingredient?.name || `ID ${sum.ingredientId}`}</TableCell>
                <TableCell align="right">{parseFloat(sum.totalAmountKg).toFixed(4)}</TableCell>
                <TableCell align="right">{sum.unitCost?.toLocaleString() || 0}</TableCell>
                <TableCell align="right">{Math.round(sum.totalCost || 0).toLocaleString()}</TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={3}><strong>💰 전체 발주 원료 총 비용</strong></TableCell>
              <TableCell align="right">
                <strong>
                  {ingredientSummary.reduce((acc, sum) => acc + (sum.totalCost || 0), 0).toLocaleString()}
                </strong>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        <Button
          variant="outlined"
          onClick={() => exportOrderDetailToExcel(data)} // 엑셀 내보내기 로직 수정 필요 시 반영
        >
          엑셀 다운로드
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDetailModal;

import React, { useState, useEffect } from 'react';
import {
  Modal, Box, Typography, IconButton, Button, Table, TableHead, TableRow,
  TableCell, TableBody, Divider, TextField, MenuItem
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllProducts, checkFeasibilityForProduct } from '../services/productService';
import { useAuth } from '../context/AuthContext';

const style = {
  position: 'absolute', top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90%', maxHeight: '90vh', overflowY: 'auto',
  bgcolor: 'background.paper', borderRadius: 2, p: 4,
};

const FeasibilityCheckModal = ({ open, onClose }) => {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [inputList, setInputList] = useState([{ productId: '', quantityKg: '' }]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (open) {
      getAllProducts(token).then(setProducts);
      setInputList([{ productId: '', quantityKg: '' }]);
      setResults([]);
    }
  }, [open, token]);

  const handleChange = (index, field, value) => {
    const copy = [...inputList];
    copy[index][field] = value;
    setInputList(copy);
  };

  const addRow = () => {
    setInputList([...inputList, { productId: '', quantityKg: '' }]);
  };

  const deleteRow = (index) => {
    const copy = [...inputList];
    copy.splice(index, 1);
    setInputList(copy);
  };

  const mergeFeasibilityResults = (perProductResults) => {
    const mergedMap = {};
    for (const { results } of perProductResults) {
      for (const r of results) {
        const id = r.ingredientId;
        if (!mergedMap[id]) {
          mergedMap[id] = {
            ingredientId: id,
            ingredientName: r.ingredientName,
            requiredKg: 0,
            moveKg: 0,
            lackingKg: 0,
            case: 1,
          };
        }
        mergedMap[id].requiredKg += r.requiredKg || 0;
        if (r.case === 2) {
          mergedMap[id].moveKg += r.moveKg || 0;
          mergedMap[id].case = Math.max(mergedMap[id].case, 2);
        }
        if (r.case === 3) {
          mergedMap[id].lackingKg += r.lackingKg || 0;
          mergedMap[id].case = 3;
        }
      }
    }
    return Object.values(mergedMap);
  };

  const handleCheck = async () => {
    try {
      const valid = inputList.filter(p => p.productId && p.quantityKg);
      if (valid.length === 0) return alert('제품과 수량을 입력하세요.');

      const perProduct = await Promise.all(
        valid.map(p =>
          checkFeasibilityForProduct(p.productId, p.quantityKg, token)
        )
      );
      const merged = mergeFeasibilityResults(perProduct);
      setResults(merged);
    } catch (err) {
      console.error(err);
      alert('분석 실패');
    }
  };

  const groupByCase = (caseNum) => results.filter(r => r.case === caseNum);

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">📦 발주 가능성 분석</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        {inputList.map((item, idx) => (
          <Box key={idx} display="flex" gap={2} alignItems="center" mb={1}>
            <TextField
              select fullWidth size="small"
              label="제품 선택"
              value={item.productId}
              onChange={e => handleChange(idx, 'productId', e.target.value)}
            >
              {products.map(p => (
                <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>
              ))}
            </TextField>
            <TextField
              size="small" label="수량(kg)" type="number" fullWidth
              value={item.quantityKg}
              onChange={e => handleChange(idx, 'quantityKg', e.target.value)}
            />
            <IconButton onClick={() => deleteRow(idx)}><DeleteIcon /></IconButton>
          </Box>
        ))}

        <Button onClick={addRow}>+ 제품 추가</Button>

        <Divider sx={{ my: 2 }} />

        <Button variant="contained" onClick={handleCheck}>
          분석 시작
        </Button>

        {[1, 2, 3].map(caseNum => {
          const label = {
            1: '✅ 우선순위 1 창고만으로 충분한 원료',
            2: '⚠️ 창고 간 이동 필요한 원료',
            3: '❌ 발주가 필요한 원료'
          }[caseNum];

          const rows = groupByCase(caseNum);
          if (rows.length === 0) return null;

          return (
            <Box key={caseNum} sx={{ mt: 3 }}>
              <Typography variant="subtitle1">{label}</Typography>
              <Table size="small" sx={{ mt: 1 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>원료명</TableCell>
                    <TableCell>필요량(kg)</TableCell>
                    {caseNum === 2 && <TableCell>이동 필요량</TableCell>}
                    {caseNum === 3 && <TableCell>부족량</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map(row => (
                    <TableRow key={row.ingredientId}>
                      <TableCell>{row.ingredientName}</TableCell>
                      <TableCell>{row.requiredKg}</TableCell>
                      {caseNum === 2 && <TableCell>{row.moveKg}</TableCell>}
                      {caseNum === 3 && <TableCell>{row.lackingKg}</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          );
        })}
      </Box>
    </Modal>
  );
};

export default FeasibilityCheckModal;

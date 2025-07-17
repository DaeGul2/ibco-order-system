// client/src/pages/ProductPage.js
import { useEffect, useState } from 'react';
import {
    Container, Typography, Button, Box, Dialog, DialogTitle, DialogContent,
    TextField, DialogActions, Snackbar, Alert, IconButton, Grid, MenuItem,
    Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import UploadFileIcon from '@mui/icons-material/UploadFile';

import {
    getAllIngredients
} from '../services/ingredientService';
import {
    createProduct, getAllProducts, getProductById, updateProduct, deleteProduct
} from '../services/productService';
import { useAuth } from '../context/AuthContext';
import ProductDetailModal from '../components/ProductDetailModal';
import { parseProductExcel } from '../utils/productInsert';

const ProductPage = () => {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState({ id: null, name: '', ingredients: [] });
    const [editMode, setEditMode] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [excelModalOpen, setExcelModalOpen] = useState(false);
    const [excelFile, setExcelFile] = useState(null);
    const [excelData, setExcelData] = useState([]);

    const fetchData = () => {
        getAllProducts(token).then(setProducts);
        getAllIngredients(token).then(setIngredients);
    };

    useEffect(() => {
        fetchData();
    }, [token]);

    const showSnackbar = (message, severity = 'success') => {
        setSnackbar({ open: true, message, severity });
    };

    const openCreateModal = () => {
        setForm({ id: null, name: '', ingredients: [] });
        setEditMode(false);
        setModalOpen(true);
    };

    const handleRowClick = async (params) => {
        try {
            const data = await getProductById(params.id, token);
            setSelectedProduct(data);
            setDetailOpen(true);
        } catch {
            showSnackbar('상세 조회 실패', 'error');
        }
    };

    const openEditModal = async (productId) => {
        try {
            const data = await getProductById(productId, token);
            setForm({
                id: data.product.id,
                name: data.product.name,
                ingredients: data.ingredients.map(i => ({
                    ingredientId: i.ingredientId,
                    amount: i.amount
                }))
            });
            setEditMode(true);
            setModalOpen(true);
        } catch {
            showSnackbar('제품 로딩 실패', 'error');
        }
    };

    const handleAddIngredient = () => {
        setForm({
            ...form,
            ingredients: [...form.ingredients, { ingredientId: '', amount: '' }]
        });
    };

    const handleIngredientChange = (index, key, value) => {
        const updated = [...form.ingredients];
        updated[index][key] = value;
        setForm({ ...form, ingredients: updated });
    };

    const handleSubmit = async () => {
        const payload = {
            name: form.name,
            ingredients: form.ingredients.filter(i => i.ingredientId && i.amount)
        };

        try {
            if (editMode) {
                await updateProduct(form.id, payload, token);
                showSnackbar('제품 수정 완료');
            } else {
                await createProduct(payload, token);
                showSnackbar('제품 생성 완료');
            }
            setModalOpen(false);
            fetchData();
        } catch {
            showSnackbar('저장 실패', 'error');
        }
    };

    const handleDelete = async (id) => {
        try {
            await deleteProduct(id, token);
            fetchData();
            showSnackbar('삭제 완료');
        } catch {
            showSnackbar('삭제 실패', 'error');
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 80 },
        { field: 'name', headerName: '제품명', flex: 1 },
        {
            field: 'actions',
            headerName: '관리',
            width: 120,
            renderCell: (params) => (
                <>
                    <IconButton color="primary" onClick={() => openEditModal(params.row.id)}>
                        <EditIcon />
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
                <Typography variant="h6">제품 목록</Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<UploadFileIcon />}
                        onClick={() => setExcelModalOpen(true)}
                        sx={{ mr: 1 }}
                    >
                        Import
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateModal}>
                        제품 추가
                    </Button>
                </Box>
            </Box>

            <Box sx={{ height: 400 }}>
                <DataGrid
                    rows={products}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    disableSelectionOnClick
                    onRowClick={(params) => handleRowClick(params.row)}
                />
            </Box>

            <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editMode ? '제품 수정' : '제품 등록'}</DialogTitle>
                <DialogContent>
                    <TextField
                        label="제품명"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        fullWidth margin="normal"
                    />
                    <Typography variant="subtitle1" sx={{ mt: 2 }}>원료 구성</Typography>
                    {form.ingredients.map((item, index) => (
                        <Grid container spacing={1} key={index} sx={{ mt: 1 }}>
                            <Grid item xs={6}>
                                <TextField
                                    select
                                    label="원료"
                                    fullWidth
                                    value={item.ingredientId}
                                    onChange={(e) => handleIngredientChange(index, 'ingredientId', e.target.value)}
                                >
                                    {ingredients.map(ing => (
                                        <MenuItem key={ing.id} value={ing.id}>{ing.name}</MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="함량 (%)"
                                    type="number"
                                    fullWidth
                                    value={item.amount}
                                    onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    ))}
                    <Button sx={{ mt: 1 }} onClick={handleAddIngredient}>+ 원료 추가</Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModalOpen(false)}>취소</Button>
                    <Button onClick={handleSubmit} variant="contained">{editMode ? '수정' : '등록'}</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
            </Snackbar>

            <ProductDetailModal
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                data={selectedProduct}
            />

            {/* Excel Import Dialog */}
            <Dialog open={excelModalOpen} onClose={() => setExcelModalOpen(false)} maxWidth="md" fullWidth>
                <DialogTitle>엑셀 Import</DialogTitle>
                <DialogContent>
                    <Button component="label" variant="contained" sx={{ mb: 2 }}>
                        엑셀 파일 선택
                        <input
                            type="file"
                            accept=".xlsx, .xls"
                            hidden
                            onChange={(e) => setExcelFile(e.target.files[0])}
                        />
                    </Button>

                    {excelData.map((sheet, idx) => (
                        <Box key={idx} sx={{ mt: 3 }}>
                            <Typography variant="h6">📄 시트: {sheet.sheetName}</Typography>
                            {sheet.products.map((product, pIdx) => (
                                <Box key={pIdx} sx={{ mt: 2, ml: 2 }}>
                                    <Typography variant="subtitle1">📦 {product.name}</Typography>
                                    <Table size="small" sx={{ mt: 1 }}>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>원료명</TableCell>
                                                <TableCell>수정</TableCell>
                                                <TableCell align="right">함량 (%)</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {product.ingredients.map((ing, iIdx) => (
                                                <TableRow key={iIdx}>
                                                    <TableCell sx={{ color: ing.exists ? 'inherit' : 'red' }}>
                                                        {ing.originalName}
                                                    </TableCell>
                                                    <TableCell>
                                                        {ing.exists ? '✅' : (
                                                            <TextField
                                                                select
                                                                size="small"
                                                                value={ing.correctedName}
                                                                onChange={(e) => {
                                                                    const newData = [...excelData];
                                                                    newData[idx].products[pIdx].ingredients[iIdx].correctedName = e.target.value;
                                                                    newData[idx].products[pIdx].ingredients[iIdx].exists = true;
                                                                    setExcelData(newData);
                                                                }}
                                                            >
                                                                {ingredients.map(option => (
                                                                    <MenuItem key={option.id} value={option.name}>{option.name}</MenuItem>
                                                                ))}
                                                            </TextField>
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="right">{ing.amount}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Box>
                            ))}
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setExcelModalOpen(false)}>닫기</Button>
                    <Button
                        variant="contained"
                        onClick={async () => {
                            if (!excelFile) return;
                            const parsed = await parseProductExcel(excelFile, ingredients);
                            setExcelData(parsed);
                        }}
                    >
                        Import 실행
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        onClick={async () => {
                            try {
                                const nameToIdMap = {};
                                ingredients.forEach(i => nameToIdMap[i.name] = i.id);

                                for (const sheet of excelData) {
                                    for (const product of sheet.products) {
                                        const payload = {
                                            name: product.name,
                                            ingredients: product.ingredients.map(ing => ({
                                                ingredientId: nameToIdMap[ing.correctedName],
                                                amount: Number(ing.amount)
                                            }))
                                        };

                                        if (payload.ingredients.some(i => !i.ingredientId || !i.amount)) {
                                            showSnackbar(`⛔ ${product.name}: 원료ID 또는 함량 누락`, 'error');
                                            continue;
                                        }

                                        await createProduct(payload, token);
                                    }
                                }

                                showSnackbar('✅ 엑셀 제품 등록 완료');
                                setExcelModalOpen(false);
                                fetchData();
                            } catch (err) {
                                showSnackbar('❌ 등록 중 오류 발생', 'error');
                                console.error(err);
                            }
                        }}
                    >
                        DB 저장
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ProductPage;

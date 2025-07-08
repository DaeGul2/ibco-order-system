// client/src/pages/IngredientPage.js
import { useEffect, useState } from 'react';
import {
  Container, Typography, Button, Box, Dialog, DialogTitle, DialogContent,
  TextField, DialogActions, Snackbar, Alert, IconButton, Grid
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {
  getAllIngredients, createIngredient, deleteIngredient, updateIngredient
} from '../services/ingredientService';
import { useAuth } from '../context/AuthContext';

const IngredientPage = () => {
  const { token } = useAuth();
  const [ingredients, setIngredients] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    id: null,
    name: '',
    description: '',
    ewg: '',
    code: '',
    usage: '',
    cost: '',
    inciKorNames: [''],
    inciEngNames: [''],
  });
  const [editMode, setEditMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchData = () => {
    getAllIngredients(token)
      .then((data) => {
        console.log('✅ 받은 데이터:', data); // <- 여기서 실제 서버 응답 찍힘
        setIngredients(data);
      })
      .catch(() => showSnackbar('원료 조회 실패', 'error'));
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const openCreateModal = () => {
    setForm({
      id: null, name: '', description: '', ewg: '', code: '', usage: '', cost: '',
      inciKorNames: [''], inciEngNames: ['']
    });
    setEditMode(false);
    setModalOpen(true);
  };

  const openEditModal = (row) => {
    const kor = row.IngredientInciKors?.map(i => i.inciKorName) || [];
    const eng = row.IngredientInciEngs?.map(i => i.inciEngName) || [];

    setForm({
      id: row.id,
      name: row.name,
      description: row.description || '',
      ewg: row.ewg || '',
      code: row.code || '',
      usage: row.usage || '',
      cost: row.cost || '',
      inciKorNames: kor.length > 0 ? kor : [''],
      inciEngNames: eng.length > 0 ? eng : [''],
    });

    setEditMode(true);
    setModalOpen(true);
  };


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleInciChange = (type, index, value) => {
    const list = [...form[type]];
    list[index] = value;
    setForm({ ...form, [type]: list });
  };

  const handleAddInci = (type) => {
    setForm({ ...form, [type]: [...form[type], ''] });
  };

  const handleRemoveInci = (type, index) => {
    const list = [...form[type]];
    list.splice(index, 1);
    setForm({ ...form, [type]: list.length > 0 ? list : [''] });
  };

  const handleSubmit = async () => {
    try {
      const data = {
        name: form.name,
        description: form.description,
        ewg: parseInt(form.ewg),
        code: form.code,
        usage: form.usage,
        cost: parseInt(form.cost),
        inciKorNames: form.inciKorNames.filter(Boolean),
        inciEngNames: form.inciEngNames.filter(Boolean),
      };
      if (editMode) {
        await updateIngredient(form.id, data, token);
        showSnackbar('수정 완료!');
      } else {
        await createIngredient(data, token);
        showSnackbar('원료가 추가되었습니다.');
      }
      setModalOpen(false);
      fetchData();
    } catch {
      showSnackbar('저장 실패', 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteIngredient(id, token);
      fetchData();
      showSnackbar('삭제되었습니다.');
    } catch {
      showSnackbar('삭제 실패', 'error');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 40 },
    { field: 'name', headerName: '원료명', width: 200 },
    { field: 'description', headerName: '설명', flex: 2 },
    { field: 'ewg', headerName: 'EWG', width: 60 },
    { field: 'code', headerName: '코드', width: 70 },
    { field: 'usage', headerName: '사용처', width: 120 },
    { field: 'cost', headerName: '1kg 단가', width: 100 },
    {
      field: 'inciKor',
      headerName: 'INCI(한글)',
      flex: 2,
      renderCell: (params) => {
        const korList = params.row?.IngredientInciKors;
        return Array.isArray(korList)
          ? korList.map(i => i.inciKorName).join(', ')
          : '';
      }
    },
    {
      field: 'inciEng',
      headerName: 'INCI(영문)',
      flex: 2,
      renderCell: (params) => {
        const engList = params.row?.IngredientInciEngs;
        return Array.isArray(engList)
          ? engList.map(i => i.inciEngName).join(', ')
          : '';
      }
    },
    {
      field: 'actions',
      headerName: '관리',
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => openEditModal(params.row)}>
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
    <Container maxWidth={false} disableGutters>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, mb: 2, maxWidth: '1600px', mx: 'auto' }}>
        <Typography variant="h6">원료 목록</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateModal}>
          원료 추가
        </Button>
      </Box>

      <Box
        sx={{
          height: 600,
          maxWidth: '3000px',   // 폭 2배 확장
          mx: 'auto',            // 가운데 정렬
          overflowX: 'auto',
          backgroundColor: '#fff', // 보기 좋게
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <DataGrid
          rows={ingredients}
          columns={columns}
          pageSize={5}
          rowsPerPageOptions={[5]}
          disableSelectionOnClick
        />
      </Box>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editMode ? '원료 수정' : '원료 추가'}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {/* 기본 정보 Layer */}
          <Typography variant="h6" gutterBottom>기본 정보</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField label="원료명" name="name" value={form.name} onChange={handleChange} fullWidth required />
            </Grid>
            <Grid item xs={6}>
              <TextField label="설명" name="description" value={form.description} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={4}>
              <TextField label="EWG 등급" name="ewg" type="number" value={form.ewg} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={4}>
              <TextField label="코드" name="code" value={form.code} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={4}>
              <TextField label="사용처" name="usage" value={form.usage} onChange={handleChange} fullWidth />
            </Grid>
            <Grid item xs={4}>
              <TextField label="1kg 단가" name="cost" type="number" value={form.cost} onChange={handleChange} fullWidth />
            </Grid>
          </Grid>

          {/* INCI (한글) Layer */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>INCI 명 (국문)</Typography>
          <Grid container spacing={2}>
            {form.inciKorNames.map((val, idx) => (
              <Grid item xs={12} key={idx} sx={{ display: 'flex', gap: 1 }}>
                <TextField fullWidth value={val} onChange={(e) => handleInciChange('inciKorNames', idx, e.target.value)} />
                <Button onClick={() => handleRemoveInci('inciKorNames', idx)}>-</Button>
                {idx === form.inciKorNames.length - 1 && <Button onClick={() => handleAddInci('inciKorNames')}>+</Button>}
              </Grid>
            ))}
          </Grid>

          {/* INCI (영문) Layer */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>INCI 명 (영문)</Typography>
          <Grid container spacing={2}>
            {form.inciEngNames.map((val, idx) => (
              <Grid item xs={12} key={idx} sx={{ display: 'flex', gap: 1 }}>
                <TextField fullWidth value={val} onChange={(e) => handleInciChange('inciEngNames', idx, e.target.value)} />
                <Button onClick={() => handleRemoveInci('inciEngNames', idx)}>-</Button>
                {idx === form.inciEngNames.length - 1 && <Button onClick={() => handleAddInci('inciEngNames')}>+</Button>}
              </Grid>
            ))}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>취소</Button>
          <Button onClick={handleSubmit} variant="contained">{editMode ? '수정' : '등록'}</Button>
        </DialogActions>
      </Dialog>


      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
};

export default IngredientPage;

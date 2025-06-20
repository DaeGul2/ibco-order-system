import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container, TextField, Button, Typography, Box,
  Snackbar, Alert
} from '@mui/material';

const RegisterPage = () => {
  const [form, setForm] = useState({ userId: '', password: '', userName: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { handleRegister } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleRegister(form);
      setSuccess('회원가입 성공!');
      navigate('/');
    } catch {
      setError('회원가입 실패: 아이디 중복 또는 서버 오류');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 8 }}>
        <Typography variant="h5" gutterBottom>회원가입</Typography>
        <TextField
          name="userId" label="아이디" value={form.userId} onChange={onChange}
          fullWidth margin="normal" required
        />
        <TextField
          name="password" label="비밀번호" type="password"
          value={form.password} onChange={onChange}
          fullWidth margin="normal" required
        />
        <TextField
          name="userName" label="이름" value={form.userName} onChange={onChange}
          fullWidth margin="normal" required
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          회원가입
        </Button>
      </Box>

      <Snackbar open={!!error} autoHideDuration={3000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)}>
        <Alert severity="success" onClose={() => setSuccess(null)}>{success}</Alert>
      </Snackbar>
    </Container>
  );
};

export default RegisterPage;

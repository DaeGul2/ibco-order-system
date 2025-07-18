import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, TextField, Button, Typography, Box,
  Snackbar, Alert
} from '@mui/material';

const LoginPage = () => {
  const [form, setForm] = useState({ userId: '', password: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleLogin(form);
      setSuccess('로그인 성공!');
      navigate('/');
    } catch {
      setError('로그인 실패: 아이디 또는 비밀번호를 확인하세요.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box component="form" onSubmit={onSubmit} sx={{ mt: 8 }}>
        <Typography variant="h5" gutterBottom>로그인</Typography>
        <TextField
          name="userId" label="아이디" value={form.userId} onChange={onChange}
          fullWidth margin="normal" required
        />
        <TextField
          name="password" label="비밀번호" type="password"
          value={form.password} onChange={onChange}
          fullWidth margin="normal" required
        />
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
          로그인
        </Button>

        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          아직 계정이 없으신가요? <Link to="/register">회원가입하러 가기</Link>
        </Typography>
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

export default LoginPage;

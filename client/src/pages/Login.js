import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Link, Alert } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f2f5' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={700} color="primary">TaskPlanet</Typography>
          <Typography variant="body2" color="text.secondary">Social Feed</Typography>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Email" type="email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            margin="normal" required size="small" />
          <TextField fullWidth label="Password" type="password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            margin="normal" required size="small" />
          <Button fullWidth variant="contained" type="submit" disabled={loading}
            sx={{ mt: 2, py: 1.2, borderRadius: 2, fontWeight: 600 }}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
          Don't have an account?{' '}
          <Link component={RouterLink} to="/signup" fontWeight={600}>Sign up</Link>
        </Typography>
      </Paper>
    </Box>
  );
}

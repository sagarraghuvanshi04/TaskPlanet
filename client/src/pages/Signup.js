import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Link, Alert } from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/signup', form);
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f2f5' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 420, borderRadius: 3 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight={700} color="primary">TaskPlanet</Typography>
          <Typography variant="body2" color="text.secondary">Create your account</Typography>
        </Box>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField fullWidth label="Username" value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
            margin="normal" required size="small" />
          <TextField fullWidth label="Email" type="email" value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            margin="normal" required size="small" />
          <TextField fullWidth label="Password" type="password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            margin="normal" required size="small" inputProps={{ minLength: 6 }} />
          <Button fullWidth variant="contained" type="submit" disabled={loading}
            sx={{ mt: 2, py: 1.2, borderRadius: 2, fontWeight: 600 }}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </form>
        <Typography variant="body2" textAlign="center" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" fontWeight={600}>Login</Link>
        </Typography>
      </Paper>
    </Box>
  );
}

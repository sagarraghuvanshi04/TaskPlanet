import { AppBar, Toolbar, Typography, Button, Avatar, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="sticky" elevation={1} sx={{ bgcolor: '#fff', color: 'text.primary' }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h6" fontWeight={700} color="primary" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          TaskPlanet
        </Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32, fontSize: 14 }}>
              {user.username?.[0]?.toUpperCase()}
            </Avatar>
            <Typography variant="body2" fontWeight={600}>{user.username}</Typography>
            <Button size="small" variant="outlined" onClick={handleLogout} sx={{ borderRadius: 2 }}>
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}

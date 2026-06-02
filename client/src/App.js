import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Signup from './pages/Signup';

const theme = createTheme({
  palette: {
    primary: { main: '#4f46e5' },
    secondary: { main: '#7c3aed' },
    background: { default: '#f0f2f5' },
  },
  typography: { fontFamily: '"Inter", "Roboto", sans-serif' },
  components: {
    MuiButton: { styleOverrides: { root: { textTransform: 'none' } } },
  },
});

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/" element={
        <PrivateRoute>
          <>
            <Navbar />
            <Feed />
          </>
        </PrivateRoute>
      } />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

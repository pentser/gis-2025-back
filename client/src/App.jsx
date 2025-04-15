import React from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate,
  createRoutesFromElements
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import Layout from './components/layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import MapView from './components/Map/MapView';
import VisitList from './components/Visits/VisitList';
import VisitForm from './components/Visits/VisitForm';
import ElderlyList from './components/Elderly/ElderlyList';
import ElderlyForm from './components/Elderly/ElderlyForm';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Profile from './components/Profile/Profile';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/Auth/PrivateRoute';

// יצירת ערכת נושא מותאמת
const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#1A365D',
    },
    secondary: {
      main: '#4A90E2',
    },
    success: {
      main: '#34C759',
    },
    error: {
      main: '#FF3B30',
    },
    warning: {
      main: '#FFCC00',
    },
  },
  typography: {
    fontFamily: 'Assistant, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
  },
});

// הגדרת תמיכה ב-RTL
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

const App = () => {
  return (
    <CacheProvider value={cacheRtl}>
      <ThemeProvider theme={theme}>
        <BrowserRouter future={{ v7_relativeSplatPath: true }}>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="map" element={<MapView />} />
                <Route path="visits" element={<VisitList />} />
                <Route path="visits/new" element={<VisitForm />} />
                <Route path="visits/:id" element={<VisitForm />} />
                <Route path="elderly" element={<ElderlyList />} />
                <Route path="elderly/new" element={<ElderlyForm />} />
                <Route path="elderly/:id" element={<ElderlyForm />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default App; 
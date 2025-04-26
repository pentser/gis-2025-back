import React from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
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
import LandingPage from './components/Landing/LandingPage';
import ContactForm from './components/Contact/ContactForm';
import ErrorBoundary from './components/ErrorBoundary';
import { useAuth } from './context/AuthContext';
import VolunteerVisits from './components/volunteer/VolunteerVisits';
import PrivateRoute from './components/Auth/PrivateRoute';
import ElderlyPage from './pages/ElderlyPage';

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
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          direction: 'rtl',
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
        <ErrorBoundary>
          <BrowserRouter>
            <Routes>
              {/* נתיבים ציבוריים */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<LandingPage />} />
              <Route path="/contact" element={<ContactForm />} />

              {/* נתיבים מוגנים */}
              <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Navigate to="map" replace />} />
                <Route path="map" element={<MapView />} />
                <Route path="myvisits" element={<VolunteerVisits />} />
                <Route path="profile" element={<Profile />} />
                <Route path="visits" element={<VisitList />} />
                <Route path="visits/new" element={<VisitForm />} />
                <Route path="visits/edit/:id" element={<VisitForm />} />
                <Route path="elderly" element={<ElderlyList />} />
                <Route path="elderly/new" element={<ElderlyForm />} />
                <Route path="elderly/edit/:id" element={<ElderlyForm />} />
                <Route path="elderly/:id" element={<ElderlyPage />} />
                <Route path="dashboard" element={<Dashboard />} />
              </Route>

              {/* ניתוב ברירת מחדל */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ErrorBoundary>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default App; 
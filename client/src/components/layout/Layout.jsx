import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  AppBar, 
  Box, 
  CssBaseline, 
  Drawer, 
  IconButton, 
  Toolbar, 
  Typography, 
  Button,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import MapIcon from '@mui/icons-material/Map';
import PersonIcon from '@mui/icons-material/Person';
import HistoryIcon from '@mui/icons-material/History';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import FavoriteIcon from '@mui/icons-material/Favorite';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';
import { useAuth } from '../../context/AuthContext';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import GroupIcon from '@mui/icons-material/Group';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user?.role === 'volunteer') {
      switch (location.pathname) {
        case '/app/map':
          setSelectedTab(0);
          break;
        case '/app/myvisits':
          setSelectedTab(1);
          break;
        case '/app/profile':
          setSelectedTab(2);
          break;
        default:
          setSelectedTab(0);
      }
    }
  }, [location.pathname, user]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (location.pathname.includes('/admin') && user.role !== 'admin') {
    return <Navigate to="/app/map" />;
  }

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    switch(newValue) {
      case 0:
        navigate('/app/map');
        break;
      case 1:
        navigate('/app/myvisits');
        break;
      case 2:
        navigate('/app/profile');
        break;
    }
  };

  const handleLocationClick = () => {
    window.dispatchEvent(new CustomEvent('toggleLocation'));
  };

  return (
    <Box className={styles.root}>
      <CssBaseline />
      <AppBar position="fixed" className={styles.appBar}>
        <Toolbar sx={{ padding: '0 16px' }}>
          {/* Right Section - User Info and Logout */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2,
            minWidth: 'fit-content'
          }}>
            {user && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
              }}>
                <Typography variant="body1" sx={{ whiteSpace: 'nowrap' }}>
                  שלום, {user.firstName}
                </Typography>
                <Button 
                  color="inherit" 
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  התנתק
                </Button>
              </Box>
            )}
          </Box>

          {/* Center Section - Navigation Tabs */}
          {user && user.role === 'volunteer' && (
            <Box sx={{ 
              flexGrow: 1, 
              display: 'flex', 
              justifyContent: 'center'
            }}>
              <Tabs 
                value={selectedTab}
                onChange={handleTabChange}
                textColor="inherit"
                indicatorColor="secondary"
                sx={{ 
                  '& .MuiTab-root': { 
                    minWidth: 'auto',
                    padding: '6px 16px',
                    fontSize: '0.95rem'
                  }
                }}
              >
                <Tab 
                  icon={<MapIcon sx={{ fontSize: '1.2rem' }} />} 
                  iconPosition="start" 
                  label="מפה" 
                />
                <Tab 
                  icon={<HistoryIcon sx={{ fontSize: '1.2rem' }} />} 
                  iconPosition="start" 
                  label="ניהול ביקורים" 
                />
                <Tab 
                  icon={<PersonIcon sx={{ fontSize: '1.2rem' }} />} 
                  iconPosition="start" 
                  label="הפרופיל שלי" 
                />
              </Tabs>
            </Box>
          )}

          {/* Left Section - Location Button */}
          {user && (
            <Box sx={{ 
              minWidth: 'fit-content',
              marginLeft: 2
            }}>
              <Button
                color="inherit"
                startIcon={<MyLocationIcon />}
                onClick={handleLocationClick}
                sx={{ 
                  whiteSpace: 'nowrap',
                  fontSize: '0.9rem'
                }}
              >
                השתמש במיקום נוכחי
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Box component="nav" className={styles.drawer}>
        <Drawer
          variant="temporary"
          anchor="right"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          classes={{
            paper: styles.drawerPaper
          }}
          className={styles.mobileDrawer}
          ModalProps={{
            keepMounted: true
          }}
        >
          <Sidebar onClose={handleDrawerToggle} />
        </Drawer>
      </Box>

      <Box component="main" className={styles.content}>
        <div className={styles.toolbar} />
        <Outlet />
      </Box>
    </Box>
  );
} 
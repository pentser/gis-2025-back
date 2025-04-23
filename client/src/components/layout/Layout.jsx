import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Box, CssBaseline, Drawer, IconButton, Toolbar, Typography, Button } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';
import { useAuth } from '../../context/AuthContext';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <Box className={styles.root}>
      <CssBaseline />
      <AppBar position="fixed" className={styles.appBar}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="פתח תפריט"
            edge="start"
            onClick={handleDrawerToggle}
            className={styles.menuButton}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ flexGrow: 1 }}>
            מערכת ניטור קשישים
          </Typography>
          <Button 
            color="inherit" 
            onClick={handleHomeClick}
            startIcon={<HomeIcon />}
            sx={{ mr: 2 }}
          >
            חזרה לדף הבית
          </Button>
          {user && isDashboard && (
            <Button 
              color="inherit" 
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
            >
              התנתק
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Box component="nav" className={styles.drawer}>
        {/* תפריט למובייל */}
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
            keepMounted: true // טוב יותר לביצועים במובייל
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
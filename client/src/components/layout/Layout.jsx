import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AppBar, Box, CssBaseline, Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './Sidebar';
import styles from './Layout.module.css';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
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
          <Typography variant="h6" noWrap>
            מערכת ניטור קשישים
          </Typography>
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
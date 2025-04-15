import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="fixed" className={styles.navbar}>
      <Toolbar>
        {user && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="תפריט"
            onClick={onMenuClick}
            className={styles.menuButton}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Typography variant="h6" className={styles.title}>
          <Link to="/" className={styles.logoLink}>
            מערכת GIS לניטור ביקורים
          </Link>
        </Typography>

        <div className={styles.navLinks}>
          {user ? (
            <>
              <Button color="inherit" component={Link} to="/map">
                מפה
              </Button>
              <Button color="inherit" component={Link} to="/visits">
                ביקורים
              </Button>
              {user.role === 'admin' && (
                <Button color="inherit" component={Link} to="/dashboard">
                  לוח בקרה
                </Button>
              )}
              <Button color="inherit" onClick={handleLogout}>
                התנתק
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                התחברות
              </Button>
              <Button color="inherit" component={Link} to="/register">
                הרשמה
              </Button>
            </>
          )}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FavoriteIcon from '@mui/icons-material/Favorite';
import styles from './Header.module.css';

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" className={styles.header}>
      <Toolbar>
        {/* צד שמאל - כפתור התנתקות */}
        <Button color="inherit" onClick={handleLogout}>
          התנתק
        </Button>

        {/* מרכז - שם המשתמש */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
          שלום, {user?.firstName}
        </Typography>

        {/* צד ימין - אייקון לב עם קישור לקשישים */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton 
            color="inherit" 
            onClick={() => navigate('/app/elderly')}
            sx={{ 
              marginRight: '8px',
              '&:hover': {
                color: '#ff4081' // צבע ורוד בהובר
              }
            }}
          >
            <FavoriteIcon />
            <Typography variant="body2" sx={{ marginRight: '4px' }}>
              קשישים
            </Typography>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 
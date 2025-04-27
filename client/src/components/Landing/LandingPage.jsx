import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LoginIcon from '@mui/icons-material/Login';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'לב לקשיש ❤️';
  }, []);

  return (
    <div className={styles.container}>
      <AppBar position="static" className={styles.header}>
        <Toolbar>
          <Box className={styles.logoContainer}>
            <Typography variant="h6" component="div" className={styles.logoText}>
              לב לקשיש
            </Typography>
            <FavoriteIcon className={styles.heartIcon} />
          </Box>
          
          <Box sx={{ flexGrow: 1 }} className={styles.navButtons}>
            <Button 
              color="inherit" 
              onClick={() => navigate('/register')}
              className={styles.navButton}
            >
              הרשמה כמתנדב
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/login?role=volunteer')}
              className={styles.navButton}
            >
             התחבר כמתנדב
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/login?role=admin')}
              className={styles.navButton}
            >
              התחבר כמנהל
            </Button>
            <Button 
              color="inherit" 
              onClick={() => navigate('/about')}
              className={styles.navButton}
            >
              אודות
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <div className={styles.undermaintytle}>
        <div className={styles.mainContent}>
          <h4 className={styles.sectionTitle}>מגפת הבדידות בקרב קשישים</h4>
          <p className={styles.paragraph}>
            בישראל מעל 1.1 מיליון מבוגרים בני 65 ומעלה; כ־30% מהם בודדים, עריריים וללא קרובי משפחה. מאות אלפי קשישים סובלים מבדידות קשה, ומאות מהם נפטרים בביתם מבלי שאיש ידע על כך בזמן אמת.
          </p>
          <p className={styles.paragraph}>
            עמותת לב לקשיש הוקמה בשנת 2021 במטרה לתמוך בקשישים בודדים ולחבר בין מתנדבים חמים לקשישים עריריים, במטרה לתת להם תחושת משמעות ואכפתיות.
          </p>
        </div>

        <div className={styles.features}>
          <h4>בואו להתנדב עם הלב!❤️</h4>
          <div className={styles.contactInfo}>
            <h4>ליצירת קשר:</h4>
            <p>עמותת לב לקשיש</p>
            <p>רח׳ הדולב 2, רמת גן</p>
            <p>טלפון: 03-7538971</p>
            <p>מייל: valenteer@levlkashis.co.il</p>
          </div>
          <button onClick={() => navigate('/contact')} className={styles.contactButton}>
            צרו קשר
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 
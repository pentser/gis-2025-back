import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LoginIcon from '@mui/icons-material/Login';

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'לב לקשיש ❤️';
  }, []);

  return (
    <div className={styles.container}>
      <h1>לב לקשיש ❤️</h1>
      <div className={styles.undermaintytle}>
        <div className={styles.content}>
          <h4 className={styles.sectionTitle}>מגפת הבדידות בקרב קשישים</h4>
          <p className={styles.paragraph}>
            בישראל מעל 1.1 מיליון מבוגרים בני 65 ומעלה; כ־30% מהם בודדים, עריריים וללא קרובי משפחה.
            מאות אלפי קשישים סובלים מבדידות קשה, ומאות מהם נפטרים בביתם מבלי שאיש ידע על כך בזמן אמת 
            
            עמותת לב לקשיש הוקמה בשנת 2021 במטרה לתמוך בקשישים בודדים
            ולחבר בין מתנדבים חמים לקשישים עריריים, במטרה לתת להם תחושת משמעות ואכפתיות.
          </p>
        </div>

        <div className={styles.optionsContainer}>
          <div className={styles.optionCard}>
            <div className={styles.iconContainer}>
              <VolunteerActivismIcon className={styles.icon} />
            </div>
            <h4>מתנדב חדש?</h4>
            <p>הצטרפו למערכת כמתנדבים ותוכלו לראות את הקשישים באזור שלכם, לתאם ביקורים ולעקוב אחר הפעילות שלכם.</p>
            <button 
              onClick={() => navigate('/register')} 
              className={styles.actionButton}
            >
              הרשמה כמתנדב
            </button>
          </div>

          <div className={styles.optionCard}>
            <div className={styles.iconContainer}>
              <AdminPanelSettingsIcon className={styles.icon} />
            </div>
            <h4>מנהל מערכת?</h4>
            <p>התחברו למערכת כמנהלים כדי לנהל את המתנדבים והקשישים, לעקוב אחר הביקורים ולנהל את המערכת.</p>
            <button 
              onClick={() => navigate('/login?role=admin')} 
              className={styles.actionButton}
            >
              התחברות כמנהל
            </button>
          </div>

          <div className={styles.optionCard}>
            <div className={styles.iconContainer}>
              <LoginIcon className={styles.icon} />
            </div>
            <h4>מתנדב רשום?</h4>
            <p>התחברו למערכת כדי לצפות במפת הקשישים באזור שלכם, לתאם ביקורים ולעדכן את המערכת.</p>
            <button 
              onClick={() => navigate('/login?role=volunteer')} 
              className={styles.actionButton}
            >
              התחברות כמתנדב
            </button>
          </div>
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
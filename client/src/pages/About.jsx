import React from 'react';
import { Container, Typography, Paper, Box, Grid, Divider } from '@mui/material';
import CodeIcon from '@mui/icons-material/Code';
import StorageIcon from '@mui/icons-material/Storage';
import MapIcon from '@mui/icons-material/Map';

const About = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom sx={{ mb: 4, fontWeight: 'bold' }}>
        אודות הפרויקט
      </Typography>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
          צוות הפיתוח
        </Typography>

        <Grid container spacing={4}>
          {/* Front-End Developer */}
          <Grid item xs={12} md={4}>
            <Box sx={{
              p: 3,
              height: '100%',
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-5px)',
                transition: 'all 0.3s ease'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CodeIcon sx={{ fontSize: 40, color: '#1976d2', mr: 2 }} />
                <Typography variant="h6" component="h3">
                  חבר צוות 1 (Front-End)
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li">פיתוח ממשק ניהול פרופיל משתמש</Typography>
                <Typography component="li">פיתוח ממשק רשימת קשישים וכרטיס פרטי קשיש</Typography>
                <Typography component="li">פיתוח טופס דיווח ביקור</Typography>
                <Typography component="li">שילוב מפה אינטראקטיבית עם סימונים צבעוניים</Typography>
              </Box>
            </Box>
          </Grid>

          {/* Back-End Developer */}
          <Grid item xs={12} md={4}>
            <Box sx={{
              p: 3,
              height: '100%',
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-5px)',
                transition: 'all 0.3s ease'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <StorageIcon sx={{ fontSize: 40, color: '#2e7d32', mr: 2 }} />
                <Typography variant="h6" component="h3">
                  חבר צוות 2 (Back-End)
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li">השלמת מודול API למשתמשים ותפקידים</Typography>
                <Typography component="li">פיתוח API לניהול קשישים (CRUD)</Typography>
                <Typography component="li">פיתוח API לניהול ביקורים</Typography>
                <Typography component="li">יישום לוגיקה לחישוב סטטוס ביקור וצבע במפה</Typography>
              </Box>
            </Box>
          </Grid>

          {/* GIS Developer */}
          <Grid item xs={12} md={4}>
            <Box sx={{
              p: 3,
              height: '100%',
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              '&:hover': {
                boxShadow: 3,
                transform: 'translateY(-5px)',
                transition: 'all 0.3s ease'
              }
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MapIcon sx={{ fontSize: 40, color: '#ed6c02', mr: 2 }} />
                <Typography variant="h6" component="h3">
                  חבר צוות 3 (GIS)
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li">פיתוח פונקציונליות חיפוש מרחבי (קשישים בקרבת נקודה)</Typography>
                <Typography component="li">פיתוח פילטרים גיאוגרפיים (שכונות, אזורים)</Typography>
                <Typography component="li">יישום לוגיקת הגדלת סימונים לפי זמן מביקור אחרון</Typography>
                <Typography component="li">פיתוח מודול לחישוב סטטיסטיקות גיאוגרפיות</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
          אודות המערכת
        </Typography>
        <Typography paragraph sx={{ textAlign: 'center' }}>
          מערכת GIS-2025 היא פלטפורמה חדשנית לניהול ומעקב אחר ביקורי מתנדבים אצל קשישים.
          המערכת משלבת טכנולוגיות מתקדמות בתחום המיפוי והמידע הגיאוגרפי יחד עם ממשק משתמש ידידותי,
          במטרה לייעל את עבודת המתנדבים ולשפר את השירות לקשישים.
        </Typography>
        <Typography paragraph sx={{ textAlign: 'center' }}>
          הפרויקט פותח במסגרת לימודי הנדסת תוכנה במכללה האקדמית להנדסה אורט בראודה,
          תוך שימת דגש על חדשנות טכנולוגית ותרומה לקהילה.
        </Typography>
      </Paper>
    </Container>
  );
};

export default About; 
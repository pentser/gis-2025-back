import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  CardActions,
  useTheme
} from '@mui/material';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const LandingPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
        py: 8
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} textAlign="center" mb={4}>
            <Typography variant="h2" component="h1" color="white" gutterBottom>
              מערכת ניהול מתנדבים
            </Typography>
            <Typography variant="h5" color="white" paragraph>
              חיבור בין מתנדבים לקשישים בקהילה
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="center" mb={2}>
                  <VolunteerActivismIcon sx={{ fontSize: 60, color: theme.palette.primary.main }} />
                </Box>
                <Typography variant="h4" component="h2" gutterBottom textAlign="center">
                  מתנדב חדש?
                </Typography>
                <Typography variant="body1" paragraph textAlign="center">
                  הצטרפו למערכת כמתנדבים ותוכלו לראות את הקשישים באזור שלכם, לתאם ביקורים ולעקוב אחר הפעילות שלכם.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button 
                  variant="contained" 
                  size="large"
                  onClick={() => navigate('/register')}
                >
                  הרשמה כמתנדב
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="center" mb={2}>
                  <AdminPanelSettingsIcon sx={{ fontSize: 60, color: theme.palette.secondary.main }} />
                </Box>
                <Typography variant="h4" component="h2" gutterBottom textAlign="center">
                  מנהל מערכת?
                </Typography>
                <Typography variant="body1" paragraph textAlign="center">
                  התחברו למערכת כמנהלים כדי לנהל את המתנדבים והקשישים, לעקוב אחר הביקורים ולנהל את המערכת.
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                <Button 
                  variant="contained" 
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/login')}
                >
                  התחברות כמנהל
                </Button>
              </CardActions>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage; 
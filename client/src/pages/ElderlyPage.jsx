import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Divider,
  CircularProgress
} from '@mui/material';
import { fetchElderlyById } from '../services/api';

const ElderlyPage = () => {
  const { id } = useParams();
  const [elderly, setElderly] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadElderlyData = async () => {
      try {
        const data = await fetchElderlyById(id);
        setElderly(data);
      } catch (err) {
        console.error('שגיאה בטעינת פרטי הקשיש:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadElderlyData();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography color="error">שגיאה בטעינת פרטי הקשיש: {error}</Typography>
        </Paper>
      </Container>
    );
  }

  if (!elderly) {
    return (
      <Container>
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography>לא נמצאו פרטים עבור הקשיש המבוקש</Typography>
        </Paper>
      </Container>
    );
  }

  const formatDate = (date) => {
    if (!date) return 'לא צוין';
    return new Date(date).toLocaleDateString('he-IL');
  };

  const formatAddress = (address) => {
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      const parts = [];
      if (address.street) parts.push(address.street);
      if (address.city) parts.push(address.city);
      if (address.zipCode) parts.push(address.zipCode);
      return parts.join(', ');
    }
    return 'כתובת לא זמינה';
  };

  return (
    <Container>
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {elderly.firstName} {elderly.lastName}
        </Typography>
        
        <Divider sx={{ my: 2 }} />

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>פרטים אישיים</Typography>
            <Box>
              <Typography><strong>תאריך לידה:</strong> {formatDate(elderly.birthDate)}</Typography>
              <Typography><strong>כתובת:</strong> {formatAddress(elderly.address)}</Typography>
              <Typography><strong>טלפון:</strong> {elderly.phone || 'לא צוין'}</Typography>
              <Typography><strong>סטטוס:</strong> {elderly.status || 'לא צוין'}</Typography>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>איש קשר לחירום</Typography>
            <Box>
              <Typography>
                <strong>שם:</strong> {elderly.emergencyContact?.name || 'לא צוין'}
              </Typography>
              <Typography>
                <strong>טלפון:</strong> {elderly.emergencyContact?.phone || 'לא צוין'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>מידע רפואי</Typography>
            <Box>
              <Typography>
                <strong>מצבים רפואיים:</strong> {elderly.conditions?.join(', ') || 'אין מידע'}
              </Typography>
              <Typography>
                <strong>הערות:</strong> {elderly.notes || 'אין הערות'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>העדפות ביקור</Typography>
            <Box>
              <Typography>
                <strong>ימים מועדפים:</strong> {elderly.preferredDays?.join(', ') || 'לא צוין'}
              </Typography>
              <Typography>
                <strong>שעות מועדפות:</strong> {elderly.preferredHours || 'לא צוין'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ElderlyPage; 
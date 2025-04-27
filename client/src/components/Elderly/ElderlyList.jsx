import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Button,
  IconButton,
  CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchElderly, softDeleteElderly } from '../../services/api';
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary';

const ElderlyList = () => {
  const [elderly, setElderly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadElderly();
  }, []);

  const loadElderly = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchElderly();
      // וידוא שהנתונים הם מערך
      setElderly(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('שגיאה בטעינת רשימת הקשישים:', err);
      setError('אירעה שגיאה בטעינת הנתונים');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק קשיש זה?')) {
      try {
        await softDeleteElderly(id);
        await loadElderly();
      } catch (err) {
        setError('אירעה שגיאה במחיקת הקשיש');
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" align="center">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <ErrorBoundary>
      <Container>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6}>
            <Typography variant="h4" component="h1">
              רשימת קשישים
            </Typography>
          </Grid>
          <Grid item xs={6} sx={{ textAlign: 'left' }}>
            <Button
              component={Link}
              to="/app/elderly/new"
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
            >
              הוסף קשיש
            </Button>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          {elderly.map((person) => (
            <Grid item xs={12} sm={6} md={4} key={person._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    {person.firstName} {person.lastName}
                  </Typography>
                  <Typography color="textSecondary">
                    טלפון: {person.phone || 'לא צוין'}
                  </Typography>
                  <Typography color="textSecondary">
                    כתובת: {typeof person.address === 'string' ? person.address : (person.address?.street || 'לא צוינה')}
                  </Typography>
                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton
                      component={Link}
                      to={`/app/elderly/edit/${person._id}`}
                      color="primary"
                      size="small"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDelete(person._id)}
                      color="error"
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </ErrorBoundary>
  );
};

export default ElderlyList; 
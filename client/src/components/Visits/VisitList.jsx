import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { fetchVisits, deleteVisit } from '../../services/api';
import styles from './VisitList.module.css';

const VisitList = () => {
  const [visits, setVisits] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVisits();
      setVisits(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את הביקור?')) {
      try {
        setError(null);
        await deleteVisit(id);
        await loadVisits();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <Typography variant="h4" component="h1">
          רשימת ביקורים
        </Typography>
        <Button
          component={Link}
          to="/visits/new"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          הוסף ביקור
        </Button>
      </div>

      {error && (
        <Alert severity="error" className={styles.alert}>
          {error}
        </Alert>
      )}

      {loading ? (
        <div className={styles.loading}>
          <CircularProgress />
        </div>
      ) : visits.length === 0 ? (
        <Alert severity="info" className={styles.alert}>
          אין ביקורים להצגה
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {visits.map((visit) => (
            <Grid item xs={12} sm={6} md={4} key={visit._id}>
              <Card className={styles.card}>
                <CardContent>
                  <Typography variant="h6">
                    {visit.elder ? `${visit.elder.firstName} ${visit.elder.lastName}` : 'שם הקשיש לא ידוע'}
                  </Typography>
                  <Typography color="textSecondary">
                    תאריך: {visit.lastVisit ? new Date(visit.lastVisit).toLocaleDateString('he-IL') : 'תאריך לא ידוע'}
                  </Typography>
                  <Typography color="textSecondary">
                    שעה: {visit.lastVisit ? new Date(visit.lastVisit).toLocaleTimeString('he-IL') : 'שעה לא ידועה'}
                  </Typography>
                  <Typography color="textSecondary">
                    סטטוס: {visit.status || 'לא ידוע'}
                  </Typography>
                  <div className={styles.actions}>
                    <IconButton
                      component={Link}
                      to={`/visits/${visit._id}`}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => handleDelete(visit._id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default VisitList; 
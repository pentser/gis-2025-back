import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  IconButton
} from '@mui/material';
import { Link } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import styles from './ElderlyList.module.css';

const ElderlyList = () => {
  const [elderly, setElderly] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchElderly();
  }, []);

  const fetchElderly = async () => {
    try {
      const response = await fetch('/api/elderly');
      if (!response.ok) {
        throw new Error('שגיאה בטעינת נתוני הקשישים');
      }
      const data = await response.json();
      setElderly(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק קשיש זה?')) {
      try {
        const response = await fetch(`/api/elderly/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('שגיאה במחיקת הקשיש');
        }
        fetchElderly(); // רענון הרשימה
      } catch (err) {
        setError(err.message);
      }
    }
  };

  if (error) {
    return (
      <Container className={styles.container}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      <div className={styles.header}>
        <Typography variant="h4" component="h1">
          רשימת קשישים
        </Typography>
        <Button
          component={Link}
          to="/elderly/new"
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
        >
          הוסף קשיש
        </Button>
      </div>

      <Grid container spacing={3}>
        {elderly.map((person) => (
          <Grid item xs={12} sm={6} md={4} key={person._id}>
            <Card className={styles.card}>
              <CardContent>
                <Typography variant="h6">
                  {person.firstName} {person.lastName}
                </Typography>
                <Typography color="textSecondary">
                  גיל: {person.age}
                </Typography>
                <Typography color="textSecondary">
                  כתובת: {person.address}
                </Typography>
                <Typography color="textSecondary">
                  טלפון: {person.phone}
                </Typography>
                <div className={styles.actions}>
                  <IconButton
                    component={Link}
                    to={`/elderly/${person._id}`}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleDelete(person._id)}
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
  );
};

export default ElderlyList; 
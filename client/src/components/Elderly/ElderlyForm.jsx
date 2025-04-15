import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper
} from '@mui/material';
import styles from './ElderlyForm.module.css';

const ElderlyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    address: '',
    phone: '',
    notes: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchElderlyData();
    }
  }, [id]);

  const fetchElderlyData = async () => {
    try {
      const response = await fetch(`/api/elderly/${id}`);
      if (!response.ok) {
        throw new Error('שגיאה בטעינת נתוני הקשיש');
      }
      const data = await response.json();
      setFormData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = id ? `/api/elderly/${id}` : '/api/elderly';
      const method = id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('שגיאה בשמירת הנתונים');
      }

      navigate('/elderly');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container className={styles.container}>
      <Paper className={styles.paper}>
        <Typography variant="h5" component="h1" gutterBottom>
          {id ? 'עריכת קשיש' : 'הוספת קשיש חדש'}
        </Typography>

        {error && (
          <Typography color="error" className={styles.error}>
            {error}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="שם פרטי"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="שם משפחה"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="number"
                label="גיל"
                name="age"
                value={formData.age}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="כתובת"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="טלפון"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="הערות"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} className={styles.actions}>
              <Button
                type="button"
                onClick={() => navigate('/elderly')}
              >
                ביטול
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                {id ? 'שמור שינויים' : 'הוסף קשיש'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ElderlyForm; 
import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  Box
} from '@mui/material';
import styles from './ContactForm.module.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    homeAddress: '',
    notes: ''
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

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
      // כאן תהיה הלוגיקה לשליחת הטופס לשרת
      console.log('טופס נשלח:', formData);
      setSuccess(true);
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        homeAddress: '',
        notes: ''
      });
    } catch (err) {
      setError('אירעה שגיאה בשליחת הטופס');
    }
  };

  return (
    <Container className={styles.container}>
      <Paper className={styles.paper}>
        <Typography variant="h5" component="h1" gutterBottom align="center">
          טופס יצירת קשר
        </Typography>

        {error && (
          <Alert severity="error" className={styles.alert}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" className={styles.alert}>
            הטופס נשלח בהצלחה!
          </Alert>
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
                InputLabelProps={{
                  sx: { backgroundColor: 'white', px: 1 }
                }}
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
                InputLabelProps={{
                  sx: { backgroundColor: 'white', px: 1 }
                }}
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
                InputLabelProps={{
                  sx: { backgroundColor: 'white', px: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="email"
                label="דוא״ל"
                name="email"
                value={formData.email}
                onChange={handleChange}
                InputLabelProps={{
                  sx: { backgroundColor: 'white', px: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="כתובת"
                name="homeAddress"
                value={formData.homeAddress}
                onChange={handleChange}
                InputLabelProps={{
                  sx: { backgroundColor: 'white', px: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="הערות"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                multiline
                rows={4}
                InputLabelProps={{
                  sx: { backgroundColor: 'white', px: 1 }
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={styles.submitButton}
              >
                שלח טופס
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default ContactForm; 
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // בדיקה אם הגענו מדף הנחיתה עם פרמטר role
  const role = new URLSearchParams(location.search).get('role');
  const isAdmin = role === 'admin';

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'נדרש אימייל';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'אימייל לא תקין';
    }
    if (!formData.password) {
      errors.password = 'נדרשת סיסמה';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      await login({ ...formData, role: isAdmin ? 'admin' : 'volunteer' });
      if (isAdmin) {
        navigate('/app/dashboard');
      } else {
        navigate('/app/map');
      }
    } catch (err) {
      setError(err.message || 'שגיאה בהתחברות');
    }
  };

  return (
    <Container maxWidth="sm" className={styles.container}>
      <Paper elevation={3} className={styles.paper}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {isAdmin ? 'התחברות מנהל מערכת' : 'התחברות מתנדב'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="אימייל"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!validationErrors.email}
            helperText={validationErrors.email}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="סיסמה"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={!!validationErrors.password}
            helperText={validationErrors.password}
            required
          />

          <Box mt={3}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              התחבר
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Login; 
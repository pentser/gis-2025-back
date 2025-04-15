import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Link as MuiLink
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import styles from './Auth.module.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
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
    setError('');
    
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      setError('שם משתמש או סיסמה שגויים');
    }
  };

  return (
    <Container component="main" maxWidth="xs" className={styles.container}>
      <Paper className={styles.paper} elevation={3}>
        <Typography component="h1" variant="h5">
          התחברות
        </Typography>
        
        {error && (
          <Typography color="error" className={styles.error}>
            {error}
          </Typography>
        )}

        <form className={styles.form} onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="דואר אלקטרוני"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                autoFocus
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="סיסמה"
                name="password"
                type="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={styles.submit}
          >
            התחבר
          </Button>

          <Grid container justifyContent="center" className={styles.links}>
            <Grid item>
              <MuiLink component={Link} to="/register" variant="body2">
                אין לך חשבון? הירשם כאן
              </MuiLink>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default Login; 
import React, { useState } from 'react';
import { Container, Paper, Typography, Grid, FormControl, InputLabel, Select, MenuItem, TextField, Alert, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './VisitForm.module.css';

const VisitForm = () => {
  const [formData, setFormData] = useState({
    elder: '',
    date: null,
    duration: '',
    status: 'scheduled',
    notes: ''
  });
  const [elderly, setElderly] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      // Implement the logic to submit the form
      setSuccess(t('visit.form.success'));
    } catch (e) {
      setError(t('visit.form.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className={styles.container}>
      <Paper className={styles.paper}>
        <Typography variant="h5" component="h1" gutterBottom>
          דיווח/עדכון ביקור
        </Typography>

        {error && (
          <Alert severity="error" className={styles.alert}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" className={styles.alert}>
            {id ? 'הביקור עודכן בהצלחה' : 'הביקור נוצר בהצלחה'}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ background: 'white', px: 1 }}>קשיש</InputLabel>
                <Select
                  name="elder"
                  value={formData.elder}
                  onChange={handleChange}
                  required
                >
                  {elderly.map((elder) => (
                    <MenuItem key={elder._id} value={elder._id}>
                      {elder.firstName} {elder.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
                <DateTimePicker
                  label="תאריך ושעה"
                  value={formData.date}
                  onChange={(newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      date: newValue
                    }));
                  }}
                  slots={{
                    textField: (params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        required 
                        InputLabelProps={{
                          sx: { background: 'white', px: 1 }
                        }}
                      />
                    )
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="משך (בדקות)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                required
                inputProps={{ min: 1 }}
                InputLabelProps={{
                  sx: { background: 'white', px: 1 }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ background: 'white', px: 1 }}>סטטוס</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="scheduled">מתוכנן</MenuItem>
                  <MenuItem value="completed">בוצע</MenuItem>
                  <MenuItem value="cancelled">בוטל</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="notes"
                label="הערות"
                multiline
                rows={4}
                value={formData.notes}
                onChange={handleChange}
                fullWidth
                inputProps={{ maxLength: 500 }}
                helperText={`${formData.notes.length}/500`}
                InputLabelProps={{
                  sx: { background: 'white', px: 1 }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <div className={styles.actions}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                >
                  עדכן ביקור
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate('/app/visits')}
                  disabled={loading}
                >
                  ביטול
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default VisitForm; 
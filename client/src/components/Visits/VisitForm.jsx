import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { he } from 'date-fns/locale';
import { fetchVisitById, createVisit, updateVisit, fetchElderly, fetchVolunteers } from '../../services/api';
import styles from './VisitForm.module.css';
import { useAuth } from '../../context/AuthContext';

const VisitForm = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const elderId = queryParams.get('elderId');

  const [formData, setFormData] = useState({
    elder: elderId || '',
    volunteer: user?._id || '',
    date: new Date(),
    duration: 30,
    notes: '',
    status: 'scheduled'
  });

  const [elderly, setElderly] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // טעינת רשימת הקשישים
        const elderlyData = await fetchElderly();
        setElderly(elderlyData);

        // אם המשתמש הוא מתנדב, הגדר אותו אוטומטית
        if (user && user.role === 'volunteer') {
          setFormData(prev => ({
            ...prev,
            volunteer: user._id
          }));
        } else {
          // אם זה אדמין, טען את רשימת המתנדבים
          const volunteersData = await fetchVolunteers();
          setVolunteers(volunteersData);
        }

        // אם יש ID, טען את פרטי הביקור
        if (id) {
          const visitData = await fetchVisitById(id);
          setFormData({
            elder: visitData.elder,
            volunteer: visitData.volunteer,
            date: new Date(visitData.date),
            duration: visitData.duration,
            notes: visitData.notes,
            status: visitData.status
          });
        }
      } catch (err) {
        console.error('שגיאה בטעינת נתונים:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const visitData = {
        ...formData,
        date: formData.date.toISOString(),
        duration: parseInt(formData.duration),
        volunteer: user.role === 'volunteer' ? user._id : formData.volunteer
      };

      console.log('שולח נתוני ביקור:', visitData);

      if (id) {
        await updateVisit(id, visitData);
      } else {
        await createVisit(visitData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/app/map');
      }, 1500);
    } catch (err) {
      console.error('שגיאה בשמירת ביקור:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <Container className={styles.container}>
        <div className={styles.loading}>
          <CircularProgress />
        </div>
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      <Paper className={styles.paper}>
        <Typography variant="h5" component="h1" gutterBottom>
          {id ? 'עריכת ביקור' : 'ביקור חדש'}
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
            {user && user.role === 'admin' && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>מתנדב</InputLabel>
                  <Select
                    name="volunteer"
                    value={formData.volunteer}
                    onChange={handleChange}
                    required
                  >
                    {volunteers.map((volunteer) => (
                      <MenuItem key={volunteer._id} value={volunteer._id}>
                        {volunteer.firstName} {volunteer.lastName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>קשיש</InputLabel>
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
                    textField: (params) => <TextField {...params} fullWidth required />
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
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>סטטוס</InputLabel>
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
                  {id ? 'עדכן ביקור' : 'צור ביקור'}
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
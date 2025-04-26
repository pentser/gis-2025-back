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
  CircularProgress,
  Autocomplete
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
  const dateTime = queryParams.get('dateTime');

  const [formData, setFormData] = useState({
    elder: elderId || '',
    volunteer: user?._id || '',
    date: dateTime ? new Date(dateTime) : new Date(),
    duration: 30,
    notes: '',
    status: 'scheduled'
  });

  const [elderly, setElderly] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedElderly, setSelectedElderly] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // טעינת רשימת הקשישים
        const elderlyData = await fetchElderly();
        
        // סינון כפילויות לפי ID
        const uniqueElderly = elderlyData.reduce((acc, current) => {
          const x = acc.find(item => item._id === current._id);
          if (!x) {
            return acc.concat([current]);
          } else {
            return acc;
          }
        }, []);

        // מיון לפי שם פרטי ושם משפחה
        uniqueElderly.sort((a, b) => {
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          return nameA.localeCompare(nameB);
        });

        setElderly(uniqueElderly);

        // אם יש elderId, מצא את הקשיש המתאים
        if (elderId) {
          const found = uniqueElderly.find(e => e._id === elderId);
          if (found) {
            setSelectedElderly(found);
          }
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
          const elderlyFound = uniqueElderly.find(e => e._id === visitData.elder);
          if (elderlyFound) {
            setSelectedElderly(elderlyFound);
          }
        }
      } catch (err) {
        console.error('שגיאה בטעינת נתונים:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, elderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const visitData = {
        ...formData,
        elder: selectedElderly._id,
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
        navigate('/app/myvisits');
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
          {id ? 'עדכון ביקור' : 'דיווח/עדכון ביקור'}
        </Typography>

        {error && (
          <Alert severity="error" className={styles.alert}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" className={styles.alert}>
            הביקור נשמר בהצלחה
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
              <Autocomplete
                options={elderly}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                value={selectedElderly}
                onChange={(event, newValue) => {
                  setSelectedElderly(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="קשיש"
                    required
                    InputLabelProps={{
                      sx: { backgroundColor: 'white', px: 1 }
                    }}
                  />
                )}
                isOptionEqualToValue={(option, value) => option._id === value?._id}
              />
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
                          sx: { backgroundColor: 'white', px: 1 }
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
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                required
                inputProps={{ min: 1 }}
                InputLabelProps={{
                  sx: { backgroundColor: 'white', px: 1 }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel sx={{ backgroundColor: 'white', px: 1 }}>סטטוס</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
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
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                fullWidth
                inputProps={{ maxLength: 500 }}
                helperText={`${formData.notes.length}/500`}
                InputLabelProps={{
                  sx: { backgroundColor: 'white', px: 1 }
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
                  onClick={() => navigate('/app/myvisits')}
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
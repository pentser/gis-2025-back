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
    elder: '',
    volunteer: '',
    date: dateTime ? new Date(dateTime) : new Date(),
    duration: 30,
    notes: '',
    status: 'scheduled'
  });

  const [elderly, setElderly] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedElderly, setSelectedElderly] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // טעינת רשימת המתנדבים
        const fetchVolunteers = async () => {
          try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            // שליפת המתנדבים מהנתיב הנכון
            const response = await fetch('http://localhost:5000/api/volunteers', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });

            if (!response.ok) {
              throw new Error('Failed to fetch volunteers');
            }

            const data = await response.json();
            console.log('Volunteers data:', data);

            const formattedVolunteers = data.map(user => ({
              _id: user._id,
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              name: `${user.firstName || ''} ${user.lastName || ''}`.trim()
            }));

            setVolunteers(formattedVolunteers);
            setError(null);
          } catch (err) {
            console.error('Error fetching volunteers:', err);
            setError('שגיאה בטעינת רשימת המתנדבים');
          } finally {
            setLoading(false);
          }
        };

        fetchVolunteers();

        // טעינת רשימת הקשישים
        const elderlyData = await fetchElderly();
        setElderly(elderlyData);

        // אם יש elderId, מצא את הקשיש המתאים
        if (elderId) {
          const found = elderlyData.find(e => e._id === elderId);
          if (found) {
            setSelectedElderly(found);
            setFormData(prev => ({
              ...prev,
              elder: elderId
            }));
          }
        }

        // אם יש ID, טען את פרטי הביקור
        if (id) {
          const visitData = await fetchVisitById(id);
          setFormData({
            elder: visitData.elder._id,
            volunteer: visitData.volunteer.name,
            date: new Date(visitData.date),
            duration: visitData.duration,
            notes: visitData.notes,
            status: visitData.status
          });
          
          const elderlyFound = elderlyData.find(e => e._id === visitData.elder._id);
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
  }, [id, elderId, user?.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const visitData = {
        ...formData,
        volunteer: formData.volunteer,
        elder: formData.elder,
        date: formData.date,
        duration: formData.duration,
        notes: formData.notes,
        status: formData.status
      };

      if (id) {
        await updateVisit(id, visitData);
      } else {
        await createVisit(visitData);
      }
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/app/visits');
      }, 2000);
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
          {id ? 'עדכון ביקור' : 'דיווח ביקור'}
        </Typography>

        {error && (
          <Alert severity="error" className={styles.alert}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" className={styles.alert}>
            הביקור נשמר בהצלחה!
          </Alert>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Autocomplete
                value={selectedElderly}
                onChange={(event, newValue) => {
                  setSelectedElderly(newValue);
                  setFormData(prev => ({
                    ...prev,
                    elder: newValue?._id || ''
                  }));
                }}
                options={elderly}
                getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="קשיש"
                    InputLabelProps={{
                      sx: { backgroundColor: 'white', px: 1 }
                    }}
                  />
                )}
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
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      fullWidth
                      InputLabelProps={{
                        sx: { backgroundColor: 'white', px: 1 }
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12}>
              <TextField
                name="duration"
                label="משך (בדקות)"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                required
                fullWidth
                InputProps={{ inputProps: { min: 1 } }}
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
                  {id ? 'עדכן ביקור' : 'צור ביקור'}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => navigate(-1)}
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
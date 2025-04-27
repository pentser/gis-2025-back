import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import styles from './VisitList.module.css';

const statusTranslations = {
  scheduled: 'מתוכנן',
  completed: 'בוצע',
  cancelled: 'בוטל',
  pending: 'ממתין',
  inProgress: 'בביצוע'
};

const VisitList = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: '',
    fromDate: '',
    toDate: ''
  });

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      // קבלת הטוקן מהלוקל סטורג'
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('אין הרשאה');
      }

      const response = await fetch('http://localhost:5000/api/visits', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('אין הרשאה');
        }
        throw new Error('שגיאה בטעינת הביקורים');
      }

      const data = await response.json();
      setVisits(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      if (err.message === 'אין הרשאה') {
        // אפשר להוסיף ניווט לדף ההתחברות
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditVisit = (visitId) => {
    navigate(`/app/visits/new?visitId=${visitId}`);
  };

  const getFilteredVisits = () => {
    return visits.filter(visit => {
      // בדיקת תקינות תאריך
      const visitDate = new Date(visit.date);
      if (isNaN(visitDate.getTime())) {
        return false;
      }

      // פילטור לפי חיפוש
      const searchMatch = !filters.searchTerm || 
        (visit.elder && `${visit.elder.firstName} ${visit.elder.lastName}`.toLowerCase().includes(filters.searchTerm.toLowerCase()));

      // פילטור לפי סטטוס
      const statusMatch = !filters.status || visit.status === filters.status;

      // פילטור לפי תאריכים
      const fromDate = filters.fromDate ? new Date(filters.fromDate) : null;
      const toDate = filters.toDate ? new Date(filters.toDate) : null;
      const dateMatch = (!fromDate || visitDate >= fromDate) && (!toDate || visitDate <= toDate);

      return searchMatch && statusMatch && dateMatch;
    });
  };

  if (loading) return <div>טוען...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Container>
      <Paper className={styles.paper}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h1">
            ניהול ביקורים
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/app/visits/new')}
            className={styles.addButton}
          >
            צור ביקור
          </Button>
        </Box>

        <Box className={styles.filters}>
          <TextField
            label="חיפוש לפי שם קשיש/מתנדב"
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className={styles.searchField}
          />
          
          <FormControl className={styles.statusFilter}>
            <InputLabel>סטטוס</InputLabel>
            <Select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              style={{ minWidth: '200px' }}
            >
              <MenuItem value="">הכל</MenuItem>
              <MenuItem value="scheduled">מתוכנן</MenuItem>
              <MenuItem value="completed">בוצע</MenuItem>
              <MenuItem value="cancelled">בוטל</MenuItem>
            </Select>
          </FormControl>

          <TextField
            type="date"
            label="מתאריך"
            value={filters.fromDate}
            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            className={styles.dateInput}
          />
          <TextField
            type="date"
            label="עד תאריך"
            value={filters.toDate}
            onChange={(e) => handleFilterChange('toDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            className={styles.dateInput}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="right">תאריך</TableCell>
                <TableCell align="right">שעה</TableCell>
                <TableCell align="right">קשיש</TableCell>
                <TableCell align="right">מתנדב</TableCell>
                <TableCell align="right">עיר</TableCell>
                <TableCell align="right">משך (דקות)</TableCell>
                <TableCell align="right" style={{ minWidth: '150px' }}>סטטוס</TableCell>
                <TableCell align="right">הערות</TableCell>
                <TableCell align="right">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredVisits().map((visit) => {
                // בדיקת תקינות התאריך
                const visitDate = new Date(visit.date);
                if (isNaN(visitDate.getTime())) return null;

                // שליפת שם הקשיש
                const elderName = visit.elder?.firstName && visit.elder?.lastName 
                  ? `${visit.elder.firstName} ${visit.elder.lastName}`
                  : visit.elderName || 'לא ידוע';  // שימוש בשדה elderName אם קיים

                // שליפת שם המתנדב
                const volunteerName = visit.volunteer && visit.volunteer.firstName && visit.volunteer.lastName
                  ? `${visit.volunteer.firstName} ${visit.volunteer.lastName}`.trim()
                  : 'לא ידוע';

                // שליפת העיר
                const city = visit.elder?.city || 
                            (visit.elder?.address?.city) || 
                            'לא ידוע';

                return (
                  <TableRow key={visit._id} hover>
                    <TableCell align="right">
                      {visitDate.toLocaleDateString('he-IL')}
                    </TableCell>
                    <TableCell align="right">
                      {visitDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell align="right">{elderName}</TableCell>
                    <TableCell align="right">{volunteerName}</TableCell>
                    <TableCell align="right">{city}</TableCell>
                    <TableCell align="right">{visit.duration}</TableCell>
                    <TableCell align="right" style={{ minWidth: '150px' }}>
                      {visit.status === 'scheduled' ? 'מתוכנן' :
                       visit.status === 'completed' ? 'בוצע' :
                       visit.status === 'cancelled' ? 'בוטל' :
                       visit.status === 'pending' ? 'ממתין' :
                       visit.status === 'inProgress' ? 'בביצוע' :
                       visit.status}
                    </TableCell>
                    <TableCell align="right">
                      <div className={styles.notesContent}>
                        {visit.notes || '-'}
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleEditVisit(visit._id)}
                        className={styles.actionButton}
                      >
                        דווח/עדכן
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default VisitList; 
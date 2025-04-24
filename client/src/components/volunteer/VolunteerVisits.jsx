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
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchVolunteerVisits } from '../../services/api';
import styles from './VolunteerVisits.module.css';

// פונקציה לחישוב דחיפות הביקור
const calculateUrgency = (visit) => {
  if (!visit.lastVisit) return 'high';
  
  const daysSinceLastVisit = Math.floor(
    (new Date() - new Date(visit.lastVisit)) / (1000 * 60 * 60 * 24)
  );
  
  if (daysSinceLastVisit > 21) return 'high';
  if (daysSinceLastVisit > 10) return 'medium';
  return 'low';
};

// פונקציה להצגת צ'יפ של דחיפות
const UrgencyChip = ({ urgency }) => {
  const colors = {
    high: { bg: '#ffebee', color: '#c62828', label: 'דחוף' },
    medium: { bg: '#fff3e0', color: '#ef6c00', label: 'בינוני' },
    low: { bg: '#e8f5e9', color: '#2e7d32', label: 'רגיל' }
  };

  const style = colors[urgency];
  return (
    <Chip
      label={style.label}
      style={{
        backgroundColor: style.bg,
        color: style.color,
        fontWeight: 'bold'
      }}
    />
  );
};

const VolunteerVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchVolunteerVisits();
      
      // מיון הביקורים לפי דחיפות ותאריך
      const sortedVisits = data.sort((a, b) => {
        const urgencyA = calculateUrgency(a);
        const urgencyB = calculateUrgency(b);
        
        // קודם ממיינים לפי דחיפות
        if (urgencyA !== urgencyB) {
          if (urgencyA === 'high') return -1;
          if (urgencyB === 'high') return 1;
          if (urgencyA === 'medium') return -1;
          return 1;
        }
        
        // אם הדחיפות זהה, ממיינים לפי תאריך (מהחדש לישן)
        return new Date(b.date) - new Date(a.date);
      });
      
      setVisits(sortedVisits);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewVisit = (elderId) => {
    navigate(`/visits/new?elderId=${elderId}`);
  };

  if (loading) {
    return (
      <Container className={styles.container}>
        <div className={styles.loading}>
          <CircularProgress />
          <Typography>טוען ביקורים...</Typography>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={styles.container}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      <Paper className={styles.paper}>
        <Typography variant="h5" component="h1" gutterBottom>
          הביקורים שלי
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>קשיש</TableCell>
                <TableCell>כתובת</TableCell>
                <TableCell>ביקור אחרון</TableCell>
                <TableCell>ימים מאז ביקור</TableCell>
                <TableCell>דחיפות</TableCell>
                <TableCell>פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography>אין ביקורים להצגה</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visits.map((visit) => {
                  const daysSinceLastVisit = visit.lastVisit
                    ? Math.floor((new Date() - new Date(visit.lastVisit)) / (1000 * 60 * 60 * 24))
                    : null;
                  const urgency = calculateUrgency(visit);

                  return (
                    <TableRow key={visit._id} className={styles[`urgency-${urgency}`]}>
                      <TableCell>
                        {visit.elder ? `${visit.elder.firstName} ${visit.elder.lastName}` : 'לא ידוע'}
                      </TableCell>
                      <TableCell>{visit.elder?.address || 'כתובת לא ידועה'}</TableCell>
                      <TableCell>
                        {visit.lastVisit
                          ? new Date(visit.lastVisit).toLocaleDateString('he-IL')
                          : 'אין ביקור קודם'}
                      </TableCell>
                      <TableCell>
                        {daysSinceLastVisit !== null ? `${daysSinceLastVisit} ימים` : 'לא ידוע'}
                      </TableCell>
                      <TableCell>
                        <UrgencyChip urgency={urgency} />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleNewVisit(visit.elder?._id)}
                        >
                          דווח ביקור
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default VolunteerVisits; 
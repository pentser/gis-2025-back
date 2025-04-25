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
      setVisits(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewVisit = (elderId) => {
    navigate(`/app/visits/new?elderId=${elderId}`);
  };

  // פונקציה להמרת תאריך לפורמט הרצוי
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  // פונקציה להמרת שעה לפורמט הרצוי
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
          ביקורים שלי
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="right" width="100px">תאריך</TableCell>
                <TableCell align="right" width="80px">שעה</TableCell>
                <TableCell align="right" width="120px">קשיש</TableCell>
                <TableCell align="right" width="200px">כתובת</TableCell>
                <TableCell align="right" width="100px">משך (דקות)</TableCell>
                <TableCell align="right" width="100px">סטטוס</TableCell>
                <TableCell align="right" width="200px" className={styles.notesCell}>הערות</TableCell>
                <TableCell align="right" width="120px">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography>אין ביקורים להצגה</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                visits.map((visit) => (
                  <TableRow key={visit._id}>
                    <TableCell align="right">{formatDate(visit.date)}</TableCell>
                    <TableCell align="right">{formatTime(visit.date)}</TableCell>
                    <TableCell align="right">
                      {visit.elder ? `${visit.elder.firstName} ${visit.elder.lastName}` : 'לא ידוע'}
                    </TableCell>
                    <TableCell align="right">{visit.elder?.address || 'כתובת לא ידועה'}</TableCell>
                    <TableCell align="right">{visit.duration}</TableCell>
                    <TableCell align="right">{visit.status}</TableCell>
                    <TableCell align="right" className={styles.notesCell}>
                      <div 
                        className={styles.notesContent}
                        data-notes={visit.notes || '-'}
                      >
                        {visit.notes || '-'}
                      </div>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => handleNewVisit(visit.elder?._id)}
                        className={styles.actionButton}
                      >
                        דווח/עדכן
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default VolunteerVisits; 
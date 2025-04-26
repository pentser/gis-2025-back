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
  Chip,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchVolunteerVisits } from '../../services/api';
import styles from './VolunteerVisits.module.css';
import AddIcon from '@mui/icons-material/Add';
import ElderlyDetailsSidebar from './ElderlyDetailsSidebar';

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

// מיפוי סטטוסים לעברית
const statusTranslations = {
  'scheduled': 'מתוכנן',
  'completed': 'בוצע',
  'cancelled': 'בוטל'
};

const VolunteerVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const navigate = useNavigate();
  const [selectedElderly, setSelectedElderly] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    const now = new Date();
    // מוסיף 3 שעות לשעון UTC כדי להתאים לשעון ישראל
    now.setHours(now.getHours() + 3);
    const formattedDateTime = now.toISOString().slice(0, 16); // Format: "YYYY-MM-DDThh:mm"
    navigate(`/app/visits/new?elderId=${elderId}&dateTime=${formattedDateTime}`);
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

  // פונקציה לסינון הביקורים
  const getFilteredVisits = () => {
    return visits.filter(visit => {
      // סינון לפי שם
      const elderName = `${visit.elder?.firstName} ${visit.elder?.lastName}`.toLowerCase();
      const searchLower = searchName.toLowerCase();
      const nameMatch = !searchName || elderName.includes(searchLower);

      // סינון לפי תאריכים
      const visitDate = new Date(visit.date);
      const fromDate = dateRange.from ? new Date(dateRange.from) : null;
      const toDate = dateRange.to ? new Date(dateRange.to) : null;
      
      const dateMatch = (!fromDate || visitDate >= fromDate) && 
                       (!toDate || visitDate <= toDate);

      // סינון לפי סטטוס
      const statusMatch = !selectedStatus || visit.status === selectedStatus;

      return nameMatch && dateMatch && statusMatch;
    });
  };

  // פונקציה לטיפול בלחיצה על שם קשיש
  const handleElderlyClick = (elderly) => {
    setSelectedElderly(elderly);
    setSidebarOpen(true);
  };

  // מציאת הביקור האחרון של הקשיש הנבחר
  const getLastVisit = (elderId) => {
    if (!elderId) return null;
    return visits
      .filter(v => v.elder?._id === elderId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h1">
            ביקורים שלי
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/app/visits/new')}
            startIcon={<AddIcon />}
          >
            צור ביקור
          </Button>
        </Box>

        <Box display="flex" gap={2} mb={3}>
          <TextField
            label="חיפוש לפי שם קשיש"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            size="small"
            sx={{ width: '200px' }}
          />
          <FormControl size="small" sx={{ width: '150px' }}>
            <InputLabel>סינון לפי סטטוס</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              label="סינון לפי סטטוס"
            >
              <MenuItem value="">הכל</MenuItem>
              <MenuItem value="scheduled">מתוכנן</MenuItem>
              <MenuItem value="completed">בוצע</MenuItem>
              <MenuItem value="cancelled">בוטל</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="מתאריך"
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ width: '150px' }}
          />
          <TextField
            label="עד תאריך"
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            size="small"
            sx={{ width: '150px' }}
          />
        </Box>

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
              {getFilteredVisits().length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography>אין ביקורים להצגה</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                getFilteredVisits().map((visit) => (
                  <TableRow key={visit._id}>
                    <TableCell align="right">{formatDate(visit.date)}</TableCell>
                    <TableCell align="right">{formatTime(visit.date)}</TableCell>
                    <TableCell 
                      align="right" 
                      onClick={() => handleElderlyClick(visit.elder)}
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': {
                          textDecoration: 'underline',
                          color: 'primary.main'
                        }
                      }}
                    >
                      {visit.elder ? `${visit.elder.firstName} ${visit.elder.lastName}` : 'לא ידוע'}
                    </TableCell>
                    <TableCell align="right">{visit.elder?.address || 'כתובת לא ידועה'}</TableCell>
                    <TableCell align="right">{visit.duration}</TableCell>
                    <TableCell align="right">{statusTranslations[visit.status] || visit.status}</TableCell>
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

      <ElderlyDetailsSidebar
        elderly={selectedElderly}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        lastVisit={getLastVisit(selectedElderly?._id)}
      />
    </Container>
  );
};

export default VolunteerVisits; 
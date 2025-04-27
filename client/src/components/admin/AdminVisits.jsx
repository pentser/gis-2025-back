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
import { fetchAllVisits } from '../../services/api';
import styles from './AdminVisits.module.css';
import AddIcon from '@mui/icons-material/Add';

const statusTranslations = {
  'scheduled': 'מתוכנן',
  'completed': 'בוצע',
  'cancelled': 'בוטל'
};

const AdminVisits = () => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchName, setSearchName] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadVisits();
  }, []);

  const loadVisits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllVisits();
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL');
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Container className={styles.container}>
      <Paper className={styles.paper}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h1">
            ניהול ביקורים
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
            label="חיפוש לפי שם"
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
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="right">תאריך</TableCell>
                <TableCell align="right">שעה</TableCell>
                <TableCell align="right">קשיש</TableCell>
                <TableCell align="right">מתנדב</TableCell>
                <TableCell align="right">כתובת</TableCell>
                <TableCell align="right">משך (דקות)</TableCell>
                <TableCell align="right">סטטוס</TableCell>
                <TableCell align="right">הערות</TableCell>
                <TableCell align="right">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visits.map((visit) => (
                <TableRow key={visit._id}>
                  <TableCell align="right">{formatDate(visit.date)}</TableCell>
                  <TableCell align="right">{formatTime(visit.date)}</TableCell>
                  <TableCell align="right">
                    {visit.elder ? `${visit.elder.firstName} ${visit.elder.lastName}` : 'לא ידוע'}
                  </TableCell>
                  <TableCell align="right">
                    {visit.volunteer ? `${visit.volunteer.firstName} ${visit.volunteer.lastName}` : 'לא ידוע'}
                  </TableCell>
                  <TableCell align="right">{visit.elder?.address || 'כתובת לא ידועה'}</TableCell>
                  <TableCell align="right">{visit.duration}</TableCell>
                  <TableCell align="right">{statusTranslations[visit.status] || visit.status}</TableCell>
                  <TableCell align="right">{visit.notes || '-'}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default AdminVisits; 
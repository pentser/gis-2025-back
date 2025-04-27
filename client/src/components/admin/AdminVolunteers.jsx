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
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import styles from './AdminVolunteers.module.css';
import { fetchAdminVolunteers } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminVolunteers = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login?role=admin');
      return;
    }
    
    if (user.role !== 'admin') {
      navigate('/app/map');
      return;
    }
    
    fetchVolunteers();
  }, [user, navigate]);

  const fetchVolunteers = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminVolunteers();
      setVolunteers(data);
    } catch (err) {
      console.error('שגיאה:', err);
      setError(err.message);
      
      if (err.message.includes('אין הרשאה') || err.message.includes('התחבר')) {
        navigate('/login?role=admin');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditVolunteer = (volunteerId) => {
    navigate(`/app/volunteers/edit/${volunteerId}`);
  };

  const handleCreateVolunteer = () => {
    navigate('/app/volunteers/new');
  };

  const filteredVolunteers = volunteers.filter(volunteer =>
    `${volunteer.firstName} ${volunteer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    volunteer.phone?.includes(searchTerm) ||
    volunteer.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>טוען...</div>;
  if (error) return <div>שגיאה: {error}</div>;

  return (
    <Container>
      <Paper className={styles.paper}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h5" component="h1">
            ניהול מתנדבים
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateVolunteer}
            startIcon={<AddIcon />}
          >
            צור מתנדב
          </Button>
        </Box>

        <TextField
          label="חיפוש מתנדב"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchField}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="right">שם מלא</TableCell>
                <TableCell align="right">טלפון</TableCell>
                <TableCell align="right">כתובת</TableCell>
                <TableCell align="right">מספר ביקורים</TableCell>
                <TableCell align="right">פעולות</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVolunteers.map((volunteer) => (
                <TableRow key={volunteer._id}>
                  <TableCell align="right">
                    {`${volunteer.firstName} ${volunteer.lastName}`}
                  </TableCell>
                  <TableCell align="right">{volunteer.phone || 'לא צוין'}</TableCell>
                  <TableCell align="right">{volunteer.address || 'לא צוין'}</TableCell>
                  <TableCell align="right">{volunteer.visitsCount || 0}</TableCell>
                  <TableCell align="right">
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => handleEditVolunteer(volunteer._id)}
                      startIcon={<EditIcon />}
                    >
                      ערוך
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

export default AdminVolunteers; 
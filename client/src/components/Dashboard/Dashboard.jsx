import React, { useState, useEffect, useCallback } from 'react';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import RefreshIcon from '@mui/icons-material/Refresh';
import { 
  fetchAdminDashboard, 
  fetchAdminMap 
} from '../../services/api';
import MapView from '../MapView/MapView';
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import GroupIcon from '@mui/icons-material/Group';
import Box from '@mui/material/Box';
import { useAuth } from '../../context/AuthContext';
import CircularProgress from '@mui/material/CircularProgress';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalVisits: 0,
      activeElderly: 0,
      visitsThisWeek: 0,
      activeVolunteers: 0
    },
    mapData: {
      elderly: [],
      volunteers: []
    },
    urgentVisits: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashboardResponse, mapResponse] = await Promise.all([
        fetchAdminDashboard(),
        fetchAdminMap()
      ]);

      console.log('Dashboard Response:', dashboardResponse);
      console.log('Map Response:', mapResponse);

      // עיבוד נתוני המפה
      const processedMapData = {
        elderly: mapResponse.elderly.map(elder => ({
          ...elder,
          location: elder.location?.coordinates 
            ? [elder.location.coordinates[1], elder.location.coordinates[0]]
            : null
        })).filter(elder => elder.location),
        volunteers: mapResponse.volunteers.map(volunteer => ({
          ...volunteer,
          location: volunteer.location?.coordinates 
            ? [volunteer.location.coordinates[1], volunteer.location.coordinates[0]]
            : null
        })).filter(volunteer => volunteer.location)
      };

      console.log('Processed Map Data:', processedMapData);

      setDashboardData({
        ...dashboardResponse,
        mapData: processedMapData
      });
    } catch (err) {
      console.error('שגיאה בטעינת נתונים:', err);
      setError(err.message);
      if (err.message.includes('התחברות מחדש')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [user, navigate, fetchDashboardData]);

  const navigationButtons = [
    {
      title: 'ביקורים',
      icon: <HistoryIcon sx={{ fontSize: 40 }} />,
      path: '/app/visits',
      color: '#1976d2'
    },
    {
      title: 'קשישים',
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
      path: '/app/elderly',
      color: '#2e7d32'
    },
    {
      title: 'מתנדבים',
      icon: <GroupIcon sx={{ fontSize: 40 }} />,
      path: '/app/adminvolunteers',
      color: '#ed6c02'
    }
  ];

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <CircularProgress />
        <Typography>טוען נתונים...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        color: 'red' 
      }}>
        <Typography variant="h6">{error}</Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={fetchDashboardData}
          sx={{ mt: 2 }}
        >
          נסה שוב
        </Button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {navigationButtons.map((button) => (
            <Grid item xs={12} sm={4} key={button.path}>
              <Card 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
                onClick={() => navigate(button.path)}
              >
                <CardContent sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  p: 3,
                  backgroundColor: button.color,
                  color: 'white'
                }}>
                  {button.icon}
                  <Typography variant="h5" component="div" sx={{ mt: 2 }}>
                    {button.title}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} className={styles.dashboardHeader}>
          <h2>לוח בקרה</h2>
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<RefreshIcon />}
            onClick={fetchDashboardData}
            className={styles.refreshButton}
          >
            רענון נתונים
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">סה"כ ביקורים</Typography>
                  <Typography variant="h6">
                    {dashboardData.stats.totalVisits}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">קשישים פעילים</Typography>
                  <Typography variant="h6">
                    {dashboardData.stats.activeElderly}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">מתנדבים פעילים</Typography>
                  <Typography variant="h6">
                    {dashboardData.stats.activeVolunteers}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2">ביקורים השבוע</Typography>
                  <Typography variant="h6">
                    {dashboardData.stats.visitsThisWeek}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                מפת מתנדבים וקשישים
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Typography color="error">{error}</Typography>
              ) : (
                <MapView 
                  data={dashboardData} 
                  isAdminView={true}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Urgent Visits Table */}
        <Grid item xs={12}>
          <div className={styles.section}>
            <h3>קשישים הדורשים ביקור דחוף</h3>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>שם</TableCell>
                    <TableCell>כתובת</TableCell>
                    <TableCell>ביקור אחרון</TableCell>
                    <TableCell>ימים מהביקור האחרון</TableCell>
                    <TableCell>פעולות</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboardData.urgentVisits.map((visit) => (
                    <TableRow key={visit.elder._id} className={styles.urgentRow}>
                      <TableCell>
                        {visit.elder.firstName} {visit.elder.lastName}
                      </TableCell>
                      <TableCell>{visit.elder.address}</TableCell>
                      <TableCell>
                        {new Date(visit.lastVisit).toLocaleDateString('he-IL')}
                      </TableCell>
                      <TableCell>{visit.daysSinceLastVisit}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          href={`/visits/new?elderId=${visit.elder._id}`}
                        >
                          דווח ביקור
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard; 
import React, { useState, useEffect } from 'react';
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
import { fetchVisitStats, fetchUrgentVisits } from '../../services/api';
import MapView from '../MapView/MapView';
import styles from './Dashboard.module.css';
import { useNavigate } from 'react-router-dom';
import PeopleIcon from '@mui/icons-material/People';
import HistoryIcon from '@mui/icons-material/History';
import GroupIcon from '@mui/icons-material/Group';
import Box from '@mui/material/Box';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [urgentVisits, setUrgentVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // בדיקת הרשאות
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    loadDashboardData();
  }, [user, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsData, urgentData] = await Promise.all([
        fetchVisitStats(),
        fetchUrgentVisits()
      ]);
      
      setStats(statsData);
      setUrgentVisits(urgentData);
    } catch (err) {
      console.error('שגיאה בטעינת נתוני הדשבורד:', err);
      setError(err.message);
      
      if (err.message.includes('התחברות מחדש')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNavigate = (path) => {
    try {
      console.log('מנווט לנתיב:', path);
      navigate(path);
    } catch (error) {
      console.error('שגיאת ניווט:', error);
      setError('שגיאה בניווט לדף המבוקש');
    }
  };

  // כפתורי ניווט חדשים
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
    return <div className={styles.loading}>טוען...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.dashboard}>
      {/* כפתורי ניווט */}
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
                onClick={() => handleNavigate(button.path)}
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
            onClick={loadDashboardData}
            className={styles.refreshButton}
          >
            רענון נתונים
          </Button>
        </Grid>

        {/* Stats Cards Row */}
        <Grid item xs={12}>
          <Grid container spacing={2} className={styles.statsRow}>
            <Grid item xs={6} sm={3}>
              <Card className={styles.miniStatsCard}>
                <CardContent>
                  <Typography variant="subtitle2" component="h3">
                    סה"כ ביקורים
                  </Typography>
                  <Typography variant="h6" component="p">
                    {stats?.totalVisits || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Card className={styles.miniStatsCard}>
                <CardContent>
                  <Typography variant="subtitle2" component="h3">
                    קשישים פעילים
                  </Typography>
                  <Typography variant="h6" component="p">
                    {stats?.uniqueEldersCount || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Card className={styles.miniStatsCard}>
                <CardContent>
                  <Typography variant="subtitle2" component="h3">
                    ממוצע משך ביקור
                  </Typography>
                  <Typography variant="h6" component="p">
                    {stats?.averageVisitLength ? `${Math.round(stats.averageVisitLength)} דק'` : '-'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Card className={styles.miniStatsCard}>
                <CardContent>
                  <Typography variant="subtitle2" component="h3">
                    ביקורים השבוע
                  </Typography>
                  <Typography variant="h6" component="p">
                    {stats?.visitsThisWeek || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Map Section */}
        <Grid item xs={12}>
          <Card className={styles.mapCard}>
            <CardContent>
              <MapView />
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
                  {urgentVisits.map((visit) => (
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
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
import { fetchVisitStats, fetchUrgentVisits } from '../../services/api';
import MapView from '../MapView/MapView';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [urgentVisits, setUrgentVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [stats, urgentVisits] = await Promise.all([
        fetchVisitStats(),
        fetchUrgentVisits()
      ]);
      setStats(stats);
      setUrgentVisits(urgentVisits);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>טוען...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.dashboard}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <h2>לוח בקרה</h2>
        </Grid>

        <Grid item xs={12} md={4}>
          <Grid container spacing={3} className={styles.statsGrid}>
            <Grid item xs={12}>
              <Card className={styles.statsCard}>
                <CardContent>
                  <Typography variant="h6" component="h3">
                    סה"כ ביקורים
                  </Typography>
                  <Typography variant="h4" component="p">
                    {stats?.totalVisits || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card className={styles.statsCard}>
                <CardContent>
                  <Typography variant="h6" component="h3">
                    קשישים פעילים
                  </Typography>
                  <Typography variant="h4" component="p">
                    {stats?.uniqueEldersCount || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card className={styles.statsCard}>
                <CardContent>
                  <Typography variant="h6" component="h3">
                    ממוצע משך ביקור
                  </Typography>
                  <Typography variant="h4" component="p">
                    {stats?.averageVisitLength ? `${Math.round(stats.averageVisitLength)} דקות` : 'אין מידע'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card className={styles.statsCard}>
                <CardContent>
                  <Typography variant="h6" component="h3">
                    ביקורים השבוע
                  </Typography>
                  <Typography variant="h4" component="p">
                    {stats?.visitsThisWeek || 0}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card className={styles.mapCard}>
            <CardContent>
              <MapView />
            </CardContent>
          </Card>
        </Grid>

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
                        <button
                          className="button button-primary"
                          onClick={() => window.location.href = `/visits/new?elderId=${visit.elder._id}`}
                        >
                          דווח ביקור
                        </button>
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
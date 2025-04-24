import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchMapData, updateVisit, createVisit, fetchWithAuth } from '../../services/api';
import styles from './MapView.module.css';
import L from 'leaflet';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// תיקון אייקונים של Leaflet
delete L.Icon.Default.prototype._getIconUrl;

// הגדרת אייקונים שונים למתנדבים וזקנים
const elderlyIcon = new L.DivIcon({
  className: 'elderly-marker',
  html: `<div style="
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e74c3c; 
    color: white;
    width: 16px; 
    height: 16px; 
    border-radius: 50%; 
    border: 2px solid white;
    box-shadow: 0 0 4px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10]
});

const volunteerIcon = new L.DivIcon({
  className: 'volunteer-marker',
  html: `<div style="
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #000000; 
    color: white;
    width: 14px; 
    height: 14px; 
    border-radius: 50%; 
    border: 2px solid white;
    box-shadow: 0 0 4px rgba(0,0,0,0.4);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
  popupAnchor: [0, -9]
});

// קומפוננטה חדשה לעדכון המפה
const MapUpdater = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
};

// פונקציה לחישוב מרחק בין שתי נקודות בקילומטרים
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // רדיוס כדור הארץ בקילומטרים
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

const MapView = () => {
  const [mapData, setMapData] = useState({ elderly: [], volunteers: [] });
  const [error, setError] = useState(null);
  const [center, setCenter] = useState([31.7767, 35.2345]);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(5); // רדיוס חיפוש בקילומטרים
  const { user } = useAuth();
  const navigate = useNavigate();
  const [visitDialog, setVisitDialog] = useState({
    open: false,
    elderId: null,
    elderName: '',
    visitData: {
      status: 'scheduled',
      notes: '',
      duration: 30,
      date: new Date().toISOString().split('T')[0]
    }
  });
  const [visits, setVisits] = useState([]);

  useEffect(() => {
    // קבלת מיקום המשתמש
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setCenter([latitude, longitude]);
          loadMapData(latitude, longitude);
        },
        (error) => {
          console.error('שגיאה בקבלת מיקום:', error);
          loadMapData(center[0], center[1]);
        }
      );
    } else {
      loadMapData(center[0], center[1]);
    }

    // טעינת ביקורים אם המשתמש הוא מתנדב
    if (user?.role === 'volunteer') {
      loadVisits();
    }
  }, [user]);

  const loadMapData = async (lat, lng) => {
    try {
      const data = await fetchMapData(lat, lng);
      setMapData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadVisits = async () => {
    try {
      const data = await fetchWithAuth('/api/visits/my-visits');
      setVisits(data);
    } catch (err) {
      console.error('שגיאה בטעינת ביקורים:', err);
      setError(err.message);
    }
  };

  const handleNewVisit = (elderId, elderName) => {
    console.log('פתיחת דיאלוג ביקור חדש:', { elderId, elderName });
    if (!elderId) {
      console.error('ID קשיש חסר');
      return;
    }
    setVisitDialog({
      open: true,
      elderId,
      elderName,
      visitData: {
        status: 'scheduled',
        notes: '',
        duration: 30,
        date: new Date().toISOString().split('T')[0]
      }
    });
  };

  const handleVisitSubmit = async () => {
    try {
      console.log('נתוני המשתמש:', user);
      console.log('נתוני הדיאלוג:', visitDialog);
      
      if (!visitDialog.elderId) {
        console.error('ID קשיש חסר בדיאלוג');
        throw new Error('נדרש לציין קשיש');
      }

      if (!user?.id) {
        console.error('ID משתמש חסר:', user);
        throw new Error('נדרש לציין מתנדב');
      }

      const visitData = {
        elder: visitDialog.elderId,
        volunteer: user.id,
        date: visitDialog.visitData.date,
        duration: parseInt(visitDialog.visitData.duration),
        status: visitDialog.visitData.status,
        notes: visitDialog.visitData.notes
      };
      
      console.log('שולח נתוני ביקור:', visitData);
      
      const response = await createVisit(visitData);
      console.log('תגובת השרת:', response);
      
      // סגירת הדיאלוג
      setVisitDialog(prev => ({ ...prev, open: false }));
      
      // עדכון הנתונים במפה
      await loadMapData(center[0], center[1]);
      
      // עדכון טבלת הביקורים
      await loadVisits();
      
      // הצגת הודעת הצלחה
      alert('הביקור נוצר בהצלחה!');
    } catch (err) {
      console.error('שגיאה ביצירת ביקור:', err);
      setError(err.message || 'שגיאה ביצירת ביקור');
    }
  };

  const handleVisitChange = (e) => {
    const { name, value } = e.target;
    setVisitDialog(prev => ({
      ...prev,
      visitData: {
        ...prev.visitData,
        [name]: value
      }
    }));
  };

  // פילטור קשישים לפי אזור המתנדב ומרחק
  const getFilteredElderly = () => {
    if (user?.role !== 'volunteer') {
      return mapData.elderly;
    }

    if (!userLocation) {
      return [];
    }

    return mapData.elderly.filter(elder => {
      if (!elder.location?.coordinates) return false;
      
      const elderLat = elder.location.coordinates[1];
      const elderLng = elder.location.coordinates[0];
      
      const distance = calculateDistance(
        userLocation[0],
        userLocation[1],
        elderLat,
        elderLng
      );
      
      return distance <= searchRadius;
    });
  };

  const filteredElderly = getFilteredElderly();

  if (error) {
    return (
      <Container className={styles.container}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container className={styles.container}>
      <Paper className={styles.mapContainer}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1" className={styles.title}>
            מפת ביקורים
          </Typography>
          
          {user?.role === 'volunteer' && (
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>רדיוס חיפוש</InputLabel>
              <Select
                value={searchRadius}
                onChange={(e) => setSearchRadius(e.target.value)}
                label="רדיוס חיפוש"
              >
                <MenuItem value={2}>2 ק"מ</MenuItem>
                <MenuItem value={5}>5 ק"מ</MenuItem>
                <MenuItem value={10}>10 ק"מ</MenuItem>
                <MenuItem value={20}>20 ק"מ</MenuItem>
              </Select>
            </FormControl>
          )}
        </Box>
        
        <div className={styles.map}>
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <MapUpdater center={center} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* הצגת אזור החיפוש */}
            {user?.role === 'volunteer' && userLocation && (
              <Circle
                center={userLocation}
                radius={searchRadius * 1000}
                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
              />
            )}
            
            {filteredElderly.map((elder) => (
              <Marker
                key={elder._id}
                position={[
                  elder.location.coordinates[1],
                  elder.location.coordinates[0]
                ]}
                icon={elderlyIcon}
              >
                <Popup>
                  <div>
                    <h3>{elder.firstName} {elder.lastName}</h3>
                    <p>כתובת: {elder.address}</p>
                    <p>סטטוס: {elder.status}</p>
                    {user?.role === 'volunteer' && userLocation && (
                      <p>
                        מרחק: {calculateDistance(
                          userLocation[0],
                          userLocation[1],
                          elder.location.coordinates[1],
                          elder.location.coordinates[0]
                        ).toFixed(1)} ק"מ
                      </p>
                    )}
                    <p>
                      ביקור אחרון:{' '}
                      {elder.lastVisit
                        ? new Date(elder.lastVisit).toLocaleDateString('he-IL')
                        : 'אין ביקורים'}
                    </p>
                    {user?.role === 'volunteer' && (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => handleNewVisit(elder._id, `${elder.firstName} ${elder.lastName}`)}
                        sx={{ mt: 1 }}
                      >
                        תאם ביקור חדש
                      </Button>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* סימון מתנדבים - רק למנהלים */}
            {user?.role === 'admin' && mapData.volunteers.map((volunteer) => (
              <Marker
                key={volunteer._id}
                position={[
                  volunteer.location.coordinates[1],
                  volunteer.location.coordinates[0]
                ]}
                icon={volunteerIcon}
              >
                <Popup>
                  <div>
                    <h3>{volunteer.firstName} {volunteer.lastName}</h3>
                    <p>סטטוס: {volunteer.status}</p>
                    <p>
                      פעיל לאחרונה:{' '}
                      {volunteer.lastActive
                        ? new Date(volunteer.lastActive).toLocaleDateString('he-IL')
                        : 'לא ידוע'}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </Paper>

      {/* טבלת ביקורים למתנדב */}
      {user?.role === 'volunteer' && (
        <Paper className={styles.visitsTable} sx={{ mt: 2, p: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            ביקורים שלי
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>תאריך</TableCell>
                  <TableCell>שעה</TableCell>
                  <TableCell>קשיש</TableCell>
                  <TableCell>כתובת</TableCell>
                  <TableCell>משך (דקות)</TableCell>
                  <TableCell>סטטוס</TableCell>
                  <TableCell>הערות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(visits) && visits.length > 0 ? (
                  visits.map((visit) => (
                    <TableRow key={visit._id}>
                      <TableCell>
                        {new Date(visit.date).toLocaleDateString('he-IL')}
                      </TableCell>
                      <TableCell>
                        {new Date(visit.date).toLocaleTimeString('he-IL')}
                      </TableCell>
                      <TableCell>
                        {visit.elder ? `${visit.elder.firstName} ${visit.elder.lastName}` : 'לא ידוע'}
                      </TableCell>
                      <TableCell>
                        {visit.elder?.address || 'לא ידוע'}
                      </TableCell>
                      <TableCell>{visit.duration}</TableCell>
                      <TableCell>
                        {visit.status === 'scheduled' ? 'מתוכנן' :
                         visit.status === 'completed' ? 'בוצע' :
                         visit.status === 'cancelled' ? 'בוטל' : visit.status}
                      </TableCell>
                      <TableCell>{visit.notes}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      אין ביקורים להצגה
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* דיאלוג עדכון ביקור */}
      <Dialog open={visitDialog.open} onClose={() => setVisitDialog(prev => ({ ...prev, open: false }))}>
        <DialogTitle>תיאום ביקור חדש - {visitDialog.elderName}</DialogTitle>
        <DialogContent>
          <input type="hidden" name="elderId" value={visitDialog.elderId} />
          <TextField
            fullWidth
            margin="normal"
            label="תאריך הביקור"
            name="date"
            type="date"
            value={visitDialog.visitData.date}
            onChange={handleVisitChange}
            InputLabelProps={{
              shrink: true,
            }}
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="משך הביקור (דקות)"
            name="duration"
            type="number"
            value={visitDialog.visitData.duration}
            onChange={handleVisitChange}
            required
            inputProps={{ min: 1 }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>סטטוס הביקור</InputLabel>
            <Select
              name="status"
              value={visitDialog.visitData.status}
              onChange={handleVisitChange}
              label="סטטוס הביקור"
              required
            >
              <MenuItem value="scheduled">מתוכנן</MenuItem>
              <MenuItem value="completed">בוצע</MenuItem>
              <MenuItem value="cancelled">בוטל</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            margin="normal"
            label="הערות"
            name="notes"
            multiline
            rows={4}
            value={visitDialog.visitData.notes}
            onChange={handleVisitChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVisitDialog(prev => ({ ...prev, open: false }))}>
            ביטול
          </Button>
          <Button 
            onClick={handleVisitSubmit} 
            variant="contained" 
            color="primary"
            disabled={!visitDialog.elderId || !visitDialog.visitData.date || !visitDialog.visitData.duration}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MapView; 
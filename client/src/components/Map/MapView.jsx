import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchMapData, updateVisit, createVisit } from '../../services/api';
import styles from './MapView.module.css';
import L from 'leaflet';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// תיקון אייקונים של Leaflet
delete L.Icon.Default.prototype._getIconUrl;

// הגדרת אייקונים שונים למתנדבים וזקנים
const elderlyIcon = new L.Icon({
  iconUrl: '/elderly-marker.png',
  iconRetinaUrl: '/elderly-marker-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: '/marker-shadow.png',
  shadowSize: [41, 41]
});

const volunteerIcon = new L.Icon({
  iconUrl: '/volunteer-marker.png',
  iconRetinaUrl: '/volunteer-marker-2x.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: '/marker-shadow.png',
  shadowSize: [41, 41]
});

// קומפוננטה חדשה לעדכון המפה
const MapUpdater = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
};

const MapView = () => {
  const [mapData, setMapData] = useState({ elderly: [], volunteers: [] });
  const [error, setError] = useState(null);
  const [center, setCenter] = useState([31.7767, 35.2345]); // מרכז ירושלים כברירת מחדל
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

  useEffect(() => {
    // קבלת מיקום המשתמש
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
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
  }, []);

  const loadMapData = async (lat, lng) => {
    try {
      const data = await fetchMapData(lat, lng);
      setMapData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleNewVisit = (elderId, elderName) => {
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
      const visitData = {
        ...visitDialog.visitData,
        elderId: visitDialog.elderId,
        volunteerId: user._id
      };
      
      await createVisit(visitData);
      setVisitDialog(prev => ({ ...prev, open: false }));
      loadMapData(center[0], center[1]);
    } catch (err) {
      setError(err.message);
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

  if (error) {
    return (
      <Container className={styles.container}>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  // פילטור זקנים לפי אזור המתנדב
  const filteredElderly = user?.role === 'volunteer' 
    ? mapData.elderly.filter(elder => elder.area === user.area)
    : mapData.elderly;

  return (
    <Container className={styles.container}>
      <Paper className={styles.mapContainer}>
        <Typography variant="h4" component="h1" className={styles.title}>
          מפת ביקורים
        </Typography>
        
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
            
            {/* סימון זקנים */}
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

      {/* דיאלוג עדכון ביקור */}
      <Dialog open={visitDialog.open} onClose={() => setVisitDialog(prev => ({ ...prev, open: false }))}>
        <DialogTitle>תיאום ביקור חדש - {visitDialog.elderName}</DialogTitle>
        <DialogContent>
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
          />

          <TextField
            fullWidth
            margin="normal"
            label="משך הביקור (דקות)"
            name="duration"
            type="number"
            value={visitDialog.visitData.duration}
            onChange={handleVisitChange}
          />

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
          <Button onClick={handleVisitSubmit} variant="contained" color="primary">
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MapView; 
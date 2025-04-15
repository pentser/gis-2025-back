import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchMapData } from '../../services/api';
import styles from './MapView.module.css';
import L from 'leaflet';

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

const MapView = () => {
  const [mapData, setMapData] = useState({ elderly: [], volunteers: [] });
  const [error, setError] = useState(null);
  const [center] = useState([31.7767, 35.2345]); // מרכז ירושלים כברירת מחדל

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      const data = await fetchMapData();
      setMapData(data);
    } catch (err) {
      setError(err.message);
    }
  };

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
        <Typography variant="h4" component="h1" className={styles.title}>
          מפת ביקורים
        </Typography>
        
        <div className={styles.map}>
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* סימון זקנים */}
            {mapData.elderly.map((elder) => (
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
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* סימון מתנדבים */}
            {mapData.volunteers.map((volunteer) => (
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
    </Container>
  );
};

export default MapView; 
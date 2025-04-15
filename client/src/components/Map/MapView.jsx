import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchMapData } from '../../services/api';
import styles from './MapView.module.css';
import L from 'leaflet';

// תיקון אייקונים של Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/marker-icon-2x.png',
  iconUrl: '/marker-icon.png',
  shadowUrl: '/marker-shadow.png',
});

const MapView = () => {
  const [locations, setLocations] = useState([]);
  const [error, setError] = useState(null);
  const [center] = useState([31.7767, 35.2345]); // מרכז ירושלים כברירת מחדל

  useEffect(() => {
    loadMapData();
  }, []);

  const loadMapData = async () => {
    try {
      const data = await fetchMapData();
      setLocations(data);
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
            {locations.map((location) => (
              <Marker
                key={location._id}
                position={[location.latitude, location.longitude]}
              >
                <Popup>
                  <div>
                    <h3>{location.elderlyName}</h3>
                    <p>כתובת: {location.address}</p>
                    <p>סטטוס: {location.status}</p>
                    <p>
                      ביקור אחרון:{' '}
                      {location.lastVisit
                        ? new Date(location.lastVisit).toLocaleDateString('he-IL')
                        : 'אין ביקורים'}
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
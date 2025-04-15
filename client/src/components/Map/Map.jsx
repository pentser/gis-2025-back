import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useAppContext } from '../../context/AppContext';
import { Icon } from 'leaflet';
import api from '../../api/api';
import styles from './Map.module.css';
import 'leaflet/dist/leaflet.css';

// יצירת אייקון מותאם לקשישים
const elderlyIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

// קומפוננטה לעדכון מרכז המפה
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const Map = () => {
  const { loading } = useAppContext();
  const [elderly, setElderly] = useState([]);
  const [center, setCenter] = useState([31.7683, 35.2137]); // ירושלים כברירת מחדל
  const [userLocation, setUserLocation] = useState(null);

  // קבלת מיקום המשתמש
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setCenter([latitude, longitude]);
          fetchNearbyElderly(longitude, latitude);
        },
        (error) => {
          console.error('שגיאה בקבלת מיקום:', error);
          // במקרה של שגיאה, נטען את כל הקשישים
          fetchAllElderly();
        }
      );
    } else {
      fetchAllElderly();
    }
  }, []);

  // קבלת קשישים בקרבת מקום
  const fetchNearbyElderly = async (longitude, latitude) => {
    try {
      const response = await api.get('/api/elderly/nearby', {
        params: {
          longitude,
          latitude,
          maxDistance: 5000 // 5 ק"מ
        }
      });
      setElderly(response.data);
    } catch (error) {
      console.error('שגיאה בטעינת קשישים:', error);
    }
  };

  // קבלת כל הקשישים
  const fetchAllElderly = async () => {
    try {
      const response = await api.get('/api/elderly');
      setElderly(response.data);
    } catch (error) {
      console.error('שגיאה בטעינת קשישים:', error);
    }
  };

  if (loading) {
    return <div>טוען מפה...</div>;
  }

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        center={center}
        zoom={13}
        className={styles.map}
      >
        <MapUpdater center={center} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* סימון מיקום המשתמש */}
        {userLocation && (
          <Marker position={userLocation}>
            <Popup>המיקום שלך</Popup>
          </Marker>
        )}

        {/* סימון הקשישים */}
        {elderly.map((elder) => (
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
                <p>כתובת: {elder.address.street}, {elder.address.city}</p>
                <p>טלפון: {elder.phone}</p>
                {elder.needs?.length > 0 && (
                  <p>צרכים: {elder.needs.join(', ')}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default Map; 
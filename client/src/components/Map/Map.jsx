import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useAppContext } from '../../context/AppContext';
import { Icon } from 'leaflet';
import api from '../../api/api';
import styles from './Map.module.css';
import 'leaflet/dist/leaflet.css';

// פונקציה לחישוב דחיפות הביקור
const calculateUrgency = (elder) => {
  // אם הקשיש לא פעיל, תמיד מחזירים דחיפות נמוכה
  if (elder.status === 'inactive') {
    console.log('Inactive elderly - low urgency');
    return 'low';
  }

  // הדפסת מידע מפורט על הקשיש בתחילת הפונקציה
  console.log('Calculating urgency for elderly:', elder._id);
  console.log('Elderly name:', elder.firstName, elder.lastName);
  console.log('Status:', elder.status);
  console.log('Last visit date:', elder.lastVisit);

  try {
    // אם הסטטוס הוא 'visited' אבל אין תאריך ביקור אחרון, מעדכנים לדחיפות בינונית
    if (elder.status === 'visited' && !elder.lastVisit) {
      console.log('Status is visited but missing last visit date - medium urgency');
      return 'medium';
    }
    
    // אם אין תאריך ביקור אחרון, דחיפות גבוהה
    if (!elder.lastVisit) {
      console.log('No last visit date - high urgency');
      return 'high';
    }

    const lastVisitDate = new Date(elder.lastVisit);
    const today = new Date();
    console.log('Today date:', today.toISOString());
    console.log('Last visit date after conversion:', lastVisitDate.toISOString());

    // חישוב מספר הימים מאז הביקור האחרון
    const timeDiff = today.getTime() - lastVisitDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    console.log('Days since last visit:', daysDiff);

    // עדכון הדחיפות בהתאם למספר הימים
    if (daysDiff > 21) {
      console.log('High urgency (more than 21 days)');
      return 'high';
    } else if (daysDiff > 10) {
      console.log('Medium urgency (between 10 and 21 days)');
      return 'medium';
    } else {
      console.log('Low urgency (less than 10 days)');
      return 'low';
    }
  } catch (error) {
    console.error('שגיאה בחישוב דחיפות:', error);
    console.log('Returning high urgency due to error');
    return 'high';
  }
};

// יצירת אייקונים פשוטים לזקנים לפי דחיפות
const createElderlyIcon = (urgency) => {
  // צבעים לפי רמת דחיפות
  const colors = {
    high: '#e74c3c', // אדום - דחיפות גבוהה
    medium: '#f39c12', // כתום - דחיפות בינונית
    low: '#2ecc71' // ירוק - דחיפות נמוכה
  };

  return new Icon({
    iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'%3E%3Ccircle cx='8' cy='8' r='8' fill='${colors[urgency].replace('#', '%23')}' /%3E%3C/svg%3E`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
  });
};

// אייקון פשוט למתנדבים (סיכה שחורה)
const volunteerIcon = new Icon({
  iconUrl: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 14 14'%3E%3Ccircle cx='7' cy='7' r='7' fill='%23000000' /%3E%3C/svg%3E`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -7]
});

// קומפוננטה לעדכון מרכז המפה
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

// קומפוננטת מקרא למפה
const MapLegend = () => {
  return (
    <div className={styles.mapLegend}>
      <h3>מקרא</h3>
      <div className={styles.legendItem}>
        <div className={styles.legendIcon} style={{ backgroundColor: '#e74c3c' }}></div>
        <span>Elderly - High urgency (more than 21 days)</span>
      </div>
      <div className={styles.legendItem}>
        <div className={styles.legendIcon} style={{ backgroundColor: '#f39c12' }}></div>
        <span>Elderly - Medium urgency (between 10 and 21 days)</span>
      </div>
      <div className={styles.legendItem}>
        <div className={styles.legendIcon} style={{ backgroundColor: '#2ecc71' }}></div>
        <span>Elderly - Low urgency (less than 10 days)</span>
      </div>
      <div className={styles.legendItem}>
        <div className={styles.legendIcon} style={{ backgroundColor: '#000000' }}></div>
        <span>Volunteer</span>
      </div>
    </div>
  );
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
      console.log(`Sending API request to get elderly nearby: long=${longitude}, lat=${latitude}`);
      const response = await api.get('/api/elderly/nearby', {
        params: {
          longitude,
          latitude,
          maxDistance: 5000 // 5 ק"מ
        }
      });
      
      console.log('API response received successfully:', response.status);
      console.log('Response type:', typeof response.data);
      console.log('Response length:', Array.isArray(response.data) ? response.data.length : 'not array');
      
      // בדיקת נתוני הקשישים
      console.log('=== Elderly data received ===');
      response.data.forEach(elder => {
        console.log(`Name: ${elder.firstName} ${elder.lastName}, ID: ${elder._id}`);
        console.log(`Status: ${elder.status}, Last visit date: ${elder.lastVisit}`);
        if (elder.lastVisit) {
          console.log(`Date after conversion: ${new Date(elder.lastVisit).toISOString()}`);
          console.log(`Days since last visit: ${((Date.now() - new Date(elder.lastVisit)) / (1000 * 60 * 60 * 24)).toFixed(1)}`);
        }
        console.log('----------------------');
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
      
      // בדיקת נתוני הקשישים
      console.log('=== All elderly data ===');
      response.data.forEach(elder => {
        console.log(`Name: ${elder.firstName} ${elder.lastName}, ID: ${elder._id}`);
        console.log(`Status: ${elder.status}, Last visit date: ${elder.lastVisit}`);
        if (elder.lastVisit) {
          console.log(`Date after conversion: ${new Date(elder.lastVisit).toISOString()}`);
          console.log(`Days since last visit: ${((Date.now() - new Date(elder.lastVisit)) / (1000 * 60 * 60 * 24)).toFixed(1)}`);
        }
        console.log('----------------------');
      });
      
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
        {elderly.map((elder) => {
          console.log(`Displaying elderly on map: ${elder.firstName} ${elder.lastName}, urgency: ${calculateUrgency(elder)}`);
          return (
            <Marker
              key={elder._id}
              position={[
                elder.location.coordinates[1],
                elder.location.coordinates[0]
              ]}
              icon={createElderlyIcon(calculateUrgency(elder))}
            >
              <Popup>
                <div>
                  <h3>{elder.firstName} {elder.lastName}</h3>
                  <p>Address: {elder.address.street}, {elder.address.city}</p>
                  <p>Phone: {elder.phone}</p>
                  <p>Last visit: {elder.lastVisit ? new Date(elder.lastVisit).toLocaleDateString('he-IL') : 'No visit'}</p>
                  <p>Days since last visit: {
                    !elder.lastVisit ? 'No previous visit' :
                    Math.floor((new Date() - new Date(elder.lastVisit)) / (1000 * 60 * 60 * 24)) + ' days'
                  }</p>
                  <p>Urgency: {
                    calculateUrgency(elder) === 'high' ? 'High' :
                    calculateUrgency(elder) === 'medium' ? 'Medium' : 'Low'
                  }</p>
                  {elder.needs?.length > 0 && (
                    <p>Needs: {elder.needs.join(', ')}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      <MapLegend />
    </div>
  );
};

export default Map; 
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { useAuth } from '../../context/AuthContext';
import MyLocationIcon from '@mui/icons-material/MyLocation';

// יצירת אייקונים פשוטים לזקנים לפי דחיפות
const createElderlyIcon = (urgency) => {
  // צבעים ותוויות לפי רמת דחיפות
  const colors = {
    high: '#e74c3c', // אדום - דחיפות גבוהה
    medium: '#f39c12', // כתום - דחיפות בינונית
    low: '#2ecc71' // ירוק - דחיפות נמוכה
  };

  return new L.DivIcon({
    className: 'elderly-marker',
    html: `<div style="
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${colors[urgency]}; 
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
};

// אייקון פשוט למתנדבים (סיכה שחורה)
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

// קומפוננטת עדכון מרכז המפה
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

// קומפוננטת בחירת מיקום משופרת עם כפתור GPS
const LocationSelector = ({ userLocation, onLocationChange, useGpsLocation }) => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const geocodeAddress = async () => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      // שימוש ב-Nominatim של OpenStreetMap לקבלת קואורדינטות מכתובת
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}, Israel`
      );
      const data = await response.json();
      
      if (data && data[0]) {
        onLocationChange([parseFloat(data[0].lat), parseFloat(data[0].lon)]);
      } else {
        alert('לא נמצאו תוצאות לכתובת זו');
      }
    } catch (error) {
      console.error('שגיאה בקבלת קואורדינטות:', error);
      alert('שגיאה בקבלת קואורדינטות');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="location-selector">
      <div className="location-input-container">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="הכנס כתובת..."
          className="address-input"
        />
        <button 
          onClick={geocodeAddress}
          disabled={isLoading}
          className="address-button"
        >
          {isLoading ? 'מחפש...' : 'עדכן מיקום'}
        </button>
      </div>
      <button 
        onClick={useGpsLocation}
        className="gps-button"
        title="השתמש במיקום GPS נוכחי"
      >
        <MyLocationIcon /> השתמש במיקום הנוכחי
      </button>
    </div>
  );
};

// קומפוננטת סטטיסטיקות
const StatsPanel = ({ mapData }) => {
  // וידוא שהנתונים קיימים ותקינים
  const elderly = Array.isArray(mapData.elderly) ? mapData.elderly : [];
  const volunteers = Array.isArray(mapData.volunteers) ? mapData.volunteers : [];
  
  // חישוב סטטיסטיקות בצורה בטוחה
  const stats = {
    totalElderly: elderly.length,
    needVisit: elderly.filter(e => e && e.status === 'needs_visit').length,
    availableVolunteers: volunteers.filter(v => v && v.status === 'available').length,
    averageDistance: elderly.length > 0 
      ? elderly.reduce((acc, curr) => curr && curr.distanceFromCurrentLocation 
          ? acc + curr.distanceFromCurrentLocation 
          : acc, 0) / elderly.length 
      : 0
  };

  return (
    <div className="stats-panel">
      <h3>סטטיסטיקות אזור</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">{stats.totalElderly}</span>
          <span className="stat-label">זקנים באזור</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.needVisit}</span>
          <span className="stat-label">זקוקים לביקור</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.availableVolunteers}</span>
          <span className="stat-label">מתנדבים זמינים</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.averageDistance.toFixed(1)}</span>
          <span className="stat-label">מרחק ממוצע (ק"מ)</span>
        </div>
      </div>
    </div>
  );
};

// קומפוננטת הפילטרים
const FilterPanel = ({ filters, setFilters }) => {
  return (
    <div className="filter-panel">
      <h3>פילטרים</h3>
      
      <div className="filter-section">
        <h4>חיפוש</h4>
        <input
          type="text"
          placeholder="חיפוש לפי שם או כתובת..."
          value={filters.searchTerm}
          onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
          className="search-input"
        />
      </div>

      <div className="filter-section">
        <h4>רדיוס חיפוש</h4>
        <input
          type="range"
          min="1"
          max="20"
          value={filters.radius}
          onChange={(e) => setFilters({ ...filters, radius: e.target.value })}
        />
        <span>{filters.radius} ק"מ</span>
      </div>

      <div className="filter-section">
        <h4>סטטוס זקנים</h4>
        <select
          value={filters.elderlyStatus}
          onChange={(e) => setFilters({ ...filters, elderlyStatus: e.target.value })}
        >
          <option value="">הכל</option>
          <option value="needs_visit">זקוק לביקור</option>
          <option value="visited">בוקר לאחרונה</option>
        </select>
      </div>

      <div className="filter-section">
        <h4>סטטוס מתנדבים</h4>
        <select
          value={filters.volunteerStatus}
          onChange={(e) => setFilters({ ...filters, volunteerStatus: e.target.value })}
        >
          <option value="">הכל</option>
          <option value="available">זמין</option>
          <option value="busy">עסוק</option>
        </select>
      </div>

      <div className="filter-section">
        <h4>ביקור אחרון</h4>
        <select
          value={filters.lastVisitDays}
          onChange={(e) => setFilters({ ...filters, lastVisitDays: e.target.value })}
        >
          <option value="">הכל</option>
          <option value="7">שבוע אחרון</option>
          <option value="14">שבועיים אחרונים</option>
          <option value="30">חודש אחרון</option>
        </select>
      </div>

      <div className="filter-section">
        <h4>הצג מסלול מומלץ</h4>
        <button
          className={`route-button ${filters.showRoute ? 'active' : ''}`}
          onClick={() => setFilters({ ...filters, showRoute: !filters.showRoute })}
        >
          {filters.showRoute ? 'הסתר מסלול' : 'הצג מסלול'}
        </button>
      </div>
    </div>
  );
};

// פונקציה לחישוב דחיפות הביקור
const calculateUrgency = (elder) => {
  // אם הקשיש לא פעיל, תמיד מחזירים דחיפות נמוכה
  if (elder.status === 'inactive') {
    console.log('קשיש לא פעיל - דחיפות נמוכה');
    return 'low';
  }

  // הדפסת מידע מפורט על הקשיש בתחילת הפונקציה
  console.log('----------------------------------------');
  console.log('חישוב דחיפות לקשיש:', elder._id);
  console.log('שם הקשיש:', elder.firstName, elder.lastName);
  console.log('סטטוס:', elder.status);
  console.log('תאריך ביקור אחרון:', elder.lastVisit);

  try {
    // אם הסטטוס הוא 'visited' אבל אין תאריך ביקור אחרון, מעדכנים לדחיפות בינונית
    if (elder.status === 'visited' && !elder.lastVisit) {
      console.log('סטטוס הוא visited אך חסר תאריך ביקור אחרון - דחיפות בינונית');
      return 'medium';
    }
    
    // אם אין תאריך ביקור אחרון, דחיפות גבוהה
    if (!elder.lastVisit) {
      console.log('אין תאריך ביקור אחרון - דחיפות גבוהה');
      return 'high';
    }

    const lastVisitDate = new Date(elder.lastVisit);
    const today = new Date();
    console.log('תאריך היום:', today.toISOString());
    console.log('תאריך ביקור אחרון לאחר המרה:', lastVisitDate.toISOString());

    // חישוב מספר הימים מאז הביקור האחרון
    const timeDiff = today.getTime() - lastVisitDate.getTime();
    const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));
    console.log('מספר ימים מאז הביקור האחרון:', daysDiff);

    // עדכון הדחיפות בהתאם למספר הימים
    if (daysDiff > 21) {
      console.log('דחיפות גבוהה (יותר מ-21 יום)');
      return 'high';
    } else if (daysDiff > 10) {
      console.log('דחיפות בינונית (בין 10 ל-21 יום)');
      return 'medium';
    } else {
      console.log('דחיפות נמוכה (פחות מ-10 ימים)');
      return 'low';
    }
  } catch (error) {
    console.error('שגיאה בחישוב דחיפות:', error);
    console.log('מחזיר דחיפות גבוהה בשל שגיאה');
    return 'high';
  }
};

// פונקציה לחישוב מסלול אופטימלי
const calculateOptimalRoute = (elderly, startPoint) => {
  // מיון לפי דחיפות ומרחק
  return elderly
    // מסנן רק קשישים פעילים
    .filter(elder => elder.status === 'פעיל')
    .sort((a, b) => {
      const urgencyA = calculateUrgency(a);
      const urgencyB = calculateUrgency(b);
      if (urgencyA !== urgencyB) {
        // דחיפות גבוהה תתקבל תחילה, אחריה בינונית, ולבסוף נמוכה
        if (urgencyA === 'high') return -1;
        if (urgencyB === 'high') return 1;
        if (urgencyA === 'medium') return -1;
        return 1;
      }
      // אם הדחיפות זהה, מיין לפי מרחק
      return a.distanceFromCurrentLocation - b.distanceFromCurrentLocation;
    })
    .slice(0, 5); // מקסימום 5 נקודות במסלול
};

// קומפוננטת מקרא למפה
const MapLegend = () => {
  return (
    <div className="map-legend">
      <h3>מקרא</h3>
      <div className="legend-item">
        <div className="legend-icon" style={{ backgroundColor: '#e74c3c' }}></div>
        <span>דחיפות גבוהה (מעל 21 יום ללא ביקור או אין ביקור כלל)</span>
      </div>
      <div className="legend-item">
        <div className="legend-icon" style={{ backgroundColor: '#f39c12' }}></div>
        <span>דחיפות בינונית (בין 11 ל-21 יום ללא ביקור)</span>
      </div>
      <div className="legend-item">
        <div className="legend-icon" style={{ backgroundColor: '#2ecc71' }}></div>
        <span>דחיפות נמוכה (פחות מ-10 ימים או קשיש לא פעיל)</span>
      </div>
      <div className="legend-item">
        <div className="legend-icon" style={{ backgroundColor: '#000000' }}></div>
        <span>מתנדב</span>
      </div>
    </div>
  );
};

// קומפוננטת המפה הראשית
const MapView = () => {
  const [mapData, setMapData] = useState({ elderly: [], volunteers: [] });
  const [filters, setFilters] = useState({
    radius: 10,
    elderlyStatus: '',
    volunteerStatus: '',
    lastVisitDays: '',
    searchTerm: '',
    showRoute: false
  });
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const { user } = useAuth();

  // פונקציה לקבלת מיקום מה-GPS
  const getGpsLocation = () => {
    setIsLoadingLocation(true);
    console.log('מנסה לקבל מיקום GPS...');
    
    if (!navigator.geolocation) {
      console.error('דפדפן לא תומך ב-Geolocation API');
      setUserLocation([32.0853, 34.7818]); // ברירת מחדל - תל אביב
      setIsLoadingLocation(false);
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log('התקבל מיקום GPS:', lat, lon);
        setUserLocation([lat, lon]);
        setIsLoadingLocation(false);
      },
      (error) => {
        console.error('שגיאה בקבלת מיקום GPS:', error.code, error.message);
        // פירוט קודי השגיאה לצורך ניפוי טוב יותר
        switch(error.code) {
          case error.PERMISSION_DENIED:
            console.error('משתמש דחה בקשת מיקום');
            break;
          case error.POSITION_UNAVAILABLE:
            console.error('מידע מיקום לא זמין');
            break;
          case error.TIMEOUT:
            console.error('פג זמן בקשת המיקום');
            break;
          case error.UNKNOWN_ERROR:
            console.error('שגיאה לא ידועה');
            break;
        }
        
        // אם יש כבר מיקום, נשאר בו, אחרת נשתמש בברירת המחדל
        if (!userLocation) {
          console.log('אין מיקום קיים, משתמש בברירת מחדל - תל אביב');
          setUserLocation([32.0853, 34.7818]); // ברירת מחדל - תל אביב
        } else {
          console.log('נשאר עם המיקום הקיים:', userLocation);
        }
        setIsLoadingLocation(false);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 60000 
      }
    );
  };

  // פונקציה להמרת כתובת לקואורדינטות
  const geocodeAddress = async (address) => {
    if (!address) return null;
    
    try {
      console.log('מנסה להמיר כתובת:', address);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}, Israel`
      );
      const data = await response.json();
      
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        console.log('התקבלו קואורדינטות:', lat, lon);
        
        if (isNaN(lat) || isNaN(lon)) {
          console.error('קואורדינטות לא תקינות');
          return null;
        }
        
        return [lat, lon];
      }
      console.log('לא נמצאו קואורדינטות לכתובת');
      return null;
    } catch (error) {
      console.error('שגיאה בהמרת כתובת לקואורדינטות:', error);
      return null;
    }
  };
  
  // פונקציה לקבלת מיקום המשתמש מהשרת
  const getUserLocation = async () => {
    try {
      console.log('מנסה לקבל מיקום משתמש מהשרת');
      // לוודא שיש טוקן
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('אין טוקן, לא ניתן לבקש מיקום מהשרת');
        return null;
      }

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`שגיאת שרת: ${response.status} - ${response.statusText}`);
        const errorText = await response.text();
        console.error('תוכן השגיאה:', errorText);
        throw new Error(`שגיאת שרת: ${response.status}`);
      }
      
      // לוודא שהנתונים בפורמט JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('התגובה אינה בפורמט JSON:', contentType);
        throw new Error('התגובה אינה בפורמט JSON');
      }

      const userData = await response.json();
      console.log('מידע משתמש מהשרת (מלא):', JSON.stringify(userData));
      
      // בדיקה מפורטת יותר אם יש מיקום שמור תקין
      if (userData.location) {
        console.log('נמצא שדה מיקום במידע המשתמש:', JSON.stringify(userData.location));
        
        try {
          // בדיקה שיש קואורדינטות
          if (userData.location.coordinates && Array.isArray(userData.location.coordinates) && userData.location.coordinates.length >= 2) {
            const coordinates = userData.location.coordinates;
            console.log('קואורדינטות גולמיות מהשרת:', coordinates);
            
            // נסה להמיר למספרים אם צריך
            const lon = parseFloat(coordinates[0]);
            const lat = parseFloat(coordinates[1]);
            
            console.log('אחרי המרה למספרים:', {lon, lat});
            
            // וידוא שהערכים הם מספרים תקינים
            if (!isNaN(lon) && !isNaN(lat) && 
                lon >= -180 && lon <= 180 && 
                lat >= -90 && lat <= 90) {
              
              // שים לב: ב-GeoJSON הסדר הוא [lon, lat], אבל ב-Leaflet הסדר הוא [lat, lon]
              console.log('קואורדינטות תקינות מהמסד נתונים, ממיר לפורמט Leaflet:', [lat, lon]);
              
              // החזר מיד את המיקום - אל תמשיך לבדוק דברים אחרים
              return [lat, lon]; // ממיר לפורמט של Leaflet
            } else {
              console.error('ערכי קואורדינטות מחוץ לטווח או לא תקינים:', {lon, lat});
            }
          } else {
            console.log('אין קואורדינטות תקינות במיקום, מבנה המיקום:', userData.location);
          }
        } catch (locationErr) {
          console.error('שגיאה בעיבוד מיקום המשתמש:', locationErr);
        }
      } else {
        console.log('אין שדה מיקום במידע המשתמש');
      }
      
      // אם הגענו לכאן, אין קואורדינטות תקינות במיקום
      
      // אם אין מיקום שמור אבל יש כתובת, ננסה להמיר אותה
      if (userData.address) {
        console.log('מנסה להמיר כתובת המשתמש:', userData.address);
        const addressCoords = await geocodeAddress(userData.address);
        if (addressCoords) {
          console.log('התקבלו קואורדינטות מהכתובת:', addressCoords);
          return addressCoords;
        } else {
          console.log('לא התקבלו קואורדינטות מהכתובת');
        }
      } else {
        console.log('אין כתובת במידע המשתמש');
      }
      
      console.log('לא נמצא מיקום תקין מהשרת, חוזר null');
      return null;
    } catch (error) {
      console.error('שגיאה בקבלת מידע משתמש:', error);
      return null;
    }
  };

  useEffect(() => {
    // קודם כל, ננסה להשתמש במיקום המשתמש מהשרת או מהכתובת
    const loadInitialLocation = async () => {
      setIsLoadingLocation(true);
      
      // קודם ננסה לקבל מיקום מהשרת
      console.log('מתחיל טעינת מיקום התחלתי...');
      const serverLocation = await getUserLocation();
      
      if (serverLocation) {
        console.log('התקבל מיקום מהשרת/כתובת, משתמש בו:', serverLocation);
        setUserLocation(serverLocation);
        setIsLoadingLocation(false);
        return;
      }
      
      console.log('לא התקבל מיקום מהשרת, בודק כתובת משתמש...');
      
      // אם אין מיקום מהשרת ויש כתובת למשתמש, ננסה להמיר אותה
      if (user && user.address) {
        try {
          console.log('מנסה להשתמש בכתובת המשתמש ממצב האפליקציה:', user.address);
          const coordinates = await geocodeAddress(user.address);
          
          if (coordinates) {
            console.log('התקבלו קואורדינטות מהכתובת:', coordinates);
            setUserLocation(coordinates);
            setIsLoadingLocation(false);
            return;
          } else {
            console.log('לא נמצאו קואורדינטות לכתובת המשתמש');
          }
        } catch (error) {
          console.error('שגיאה בהמרת כתובת המשתמש:', error);
        }
      } else {
        console.log('אין כתובת משתמש במצב האפליקציה');
      }
      
      // אם לא הצלחנו לקבל מיקום בדרכים אחרות, ננסה עם GPS
      console.log('מנסה להשתמש ב-GPS כאפשרות אחרונה');
      getGpsLocation();
    };

    loadInitialLocation();
  }, [user]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // בדיקה אם userLocation קיים ומכיל ערכים תקינים
        if (!userLocation || userLocation.length < 2) {
          console.log('ממתין למיקום המשתמש לפני טעינת נתונים');
          return; // יוצאים מהפונקציה אם אין מיקום תקין
        }

        const queryParams = new URLSearchParams({
          lat: userLocation[0],
          lng: userLocation[1],
          ...filters
        });

        console.log('שולח בקשה ל-API:', `/api/dashboard/map?${queryParams}`);
        const response = await fetch(`/api/dashboard/map?${queryParams}`);
        
        // בדיקה אם התגובה תקינה
        if (!response.ok) {
          console.error('שגיאת תגובה מהשרת:', response.status, response.statusText);
          // נסיון לקרוא את התוכן גם אם אינו JSON תקין
          const errorText = await response.text();
          console.error('תוכן השגיאה:', errorText);
          throw new Error(`שגיאת שרת: ${response.status} ${response.statusText}`);
        }
        
        console.log('התקבלה תגובה תקינה מהשרת');
        const responseText = await response.text();
        
        // בדיקה אם התגובה מכילה JSON תקין
        if (!responseText || responseText.trim() === '') {
          throw new Error('התגובה מהשרת ריקה');
        }
        
        // בדיקה אם התגובה מתחילה ב-HTML במקום JSON
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
          console.error('התקבל HTML במקום JSON:', responseText.substring(0, 100));
          throw new Error('התקבל HTML במקום JSON מהשרת');
        }
        
        // ניסיון לפענח את ה-JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('שגיאה בפענוח JSON:', parseError);
          console.error('התוכן שהתקבל:', responseText.substring(0, 200));
          throw new Error(`שגיאה בפענוח JSON: ${parseError.message}`);
        }
        
        // בדיקה אם הנתונים שהתקבלו תקינים
        if (!data || !data.elderly || !data.volunteers) {
          console.error('המידע שהתקבל מהשרת לא תקין:', data);
          throw new Error('מבנה הנתונים שהתקבל מהשרת אינו תקין');
        }
        
        console.log('מידע תקין התקבל:', {
          elderly: data.elderly.length,
          volunteers: data.volunteers.length
        });
        
        // פילטור לפי חיפוש טקסטואלי
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          data.elderly = data.elderly.filter(elder => 
            elder.firstName.toLowerCase().includes(searchLower) ||
            elder.lastName.toLowerCase().includes(searchLower) ||
            (elder.address && typeof elder.address === 'string' && elder.address.toLowerCase().includes(searchLower))
          );
          data.volunteers = data.volunteers.filter(volunteer =>
            volunteer.firstName.toLowerCase().includes(searchLower) ||
            volunteer.lastName.toLowerCase().includes(searchLower)
          );
        }
        
        // פילטור לפי ימים מאז ביקור אחרון
        if (filters.lastVisitDays) {
          const days = parseInt(filters.lastVisitDays);
          data.elderly = data.elderly.filter(elder => {
            // אם הסטטוס 'visited', כולל אותו גם אם אין תאריך
            if (elder.status === 'visited' && !elder.lastVisit) {
              return true;
            }
            
            // אם יש תאריך ביקור אחרון, בדוק אם הוא בטווח הזמן המבוקש
            if (elder.lastVisit) {
              const lastVisitDate = new Date(elder.lastVisit);
              const daysSinceLastVisit = Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
              return daysSinceLastVisit <= days;
            }
            
            // אם אין תאריך ביקור אחרון וסטטוס לא 'visited', לא כולל
            return false;
          });
        }
        
        setMapData(data);
      } catch (error) {
        console.error('שגיאה בטעינת נתוני המפה:', error);
        // הגדר נתוני ברירת מחדל ריקים
        setMapData({ elderly: [], volunteers: [] });
      }
    };

    // מפעילים את הפונקציה רק אם יש מיקום תקין
    if (userLocation && userLocation.length === 2) {
      fetchData();
    }
  }, [filters, userLocation]);

  // חישוב מסלול אופטימלי
  const optimalRoute = filters.showRoute && userLocation && mapData.elderly && mapData.elderly.length > 0
    ? calculateOptimalRoute(mapData.elderly, userLocation)
    : [];
  
  const routeCoordinates = optimalRoute.map(elder => 
    elder && elder.location && elder.location.coordinates && elder.location.coordinates.length >= 2
      ? [elder.location.coordinates[1], elder.location.coordinates[0]]
      : null
  ).filter(coords => coords !== null); // מסנן קואורדינטות לא תקינות
  
  if (routeCoordinates.length > 0 && userLocation && userLocation.length === 2) {
    routeCoordinates.unshift(userLocation);
  }

  if (isLoadingLocation || !userLocation) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>טוען מיקום...</p>
      </div>
    );
  }

  return (
    <div className="map-container">
      <div className="map-and-filters">
        <div className="map-wrapper">
          <MapContainer
            center={userLocation}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <MapUpdater center={userLocation} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* סמן המיקום הנוכחי */}
            <Marker
              position={userLocation}
              icon={new L.Icon({
                iconUrl: '/icons/current-location.svg',
                iconSize: [35, 35],
                iconAnchor: [17, 17]
              })}
            >
              <Popup>
                <div className="popup-content">
                  <h3>המיקום שלך</h3>
                </div>
              </Popup>
            </Marker>

            {/* סמנים עבור זקנים */}
            {mapData.elderly && mapData.elderly.length > 0 && mapData.elderly.map((elder) => (
              elder && elder.location && elder.location.coordinates && elder.location.coordinates.length >= 2 ? (
                <Marker
                  key={elder._id}
                  position={[elder.location.coordinates[1], elder.location.coordinates[0]]}
                  icon={createElderlyIcon(calculateUrgency(elder))}
                >
                  <Popup>
                    <div className="popup-content">
                      <h3>{elder.firstName} {elder.lastName}</h3>
                      <p>כתובת: {elder.address}</p>
                      <p>סטטוס: {elder.status === 'פעיל' ? 'פעיל' : 'לא פעיל'}</p>
                      <p>ביקור אחרון: {elder.lastVisit ? new Date(elder.lastVisit).toLocaleDateString('he-IL') : 'אין ביקור'}</p>
                      <p>זמן מאז ביקור אחרון: {
                        !elder.lastVisit ? 'אין ביקור קודם' :
                        Math.floor((new Date() - new Date(elder.lastVisit)) / (1000 * 60 * 60 * 24)) + ' ימים'
                      }</p>
                      <p>מרחק: {elder.distanceFromCurrentLocation.toFixed(1)} ק"מ</p>
                      <p style={{
                        fontWeight: 'bold', 
                        color: calculateUrgency(elder) === 'high' ? '#e74c3c' :
                              calculateUrgency(elder) === 'medium' ? '#f39c12' : '#2ecc71'
                      }}>
                        דחיפות: {
                          calculateUrgency(elder) === 'high' ? 'גבוהה' :
                          calculateUrgency(elder) === 'medium' ? 'בינונית' : 'נמוכה'
                        }
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            ))}

            {/* סמנים עבור מתנדבים */}
            {mapData.volunteers && mapData.volunteers.length > 0 && mapData.volunteers.map((volunteer) => (
              volunteer && volunteer.location && volunteer.location.coordinates && volunteer.location.coordinates.length >= 2 ? (
                <Marker
                  key={volunteer._id}
                  position={[volunteer.location.coordinates[1], volunteer.location.coordinates[0]]}
                  icon={volunteerIcon}
                >
                  <Popup>
                    <div className="popup-content">
                      <h3>{volunteer.firstName} {volunteer.lastName}</h3>
                      <p>סטטוס: {volunteer.status === 'available' ? 'זמין' : 'עסוק'}</p>
                      <p>פעיל לאחרונה: {volunteer.lastActive ? new Date(volunteer.lastActive).toLocaleString('he-IL') : 'לא ידוע'}</p>
                      <p>מרחק: {volunteer.distanceFromCurrentLocation.toFixed(1)} ק"מ</p>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            ))}

            {/* מסלול מומלץ */}
            {filters.showRoute && routeCoordinates.length > 1 && (
              <Polyline
                positions={routeCoordinates}
                color="#3498db"
                weight={3}
                opacity={0.8}
                dashArray="10,10"
              />
            )}
          </MapContainer>
        </div>
        
        <div className="sidebar">
          <LocationSelector 
            userLocation={userLocation}
            onLocationChange={setUserLocation}
            useGpsLocation={getGpsLocation}
          />
          <FilterPanel filters={filters} setFilters={setFilters} />
          <MapLegend />
        </div>
      </div>
      
      <div className="stats-container">
        <StatsPanel mapData={mapData} />
      </div>
    </div>
  );
};

export default MapView; 
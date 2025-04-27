import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { useAuth } from '../../context/AuthContext';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { fetchAdminMapData } from '../../services/api';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

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

// קומפוננטת עדכון מעגל הרדיוס
const RadiusCircleUpdater = ({ center, radius }) => {
  const map = useMap();
  
  useEffect(() => {
    // שימוש ברפרנס לשמירת המעגל בין רינדורים
    const circleRef = { current: null };
    
    // יצירת מעגל חדש עם הרדיוס המעודכן
    circleRef.current = L.circle(center, {
      radius: parseInt(radius) * 1000,
      color: '#3498db',
      fillColor: '#3498db',
      fillOpacity: 0.1,
      weight: 1
    }).addTo(map);
    
    // פונקציית ניקוי שתופעל כשהקומפוננטה מתפרקת או כשהתלויות משתנות
    return () => {
      if (circleRef.current) {
        map.removeLayer(circleRef.current);
      }
    };
  }, [map, center, radius]);
  
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
  const elderly = Array.isArray(mapData.elderly) ? mapData.elderly : [];
  const volunteers = Array.isArray(mapData.volunteers) ? mapData.volunteers : [];
  
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
          <span className="stat-label">קשישים באזור</span>
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
          max="300"
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
          <option value="visited">ביקר לאחרונה</option>
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

// מרכז ברירת מחדל - ישראל
const DEFAULT_CENTER = [31.7683, 35.2137];
const DEFAULT_ZOOM = 8;

const MapView = ({ data, isAdminView = false }) => {
  const { user } = useAuth();
  const [center, setCenter] = useState([31.7767, 35.2345]); // ברירת מחדל: ירושלים
  const [radius, setRadius] = useState(10);
  
  // פונקציה לוידוא תקינות קואורדינטות
  const validateCoordinates = useCallback((location) => {
    if (!location || !Array.isArray(location) || location.length !== 2) {
      console.log('Invalid location format:', location);
      return false;
    }
    const [lat, lng] = location;
    if (isNaN(lat) || isNaN(lng)) {
      console.log('Invalid coordinates:', lat, lng);
      return false;
    }
    return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  }, []);

  // עיבוד הנתונים לפני הצגה
  const processedData = useMemo(() => {
    console.log('Processing map data:', data?.mapData);
    
    if (!data?.mapData) {
      console.log('No map data available');
      return { elderly: [], volunteers: [] };
    }

    const { elderly = [], volunteers = [] } = data.mapData;

    console.log('Raw elderly data:', elderly);
    console.log('Raw volunteer data:', volunteers);

    const processed = {
      elderly: elderly
        .filter(e => e && e.location)
        .map(e => ({
          ...e,
          location: validateCoordinates(e.location) ? e.location : null
        }))
        .filter(e => e.location),
      volunteers: volunteers
        .filter(v => v && v.location)
        .map(v => ({
          ...v,
          location: validateCoordinates(v.location) ? v.location : null
        }))
        .filter(v => v.location)
    };

    console.log('Processed data:', processed);
    return processed;
  }, [data, validateCoordinates]);

  // חישוב מרכז המפה
  const mapCenter = useMemo(() => {
    const allPoints = [
      ...(processedData.elderly || []).map(e => e.location),
      ...(processedData.volunteers || []).map(v => v.location)
    ].filter(Boolean);

    if (allPoints.length === 0) {
      return [31.7767, 35.2345]; // ברירת מחדל: ירושלים
    }

    const sumLat = allPoints.reduce((sum, point) => sum + point[0], 0);
    const sumLng = allPoints.reduce((sum, point) => sum + point[1], 0);
    
    return [
      sumLat / allPoints.length,
      sumLng / allPoints.length
    ];
  }, [processedData]);

  useEffect(() => {
    setCenter(mapCenter);
  }, [mapCenter]);

  if (!data) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="map-container">
          <MapContainer
        center={center}
        zoom={12}
        style={{ height: '400px', width: '100%' }}
      >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
        <MapUpdater center={center} />
        {user && validateCoordinates(center) && (
          <RadiusCircleUpdater center={center} radius={radius} />
        )}

        {processedData.elderly.map((elder, index) => (
          elder && elder.location && validateCoordinates(elder.location) && (
            <Marker
              key={elder.id || `elder-${index}`}
              position={elder.location}
              icon={createElderlyIcon(elder.urgency || 'low')}
            >
              <Popup>
                <div>
                      <h3>{elder.firstName} {elder.lastName}</h3>
                  <p>
                    {elder.address && typeof elder.address === 'object' 
                      ? `${elder.address.street || ''}, ${elder.address.city || ''}`
                      : elder.address || 'כתובת לא זמינה'}
                  </p>
                  {elder.lastVisit && (
                    <p>ביקור אחרון: {new Date(elder.lastVisit).toLocaleDateString('he-IL')}</p>
                  )}
                    </div>
                  </Popup>
                </Marker>
          )
            ))}

        {processedData.volunteers.map((volunteer, index) => (
          volunteer && volunteer.location && validateCoordinates(volunteer.location) && (
                <Marker
              key={volunteer.id || `volunteer-${index}`}
              position={volunteer.location}
                  icon={volunteerIcon}
                >
                  <Popup>
                <div>
                      <h3>{volunteer.firstName} {volunteer.lastName}</h3>
                  <p>
                    {volunteer.address && typeof volunteer.address === 'object'
                      ? `${volunteer.address.street || ''}, ${volunteer.address.city || ''}`
                      : volunteer.address || 'כתובת לא זמינה'}
                  </p>
                  <p>{volunteer.status === 'available' ? 'זמין' : 'לא זמין'}</p>
                    </div>
                  </Popup>
                </Marker>
          )
        ))}
          </MapContainer>
      
      <StatsPanel mapData={processedData} />
      {isAdminView && <MapLegend />}
    </div>
  );
};

export default MapView; 
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { useAuth } from '../../context/AuthContext';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import { fetchAdminMap, fetchMapData } from '../../services/api';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';

// יצירת אייקון מותאם אישית
const createElderlyIcon = (urgency) => {
  const color = urgency === 'high' ? '#ff4444' :
                urgency === 'medium' ? '#ffbb33' : '#00C851';
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>`,
    iconSize: [15, 15],
    iconAnchor: [7, 7]
  });
};

const createVolunteerIcon = () => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: '<div style="background-color: #4285F4; width: 10px; height: 10px; border-radius: 50%; border: 2px solid white;"></div>',
    iconSize: [15, 15],
    iconAnchor: [7, 7]
  });
};

// הוספת CSS גלובלי
const globalStyles = `
  .custom-div-icon {
    background: none;
    border: none;
  }
`;

// הוספת ה-styles לראש המסמך
const style = document.createElement('style');
style.textContent = globalStyles;
document.head.appendChild(style);

// קומפוננטת עזר לעדכון מרכז המפה
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
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

// קומפוננטת LocationSelector
const LocationSelector = ({ onLocationSelect }) => {
  const handleGPSClick = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onLocationSelect([latitude, longitude]);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('לא הצלחנו לקבל את המיקום שלך. אנא נסה שוב.');
        }
      );
    } else {
      alert('הדפדפן שלך לא תומך באיתור מיקום.');
    }
  };

  return (
    <div className="location-selector">
      <button className="gps-button" onClick={handleGPSClick}>
        מצא את המיקום שלי
      </button>
    </div>
  );
};

// קומפוננטת FilterPanel
const FilterPanel = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    showElderly: true,
    showVolunteers: true,
    urgencyLevel: 'all',
    searchQuery: ''
  });

  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="filter-panel">
      <div className="filter-options">
        <TextField
          size="small"
          placeholder="חיפוש לפי שם..."
          value={filters.searchQuery}
          onChange={(e) => handleFilterChange({ searchQuery: e.target.value })}
          className="search-input"
        />
        <label>
          <input
            type="checkbox"
            checked={filters.showElderly}
            onChange={(e) => handleFilterChange({ showElderly: e.target.checked })}
          />
          הצג קשישים
        </label>
        <label>
          <input
            type="checkbox"
            checked={filters.showVolunteers}
            onChange={(e) => handleFilterChange({ showVolunteers: e.target.checked })}
          />
          הצג מתנדבים
        </label>
        <select
          value={filters.urgencyLevel}
          onChange={(e) => handleFilterChange({ urgencyLevel: e.target.value })}
        >
          <option value="all">כל רמות הדחיפות</option>
          <option value="high">דחיפות גבוהה</option>
          <option value="medium">דחיפות בינונית</option>
          <option value="low">דחיפות נמוכה</option>
        </select>
      </div>
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

// קומפוננטת MapLegend
const MapLegend = () => {
  return (
    <div className="map-legend">
      <div className="legend-item">
        <div className="legend-color" style={{ backgroundColor: '#ff4444' }}></div>
        <span>דחיפות גבוהה</span>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{ backgroundColor: '#ffbb33' }}></div>
        <span>דחיפות בינונית</span>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{ backgroundColor: '#00C851' }}></div>
        <span>דחיפות נמוכה</span>
      </div>
      <div className="legend-item">
        <div className="legend-color" style={{ backgroundColor: '#4285F4' }}></div>
        <span>מתנדבים</span>
      </div>
    </div>
  );
};

// מרכז ברירת מחדל - ישראל
const DEFAULT_CENTER = [31.7683, 35.2137];
const DEFAULT_ZOOM = 8;

// פונקציה להמרת קואורדינטות למבנה אחיד
const normalizeCoordinates = (location) => {
  if (!location) return null;
  
  // אם זה מערך
  if (Array.isArray(location)) {
    const [lat, lng] = location;
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid coordinates array:', location);
      return null;
    }
    return [Number(lat), Number(lng)];
  }
  
  // אם זה אובייקט GeoJSON
  if (location.type === 'Point' && Array.isArray(location.coordinates)) {
    const [lng, lat] = location.coordinates;
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid GeoJSON coordinates:', location);
      return null;
    }
    return [Number(lat), Number(lng)];
  }
  
  // אם יש מאפיינים lat/lng
  if (location.lat && location.lng) {
    const { lat, lng } = location;
    if (isNaN(lat) || isNaN(lng)) {
      console.warn('Invalid lat/lng object:', location);
      return null;
    }
    return [Number(lat), Number(lng)];
  }
  
  console.warn('Unsupported location format:', location);
  return null;
};

const MapView = ({ data }) => {
  const { user } = useAuth();
  const [mapData, setMapData] = useState({ elderly: [], volunteers: [] });
  const [center, setCenter] = useState([31.7767, 35.2345]); // ברירת מחדל: ירושלים
  const [radius, setRadius] = useState(10);
  const [filters, setFilters] = useState({
    showElderly: true,
    showVolunteers: true,
    urgencyLevel: 'all',
    searchQuery: ''
  });
  
  // פונקציה לטעינת נתוני המפה
  const loadMapData = async (userLocation) => {
    try {
      console.log('Loading map data...');
      const data = user?.role === 'admin' ?
        await fetchAdminMap() :
        await fetchMapData(userLocation?.[0], userLocation?.[1]);
      
      console.log('Received map data:', data);
      
      if (!data) {
        console.error('No data received from server');
        return;
      }

      setMapData(data);
    } catch (error) {
      console.error('Error loading map data:', error);
      alert('שגיאה בטעינת נתוני המפה');
    }
  };

  // טעינת נתונים ראשונית
  useEffect(() => {
    loadMapData();
  }, []);

  // פונקציה לסינון לפי טקסט חיפוש
  const filterBySearch = (item) => {
    if (!filters.searchQuery) return true;
    const searchLower = filters.searchQuery.toLowerCase();
    const fullName = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
    return fullName.includes(searchLower);
  };

  // סינון וחישוב הנקודות למפה
  const points = useMemo(() => {
    console.log('Calculating map points with filters:', filters);
    
    const result = {
      elderly: [],
      volunteers: []
    };

    if (filters.showElderly && mapData.elderly) {
      result.elderly = mapData.elderly
        .filter(filterBySearch)
        .map(elder => {
          const coords = normalizeCoordinates(elder.location);
          if (!coords) {
            console.warn('Invalid elderly coordinates:', elder);
            return null;
          }
          return { ...elder, coordinates: coords };
        })
        .filter(elder => {
          if (!elder) return false;
          if (filters.urgencyLevel === 'all') return true;
          return elder.urgency === filters.urgencyLevel;
        });
    }

    if (filters.showVolunteers && mapData.volunteers) {
      result.volunteers = mapData.volunteers
        .filter(filterBySearch)
        .map(volunteer => {
          const coords = normalizeCoordinates(volunteer.location);
          if (!coords) {
            console.warn('Invalid volunteer coordinates:', volunteer);
            return null;
          }
          return { ...volunteer, coordinates: coords };
        })
        .filter(Boolean);
    }

    return result;
  }, [mapData, filters]);

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
      <div className="filter-section">
        <LocationSelector onLocationSelect={(location) => {
          setCenter(location);
          loadMapData(location);
        }} />
        <FilterPanel onFilterChange={setFilters} />
      </div>
      
      <div className="map-section">
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapUpdater center={center} />
          
          {points.elderly.map((elder, index) => (
            <Marker
              key={`elderly-${elder._id || index}`}
              position={elder.coordinates}
              icon={createElderlyIcon(elder.urgency)}
            >
              <Popup>
                <div className="popup-content">
                  <h3>{elder.firstName} {elder.lastName}</h3>
                  <p><strong>כתובת:</strong> {elder.address}</p>
                  <p><strong>טלפון:</strong> {elder.phone}</p>
                  <p><strong>דחיפות:</strong> {
                    elder.urgency === 'high' ? 'גבוהה' :
                    elder.urgency === 'medium' ? 'בינונית' : 'נמוכה'
                  }</p>
                  {elder.lastVisit && (
                    <p><strong>ביקור אחרון:</strong> {new Date(elder.lastVisit).toLocaleDateString('he-IL')}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          
          {points.volunteers.map((volunteer, index) => (
            <Marker
              key={`volunteer-${volunteer._id || index}`}
              position={volunteer.coordinates}
              icon={createVolunteerIcon()}
            >
              <Popup>
                <div className="popup-content">
                  <h3>{volunteer.firstName} {volunteer.lastName}</h3>
                  <p><strong>כתובת:</strong> {volunteer.address}</p>
                  <p><strong>טלפון:</strong> {volunteer.phone}</p>
                  {volunteer.availability && (
                    <p><strong>זמינות:</strong> {volunteer.availability}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          
          <MapLegend />
        </MapContainer>
      </div>
      
      <div className="stats-section">
        <div className="stat-item">
          <span className="stat-value">{points.elderly.length}</span>
          <span className="stat-label">קשישים באזור</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{points.volunteers.length}</span>
          <span className="stat-label">מתנדבים זמינים</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {points.elderly.filter(e => e.urgency === 'high').length}
          </span>
          <span className="stat-label">זקוקים לביקור דחוף</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">
            {points.elderly.reduce((sum, elder) => 
              elder.distanceFromCurrentLocation ? sum + elder.distanceFromCurrentLocation : sum, 0
            ).toFixed(1)}
          </span>
          <span className="stat-label">מרחק ממוצע (ק"מ)</span>
        </div>
      </div>
    </div>
  );
};

export default MapView; 
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
    html: `<div style="
      background-color: ${color}; 
      width: 35px; 
      height: 35px; 
      border-radius: 50%; 
      border: 4px solid white; 
      box-shadow: 0 3px 6px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: white;
      font-weight: bold;
    ">
      ${urgency === 'high' ? '!' : ''}
    </div>`,
    iconSize: [43, 43],
    iconAnchor: [21, 21]
  });
};

const createVolunteerIcon = () => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="
      background-color: #4285F4; 
      width: 35px; 
      height: 35px; 
      border-radius: 50%; 
      border: 4px solid white; 
      box-shadow: 0 3px 6px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: white;
      font-weight: bold;
    ">
      V
    </div>`,
    iconSize: [43, 43],
    iconAnchor: [21, 21]
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
  const [isLoading, setIsLoading] = useState(false);

  const handleGPSClick = async () => {
    if (!navigator.geolocation) {
      alert('הדפדפן שלך לא תומך באיתור מיקום.');
      return;
    }

    setIsLoading(true);
    try {
      // הגדרת timeout של 10 שניות
      const position = await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error('פג הזמן לקבלת המיקום'));
        }, 10000);

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeoutId);
            resolve(pos);
          },
          (error) => {
            clearTimeout(timeoutId);
            let errorMessage = 'שגיאה בקבלת המיקום: ';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage += 'נדרש אישור גישה למיקום';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage += 'מידע המיקום אינו זמין';
                break;
              case error.TIMEOUT:
                errorMessage += 'פג הזמן לקבלת המיקום';
                break;
              default:
                errorMessage += 'שגיאה לא ידועה';
            }
            reject(new Error(errorMessage));
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      onLocationSelect([latitude, longitude]);
    } catch (error) {
      console.error('שגיאה בקבלת מיקום:', error);
      alert(error.message || 'לא הצלחנו לקבל את המיקום שלך. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="location-selector">
      <button 
        className="gps-button" 
        onClick={handleGPSClick}
        disabled={isLoading}
      >
        {isLoading ? 'מקבל מיקום...' : 'מצא את המיקום שלי'}
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

const MapView = () => {
  const { user } = useAuth();
  const [mapData, setMapData] = useState({ elderly: [], volunteers: [] });
  const [center, setCenter] = useState([31.7767, 35.2345]);
  const [radius, setRadius] = useState(10);
  const [filters, setFilters] = useState({
    showElderly: true,
    showVolunteers: true,
    urgencyLevel: 'all',
    searchQuery: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // פונקציה לטעינת נתוני המפה
  const loadMapData = useCallback(async (userLocation) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading map data...');

      let data;
      if (user?.role === 'admin') {
        data = await fetchAdminMap();
      } else {
        const params = new URLSearchParams();
        if (userLocation?.[0] && userLocation?.[1]) {
          params.append('lat', userLocation[0]);
          params.append('lng', userLocation[1]);
        }
        params.append('radius', radius);
        data = await fetchMapData(userLocation?.[0], userLocation?.[1]);
      }
      
      console.log('Received map data:', data);
      
      if (!data) {
        throw new Error('לא התקבלו נתונים מהשרת');
      }

      // וידוא ונירמול הנתונים
      const normalizedData = {
        elderly: Array.isArray(data.elderly) ? data.elderly.map(elder => ({
          _id: elder._id || String(Math.random()),
          firstName: elder.firstName || '',
          lastName: elder.lastName || '',
          address: elder.address || '',
          phone: elder.phone || '',
          urgency: elder.urgency || 'medium',
          lastVisit: elder.lastVisit || null,
          location: elder.location || null
        })) : [],
        volunteers: Array.isArray(data.volunteers) ? data.volunteers.map(volunteer => ({
          _id: volunteer._id || String(Math.random()),
          firstName: volunteer.firstName || '',
          lastName: volunteer.lastName || '',
          address: volunteer.address || '',
          phone: volunteer.phone || '',
          availability: volunteer.availability || '',
          location: volunteer.location || null
        })) : []
      };

      setMapData(normalizedData);
    } catch (error) {
      console.error('Error loading map data:', error);
      setError(error.message || 'שגיאה בטעינת נתוני המפה');
      setMapData({ elderly: [], volunteers: [] });
    } finally {
      setIsLoading(false);
    }
  }, [user?.role, radius]);

  // טעינת נתונים ראשונית
  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  // פונקציה לסינון לפי טקסט חיפוש
  const filterBySearch = useCallback((item) => {
    if (!filters.searchQuery) return true;
    const searchLower = filters.searchQuery.toLowerCase();
    const fullName = `${item.firstName || ''} ${item.lastName || ''}`.toLowerCase();
    return fullName.includes(searchLower);
  }, [filters.searchQuery]);

  // סינון וחישוב הנקודות למפה
  const points = useMemo(() => {
    if (!mapData || !Array.isArray(mapData.elderly) || !Array.isArray(mapData.volunteers)) {
      console.warn('Invalid map data:', mapData);
      return { elderly: [], volunteers: [] };
    }

    const result = {
      elderly: [],
      volunteers: []
    };

    if (filters.showElderly) {
      result.elderly = mapData.elderly
        .filter(elder => {
          if (!elder) {
            console.warn('Found null/undefined elder in mapData.elderly');
            return false;
          }
          return filterBySearch(elder);
        })
        .map(elder => {
          const coords = normalizeCoordinates(elder.location);
          if (!coords) {
            console.warn(`Invalid coordinates for elder ${elder._id}:`, elder.location);
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

    if (filters.showVolunteers) {
      result.volunteers = mapData.volunteers
        .filter(volunteer => {
          if (!volunteer) {
            console.warn('Found null/undefined volunteer in mapData.volunteers');
            return false;
          }
          return filterBySearch(volunteer);
        })
        .map(volunteer => {
          const coords = normalizeCoordinates(volunteer.location);
          if (!coords) {
            console.warn(`Invalid coordinates for volunteer ${volunteer._id}:`, volunteer.location);
            return null;
          }
          return { ...volunteer, coordinates: coords };
        })
        .filter(Boolean);
    }

    return result;
  }, [mapData, filters, filterBySearch]);

  // פונקציה להצגת תאריך בפורמט עברי
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  // פונקציה להצגת דחיפות בעברית
  const getUrgencyText = (urgency) => {
    switch (urgency) {
      case 'high': return 'גבוהה';
      case 'medium': return 'בינונית';
      case 'low': return 'נמוכה';
      default: return 'לא ידוע';
    }
  };

  if (isLoading) {
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

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        color: 'error.main'
      }}>
        <Typography>{error}</Typography>
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
          
          {points.elderly.map((elder) => (
            <Marker
              key={elder._id}
              position={elder.coordinates}
              icon={createElderlyIcon(elder.urgency)}
            >
              <Popup>
                <div className="popup-content">
                  <h3>{elder.firstName} {elder.lastName}</h3>
                  {elder.address && <p><strong>כתובת:</strong> {elder.address}</p>}
                  {elder.phone && <p><strong>טלפון:</strong> {elder.phone}</p>}
                  <p><strong>דחיפות:</strong> {getUrgencyText(elder.urgency)}</p>
                  {elder.lastVisit && (
                    <p><strong>ביקור אחרון:</strong> {formatDate(elder.lastVisit)}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
          
          {points.volunteers.map((volunteer) => (
            <Marker
              key={volunteer._id}
              position={volunteer.coordinates}
              icon={createVolunteerIcon()}
            >
              <Popup>
                <div className="popup-content">
                  <h3>{volunteer.firstName} {volunteer.lastName}</h3>
                  {volunteer.address && <p><strong>כתובת:</strong> {volunteer.address}</p>}
                  {volunteer.phone && <p><strong>טלפון:</strong> {volunteer.phone}</p>}
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
            {points.elderly.length > 0 
              ? (points.elderly.reduce((sum, elder) => 
                  elder.distanceFromCurrentLocation ? sum + elder.distanceFromCurrentLocation : sum, 0
                ) / points.elderly.length).toFixed(1)
              : '0.0'}
          </span>
          <span className="stat-label">מרחק ממוצע (ק"מ)</span>
        </div>
      </div>
    </div>
  );
};

export default MapView; 
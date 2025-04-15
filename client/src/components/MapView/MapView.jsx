import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// יצירת אייקונים מותאמים אישית
const createElderlyIcon = (urgency) => new L.Icon({
  iconUrl: `/icons/elderly-${urgency}.svg`,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

const volunteerIcon = new L.Icon({
  iconUrl: '/icons/volunteer.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35]
});

// קומפוננטת עדכון מרכז המפה
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

// קומפוננטת בחירת מיקום
const LocationSelector = ({ userLocation, onLocationChange }) => {
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
  );
};

// קומפוננטת סטטיסטיקות
const StatsPanel = ({ mapData }) => {
  const stats = {
    totalElderly: mapData.elderly.length,
    needVisit: mapData.elderly.filter(e => e.status === 'needs_visit').length,
    availableVolunteers: mapData.volunteers.filter(v => v.status === 'available').length,
    averageDistance: mapData.elderly.reduce((acc, curr) => acc + curr.distanceFromCurrentLocation, 0) / mapData.elderly.length || 0
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
  const daysSinceLastVisit = (Date.now() - new Date(elder.lastVisit)) / (1000 * 60 * 60 * 24);
  if (daysSinceLastVisit > 30) return 'high';
  if (daysSinceLastVisit > 14) return 'medium';
  return 'low';
};

// פונקציה לחישוב מסלול אופטימלי
const calculateOptimalRoute = (elderly, startPoint) => {
  // מיון לפי דחיפות ומרחק
  return elderly
    .filter(elder => elder.status === 'needs_visit')
    .sort((a, b) => {
      const urgencyA = calculateUrgency(a);
      const urgencyB = calculateUrgency(b);
      if (urgencyA !== urgencyB) {
        return urgencyA === 'high' ? -1 : 1;
      }
      return a.distanceFromCurrentLocation - b.distanceFromCurrentLocation;
    })
    .slice(0, 5); // מקסימום 5 נקודות במסלול
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

  useEffect(() => {
    // ניסיון לקבל את המיקום מה-GPS
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation([position.coords.latitude, position.coords.longitude]);
        setIsLoadingLocation(false);
      },
      async (error) => {
        console.error('שגיאה בקבלת מיקום GPS:', error);
        
        try {
          // קבלת כתובת ברירת המחדל מהפרופיל
          const response = await fetch('/api/auth/me');
          const userData = await response.json();
          
          if (userData.address) {
            // המרת הכתובת לקואורדינטות
            const geocodeResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(userData.address)}, Israel`
            );
            const geocodeData = await geocodeResponse.json();
            
            if (geocodeData && geocodeData[0]) {
              setUserLocation([parseFloat(geocodeData[0].lat), parseFloat(geocodeData[0].lon)]);
            } else {
              // אם לא נמצאו קואורדינטות, שימוש במיקום ברירת מחדל (תל אביב)
              setUserLocation([32.0853, 34.7818]);
            }
          } else {
            // אם אין כתובת בפרופיל, שימוש במיקום ברירת מחדל
            setUserLocation([32.0853, 34.7818]);
          }
        } catch (fetchError) {
          console.error('שגיאה בקבלת נתוני משתמש:', fetchError);
          setUserLocation([32.0853, 34.7818]);
        } finally {
          setIsLoadingLocation(false);
        }
      }
    );
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams({
          lat: userLocation[0],
          lng: userLocation[1],
          ...filters
        });

        const response = await fetch(`/api/dashboard/map?${queryParams}`);
        const data = await response.json();
        
        // פילטור לפי חיפוש טקסטואלי
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          data.elderly = data.elderly.filter(elder => 
            elder.firstName.toLowerCase().includes(searchLower) ||
            elder.lastName.toLowerCase().includes(searchLower) ||
            elder.address.toLowerCase().includes(searchLower)
          );
          data.volunteers = data.volunteers.filter(volunteer =>
            volunteer.firstName.toLowerCase().includes(searchLower) ||
            volunteer.lastName.toLowerCase().includes(searchLower)
          );
        }
        
        setMapData(data);
      } catch (error) {
        console.error('שגיאה בטעינת נתוני המפה:', error);
      }
    };

    fetchData();
  }, [filters, userLocation]);

  // חישוב מסלול אופטימלי
  const optimalRoute = filters.showRoute ? calculateOptimalRoute(mapData.elderly, userLocation) : [];
  const routeCoordinates = optimalRoute.map(elder => 
    [elder.location.coordinates[1], elder.location.coordinates[0]]
  );
  if (routeCoordinates.length > 0) {
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
      <div className="sidebar">
        <LocationSelector 
          userLocation={userLocation}
          onLocationChange={setUserLocation}
        />
        <FilterPanel filters={filters} setFilters={setFilters} />
        <StatsPanel mapData={mapData} />
      </div>
      
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
        {mapData.elderly.map((elder) => (
          <Marker
            key={elder._id}
            position={[elder.location.coordinates[1], elder.location.coordinates[0]]}
            icon={createElderlyIcon(calculateUrgency(elder))}
          >
            <Popup>
              <div className="popup-content">
                <h3>{elder.firstName} {elder.lastName}</h3>
                <p>כתובת: {elder.address}</p>
                <p>סטטוס: {elder.status === 'needs_visit' ? 'זקוק לביקור' : 'בוקר לאחרונה'}</p>
                <p>ביקור אחרון: {new Date(elder.lastVisit).toLocaleDateString('he-IL')}</p>
                <p>מרחק: {elder.distanceFromCurrentLocation.toFixed(1)} ק"מ</p>
                <p>דחיפות: {
                  calculateUrgency(elder) === 'high' ? 'גבוהה' :
                  calculateUrgency(elder) === 'medium' ? 'בינונית' : 'נמוכה'
                }</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* סמנים עבור מתנדבים */}
        {mapData.volunteers.map((volunteer) => (
          <Marker
            key={volunteer._id}
            position={[volunteer.location.coordinates[1], volunteer.location.coordinates[0]]}
            icon={volunteerIcon}
          >
            <Popup>
              <div className="popup-content">
                <h3>{volunteer.firstName} {volunteer.lastName}</h3>
                <p>סטטוס: {volunteer.status === 'available' ? 'זמין' : 'עסוק'}</p>
                <p>פעיל לאחרונה: {new Date(volunteer.lastActive).toLocaleString('he-IL')}</p>
                <p>מרחק: {volunteer.distanceFromCurrentLocation.toFixed(1)} ק"מ</p>
              </div>
            </Popup>
          </Marker>
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
  );
};

export default MapView; 
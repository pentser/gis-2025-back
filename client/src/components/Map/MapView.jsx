import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Alert } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import './MapView.css';
import { fetchMapData, updateVisit, createVisit, fetchWithAuth, fetchVolunteerVisits } from '../../services/api';
import styles from './MapView.module.css';
import L from 'leaflet';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import RouteIcon from '@mui/icons-material/Route';

// תיקון אייקונים של Leaflet
delete L.Icon.Default.prototype._getIconUrl;

// הגדרת אייקונים שונים למתנדבים וזקנים
const elderlyIcon = new L.DivIcon({
  className: 'elderly-marker',
  html: `<div style="
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #e74c3c; 
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

// קומפוננטה חדשה לעדכון המפה
const MapUpdater = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center);
  }, [center, map]);

  return null;
};

// פונקציה לחישוב מרחק בין שתי נקודות
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // רדיוס כדור הארץ בקילומטרים
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // מרחק בקילומטרים
};

// פונקציה לבדיקה אם נקודה נמצאת בתוך הרדיוס
const isWithinRadius = (elderlyLocation, userLocation, radius) => {
  if (!elderlyLocation || !elderlyLocation.coordinates || !userLocation || !radius) {
    return true; // אם חסרים נתונים, נציג את הקשיש
  }
  const distance = calculateDistance(
    userLocation[0],
    userLocation[1],
    elderlyLocation.coordinates[1],
    elderlyLocation.coordinates[0]
  );
  return distance <= radius;
};

// פונקציה לחישוב ציון דחיפות
const calculateUrgencyScore = (elder) => {
  try {
    if (!elder.lastVisit) return 100; // אם אין ביקור בכלל - דחיפות מקסימלית
    
    const today = new Date();
    const lastVisitDate = new Date(elder.lastVisit);
    const daysSinceLastVisit = Math.floor((today - lastVisitDate) / (1000 * 60 * 60 * 24));
    
    // חישוב ציון דחיפות לפי מספר הימים
    if (daysSinceLastVisit > 21) return 100; // מעל 21 יום - דחיפות מקסימלית
    if (daysSinceLastVisit > 14) return 80;  // מעל 14 יום - דחיפות גבוהה
    if (daysSinceLastVisit > 7) return 60;   // מעל 7 ימים - דחיפות בינונית
    if (daysSinceLastVisit > 3) return 40;   // מעל 3 ימים - דחיפות נמוכה
    return 20; // פחות מ-3 ימים - דחיפות מינימלית
  } catch (error) {
    console.error('שגיאה בחישוב דחיפות:', error);
    return 50; // ערך ברירת מחדל במקרה של שגיאה
  }
};

// פונקציה לחישוב ציון מרחק
const calculateDistanceScore = (distance) => {
  // המרת מרחק לציון (0-100) - ככל שהמרחק גדול יותר, הציון נמוך יותר
  return Math.max(0, 100 - (distance * 10));
};

// פונקציה לחישוב ציון כולל
const calculateTotalScore = (elder, distance) => {
  const urgencyScore = calculateUrgencyScore(elder);
  const distanceScore = calculateDistanceScore(distance);
  
  // שקלול הציונים - 70% דחיפות, 30% מרחק
  return (urgencyScore * 0.7) + (distanceScore * 0.3);
};

// פונקציה למיון קשישים לפי ציון כולל
const sortElderlyByScore = (elderly, userLocation) => {
  return elderly.map(elder => {
    const distance = calculateDistance(
      userLocation[0],
      userLocation[1],
      elder.location.coordinates[1],
      elder.location.coordinates[0]
    );
    return {
      ...elder,
      score: calculateTotalScore(elder, distance)
    };
  }).sort((a, b) => b.score - a.score); // מיון בסדר יורד
};

// פונקציה לקביעת צבע לפי דחיפות
const getUrgencyColor = (elder) => {
  const urgencyScore = calculateUrgencyScore(elder);
  if (urgencyScore >= 80) return '#e74c3c'; // אדום - דחיפות גבוהה
  if (urgencyScore >= 60) return '#f39c12'; // כתום - דחיפות בינונית
  return '#2ecc71'; // ירוק - דחיפות נמוכה
};

// יצירת אייקון דינמי לפי דחיפות
const createElderlyIcon = (elder) => {
  const color = getUrgencyColor(elder);
  return new L.DivIcon({
    className: 'elderly-marker',
    html: `<div style="
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${color}; 
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

const MapView = () => {
  const [mapData, setMapData] = useState({ elderly: [], volunteers: [] });
  const [error, setError] = useState(null);
  const [center, setCenter] = useState([31.7767, 35.2345]);
  const [userLocation, setUserLocation] = useState(null);
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);
  const [searchRadius, setSearchRadius] = useState(10);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [visits, setVisits] = useState([]);
  const [filters, setFilters] = useState({
    radius: 10,
    elderlyStatus: '',
    volunteerStatus: '',
    lastVisitDays: '',
    searchTerm: '',
    showRoute: false
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [routingControl, setRoutingControl] = useState(null);
  const mapRef = useRef(null);
  const [defaultAddress, setDefaultAddress] = useState(null);

  // פונקציה לטעינת נתוני הקשישים
  const loadMapData = async (lat, lng) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/elderly?latitude=${lat}&longitude=${lng}&radius=${searchRadius}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Elderly data:', data);

      setMapData(prev => ({
        ...prev,
        elderly: Array.isArray(data) ? data : []
      }));
    } catch (error) {
      console.error('Error loading map data:', error);
    }
  };

  // פונקציה לטעינת המיקום הדיפולטיבי של המתנדב
  const loadDefaultLocation = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No auth token found');

      const response = await fetch(
        `/api/volunteers/${user.id}/location`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      return data.location ? {
        coordinates: [data.location.lat, data.location.lng],
        address: data.address
      } : null;
    } catch (error) {
      console.error('Error loading default location:', error);
      return null;
    }
  };

  // פונקציה לקבלת המיקום הנוכחי
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Current location:', latitude, longitude); // לבדיקת המיקום
          setUserLocation([latitude, longitude]);
          setCenter([latitude, longitude]);
          loadMapData(latitude, longitude);
        },
        (error) => {
          console.error('שגיאה בקבלת מיקום:', error);
          // במקרה של שגיאה, נשתמש במיקום ברירת מחדל של ירושלים
          const defaultLat = 31.7767;
          const defaultLng = 35.2345;
          setUserLocation([defaultLat, defaultLng]);
          setCenter([defaultLat, defaultLng]);
          loadMapData(defaultLat, defaultLng);
        }
      );
    }
  };

  const loadVisits = async () => {
    try {
      console.log('טוען היסטוריית ביקורים...');
      const data = await fetchVolunteerVisits();
      console.log('ביקורים שהתקבלו:', data);
      setVisits(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('שגיאה בטעינת ביקורים:', err);
      setError(err.message);
    }
  };

  // טעינה ראשונית של המפה והביקורים
  useEffect(() => {
    if (user) {
      getCurrentLocation();
      loadVisits();
    }
  }, [user]);

  const handleNewVisit = (elderId, elderName) => {
    console.log('פתיחת דיאלוג ביקור חדש:', { elderId, elderName });
    if (!elderId) {
      console.error('ID קשיש חסר');
      return;
    }
    const now = new Date();
    // מוסיף 3 שעות לשעון UTC כדי להתאים לשעון ישראל
    now.setHours(now.getHours() + 3);
    setVisitDialog({
      open: true,
      elderId,
      elderName,
      visitData: {
        status: 'scheduled',
        notes: '',
        duration: 30,
        date: now.toISOString().slice(0, 16) // Format: "YYYY-MM-DDThh:mm"
      }
    });
  };

  const handleVisitSubmit = async () => {
    try {
      console.log('נתוני המשתמש:', user);
      console.log('נתוני הדיאלוג:', visitDialog);
      
      if (!visitDialog.elderId) {
        console.error('ID קשיש חסר בדיאלוג');
        throw new Error('נדרש לציין קשיש');
      }

      if (!user?.id) {
        console.error('ID משתמש חסר:', user);
        throw new Error('נדרש לציין מתנדב');
      }

      const visitData = {
        elder: visitDialog.elderId,
        volunteer: user.id,
        date: visitDialog.visitData.date,
        duration: parseInt(visitDialog.visitData.duration),
        status: visitDialog.visitData.status,
        notes: visitDialog.visitData.notes
      };
      
      console.log('שולח נתוני ביקור:', visitData);
      
      const response = await createVisit(visitData);
      console.log('תגובת השרת ליצירת ביקור:', response);
      
      // סגירת הדיאלוג
      setVisitDialog(prev => ({ ...prev, open: false }));
      
      // עדכון הנתונים במפה
      await loadMapData(center[0], center[1]);
      
      // המתנה קצרה לפני טעינת הביקורים מחדש
      setTimeout(async () => {
        console.log('טוען ביקורים מחדש אחרי יצירת ביקור חדש...');
        await loadVisits();
      }, 1000);
      
      // הצגת הודעת הצלחה
      alert('הביקור נוצר בהצלחה!');
    } catch (err) {
      console.error('שגיאה ביצירת ביקור:', err);
      setError(err.message || 'שגיאה ביצירת ביקור');
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

  // פונקציה לחישוב מסלול אופטימלי
  const calculateOptimalRoute = () => {
    if (!userLocation || !mapData.elderly.length) return;

    // ניקוי מסלול קודם אם קיים
    if (routingControl) {
      routingControl.remove();
    }

    // מיון קשישים לפי ציון כולל
    const sortedElderly = sortElderlyByScore(mapData.elderly, userLocation);
    
    // בחירת שני הקשישים עם הציון הגבוה ביותר
    const topTwoElderly = sortedElderly.slice(0, 2);

    // יצירת מערך של נקודות דרך
    const waypoints = [
      L.latLng(userLocation[0], userLocation[1]), // נקודת התחלה - מיקום המתנדב
      ...topTwoElderly.map(elder => L.latLng(
        elder.location.coordinates[1],
        elder.location.coordinates[0]
      ))
    ];

    // יצירת בקר מסלול
    const control = L.Routing.control({
      waypoints,
      routeWhileDragging: false, // ביטול אפשרות גרירת נקודות
      showAlternatives: false,   // ביטול הצגת חלופות
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: '#1A365D', weight: 4 }]
      },
      createMarker: function() { return null; } // ביטול יצירת סמנים אוטומטיים
    }).addTo(mapRef.current);

    // הוספת מידע על המסלול
    control.on('routesfound', function(e) {
      const routes = e.routes;
      if (routes && routes.length > 0) {
        const route = routes[0];
        const totalDistance = (route.summary.totalDistance / 1000).toFixed(1); // המרה לקילומטרים
        const totalTime = Math.ceil(route.summary.totalTime / 60); // המרה לדקות
        
        // הצגת מידע על המסלול
        const routeInfo = document.createElement('div');
        routeInfo.className = 'route-info';
        routeInfo.innerHTML = `
          <h3>מידע על המסלול</h3>
          <p>מרחק כולל: ${totalDistance} ק"מ</p>
          <p>זמן משוער: ${totalTime} דקות</p>
          <p>מספר תחנות: ${topTwoElderly.length}</p>
          <div class="elderly-info">
            <h4>קשישים במסלול:</h4>
            ${topTwoElderly.map((elder, index) => `
              <div class="elderly-item">
                <p><strong>${index + 1}. ${elder.firstName} ${elder.lastName}</strong></p>
                <p>דחיפות: ${calculateUrgencyScore(elder)}%</p>
                <p>מרחק: ${calculateDistance(
                  userLocation[0],
                  userLocation[1],
                  elder.location.coordinates[1],
                  elder.location.coordinates[0]
                ).toFixed(1)} ק"מ</p>
              </div>
            `).join('')}
          </div>
        `;
        
        // הוספת המידע לפאנל המסלול
        const container = document.querySelector('.leaflet-routing-container');
        if (container) {
          container.appendChild(routeInfo);
        }
      }
    });

    setRoutingControl(control);
  };

  // פונקציה לביטול המסלול
  const clearRoute = () => {
    if (routingControl) {
      routingControl.remove();
      setRoutingControl(null);
    }
  };

  const formatAddress = (address) => {
    if (typeof address === 'string') return address;
    if (typeof address === 'object') {
      const parts = [];
      if (address.street) parts.push(address.street);
      if (address.city) parts.push(address.city);
      if (address.zipCode) parts.push(address.zipCode);
      return parts.join(', ');
    }
    return 'כתובת לא זמינה';
  };

  if (error) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100%"
        p={2}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container className={styles.container}>
      <Paper className={styles.mapContainer}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h4" component="h1" className={styles.title}>
            מפת ביקורים
          </Typography>
          
          {user?.role === 'volunteer' && (
            <Box display="flex" gap={2} flexDirection="column" alignItems="flex-end">
              <Box display="flex" gap={2}>
                <TextField
                  sx={{ 
                    width: '150px',
                    '& .MuiInputBase-root': {
                      height: '56px'
                    }
                  }}
                  label="רדיוס חיפוש (ק״מ)"
                  type="number"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(Number(e.target.value))}
                  InputProps={{
                    inputProps: { 
                      min: 1,
                      max: 50
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<RouteIcon />}
                  onClick={routingControl ? clearRoute : calculateOptimalRoute}
                  disabled={mapData.elderly.length < 2}
                  sx={{ 
                    width: '200px',
                    height: '56px',
                    whiteSpace: 'pre-line',
                    lineHeight: 1.2,
                    textAlign: 'center',
                    marginRight: '8px'
                  }}
                >
                  {routingControl ? 'בטל מסלול' : 'חשב מסלול אופטימלי\nלביקורים דחופים'}
                </Button>
              </Box>
            </Box>
          )}
        </Box>
        
        <div className={styles.map}>
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
            zoomControl={false}
          >
            <ZoomControl position="topleft" />
            <MapUpdater center={center} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* הצגת אזור החיפוש */}
            {user?.role === 'volunteer' && userLocation && (
              <Circle
                center={userLocation}
                radius={searchRadius * 1000}
                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
              />
            )}
            
            {/* הצגת מיקום המתנדב */}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={volunteerIcon}
              >
                <Popup>
                  <div>
                    <h3>המיקום שלי</h3>
                    <p>{user.firstName} {user.lastName}</p>
                  </div>
                </Popup>
              </Marker>
            )}
            
            {/* סמנים עבור זקנים */}
            {mapData.elderly && mapData.elderly.length > 0 && mapData.elderly
              .filter(elder => !userLocation || isWithinRadius(elder.location, userLocation, searchRadius))
              .map((elder) => (
                <Marker
                  key={elder._id}
                  position={[elder.location.coordinates[1], elder.location.coordinates[0]]}
                  icon={createElderlyIcon(elder)}
                >
                  <Popup>
                    <div className="popup-content">
                      <h3>{elder.firstName} {elder.lastName}</h3>
                      <p>כתובת: {formatAddress(elder.address)}</p>
                      <p>סטטוס: {elder.status === 'פעיל' ? 'פעיל' : 'לא פעיל'}</p>
                      <p>ביקור אחרון: {elder.lastVisit ? new Date(elder.lastVisit).toLocaleDateString('he-IL') : 'אין ביקור'}</p>
                      <p>זמן מאז ביקור אחרון: {
                        !elder.lastVisit ? 'אין ביקור קודם' :
                        Math.floor((new Date() - new Date(elder.lastVisit)) / (1000 * 60 * 60 * 24)) + ' ימים'
                      }</p>
                      <p>מרחק: {elder.distanceFromCurrentLocation ? 
                        elder.distanceFromCurrentLocation.toFixed(1) : 
                        calculateDistance(
                          userLocation[0],
                          userLocation[1],
                          elder.location.coordinates[1],
                          elder.location.coordinates[0]
                        ).toFixed(1)} ק"מ</p>
                      <p style={{
                        fontWeight: 'bold', 
                        color: calculateUrgencyScore(elder) >= 80 ? '#e74c3c' :
                              calculateUrgencyScore(elder) >= 60 ? '#f39c12' : '#2ecc71'
                      }}>
                        דחיפות: {
                          calculateUrgencyScore(elder) >= 80 ? 'גבוהה' :
                          calculateUrgencyScore(elder) >= 60 ? 'בינונית' : 'נמוכה'
                        }
                      </p>
                      <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => {
                            console.log('ניווט לדף קשיש:', elder._id);
                            navigate(`/app/elderly/${elder._id}`);
                          }}
                        >
                          צפה בפרטים
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          onClick={() => {
                            console.log('פתיחת דיאלוג ביקור חדש:', elder._id);
                            handleNewVisit(elder._id, `${elder.firstName} ${elder.lastName}`);
                          }}
                        >
                          קבע ביקור
                        </Button>
                      </Box>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>
      </Paper>

      {/* טבלת ביקורים למתנדב */}
      {user?.role === 'volunteer' && (
        <Paper className={styles.visitsTable} sx={{ mt: 2, p: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            דיווחים/ביקורים שלי
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>תאריך</TableCell>
                  <TableCell>שעה</TableCell>
                  <TableCell>קשיש</TableCell>
                  <TableCell>כתובת</TableCell>
                  <TableCell>משך (דקות)</TableCell>
                  <TableCell>סטטוס</TableCell>
                  <TableCell>הערות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.isArray(visits) && visits.length > 0 ? (
                  visits.map((visit) => (
                    <TableRow key={visit._id}>
                      <TableCell>
                        {new Date(visit.date).toLocaleDateString('he-IL')}
                      </TableCell>
                      <TableCell>
                        {new Date(visit.date).toLocaleTimeString('he-IL')}
                      </TableCell>
                      <TableCell>
                        {visit.elder ? `${visit.elder.firstName} ${visit.elder.lastName}` : 'לא ידוע'}
                      </TableCell>
                      <TableCell>
                        {visit.elder?.address || 'לא ידוע'}
                      </TableCell>
                      <TableCell>{visit.duration}</TableCell>
                      <TableCell>
                        {visit.status === 'scheduled' ? 'מתוכנן' :
                         visit.status === 'completed' ? 'בוצע' :
                         visit.status === 'cancelled' ? 'בוטל' : visit.status}
                      </TableCell>
                      <TableCell>{visit.notes}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      אין ביקורים להצגה
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* דיאלוג עדכון ביקור */}
      <Dialog open={visitDialog.open} onClose={() => setVisitDialog(prev => ({ ...prev, open: false }))}>
        <DialogTitle>תיאום ביקור חדש - {visitDialog.elderName}</DialogTitle>
        <DialogContent>
          <input type="hidden" name="elderId" value={visitDialog.elderId} />
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
            required
          />

          <TextField
            fullWidth
            margin="normal"
            label="משך הביקור (דקות)"
            name="duration"
            type="number"
            value={visitDialog.visitData.duration}
            onChange={handleVisitChange}
            required
            inputProps={{ min: 1 }}
          />

          <FormControl fullWidth margin="normal">
            <InputLabel>סטטוס הביקור</InputLabel>
            <Select
              name="status"
              value={visitDialog.visitData.status}
              onChange={handleVisitChange}
              label="סטטוס הביקור"
              required
            >
              <MenuItem value="scheduled">מתוכנן</MenuItem>
              <MenuItem value="completed">בוצע</MenuItem>
              <MenuItem value="cancelled">בוטל</MenuItem>
            </Select>
          </FormControl>

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
          <Button 
            onClick={handleVisitSubmit} 
            variant="contained" 
            color="primary"
            disabled={!visitDialog.elderId || !visitDialog.visitData.date || !visitDialog.visitData.duration}
          >
            שמור
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MapView; 
import React, { useState, useEffect, useRef, useCallback } from 'react';
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

// פונקציה לחישוב מרחק בין שתי נקודות בקילומטרים
const calculateDistance = (point1, point2) => {
  const R = 6371; // רדיוס כדור הארץ בקילומטרים
  const lat1 = point1[0] * Math.PI / 180;
  const lat2 = point2[0] * Math.PI / 180;
  const deltaLat = (point2[0] - point1[0]) * Math.PI / 180;
  const deltaLon = (point2[1] - point1[1]) * Math.PI / 180;

  const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
           Math.cos(lat1) * Math.cos(lat2) *
           Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// פונקציה לבדיקה אם נקודה נמצאת בתוך הרדיוס
const isWithinRadius = (elderlyLocation, userLocation, radius) => {
  if (!elderlyLocation?.coordinates || !userLocation || !radius) {
    console.log('Missing data for radius check:', {
      hasElderlyCoords: !!elderlyLocation?.coordinates,
      hasUserLocation: !!userLocation,
      radius
    });
    return false;
  }

  const distance = calculateDistance(
    userLocation,
    elderlyLocation.coordinates
  );
  
  console.log('Distance calculation:', {
    userLat: userLocation[0],
    userLng: userLocation[1],
    elderlyLat: elderlyLocation.coordinates[1],
    elderlyLng: elderlyLocation.coordinates[0],
    distance,
    radius
  });
  
  return distance <= radius;
};

// פונקציה לחישוב ציון דחיפות
const calculateUrgency = (elder) => {
  if (!elder.lastVisit) return 'high';
  
  const lastVisit = new Date(elder.lastVisit);
  const daysSinceLastVisit = Math.floor((new Date() - lastVisit) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastVisit <= 7) return 'low';      // ירוק - עד שבוע
  if (daysSinceLastVisit <= 14) return 'medium';  // כתום - בין שבוע לשבועיים
  return 'high';                                  // אדום - מעל שבועיים
};

// פונקציה לחישוב ציון מרחק
const calculateDistanceScore = (distance) => {
  // המרת מרחק לציון (0-100) - ככל שהמרחק גדול יותר, הציון נמוך יותר
  return Math.max(0, 100 - (distance * 10));
};

// פונקציה לחישוב ציון כולל
const calculateTotalScore = (elder, distance) => {
  const urgencyScore = calculateUrgency(elder);
  const distanceScore = calculateDistanceScore(distance);
  
  // שקלול הציונים - 70% דחיפות, 30% מרחק
  return (urgencyScore * 0.7) + (distanceScore * 0.3);
};

// פונקציה למיון קשישים לפי ציון כולל
const sortElderlyByScore = (elderly, userLocation) => {
  return elderly.map(elder => {
    const distance = calculateDistance(
      userLocation,
      elder.location.coordinates
    );
    return {
      ...elder,
      score: calculateTotalScore(elder, distance)
    };
  }).sort((a, b) => b.score - a.score); // מיון בסדר יורד
};

// פונקציה לקביעת צבע לפי דחיפות
const getUrgencyColor = (elder) => {
  const urgencyScore = calculateUrgency(elder);
  if (urgencyScore === 'high') return '#e74c3c'; // אדום - דחיפות גבוהה
  if (urgencyScore === 'medium') return '#f39c12'; // כתום - דחיפות בינונית
  return '#2ecc71'; // ירוק - דחיפות נמוכה
};

// פונקציה ליצירת אייקון לפי דחיפות
const createElderlyIcon = (urgency) => {
  const colors = {
    high: '#e74c3c',    // אדום
    medium: '#f39c12',  // כתום
    low: '#2ecc71'      // ירוק
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

// נוסיף סטייל לכפתורי הלשוניות
const tabButtonStyle = {
  flex: 1,
  padding: '8px',
  border: 'none',
  borderBottom: '2px solid transparent',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  '&.active': {
    borderBottom: '2px solid #1976d2',
    color: '#1976d2'
  },
  '&:hover': {
    backgroundColor: '#f5f5f5'
  }
};

const ElderlyPopup = ({ elder }) => {
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  const handleVisitUpdate = () => {
    const currentDateTime = new Date().toISOString();
    navigate(`/app/visits/new?elderId=${elder._id}&dateTime=${currentDateTime}`);
  };

  const formatDate = (date) => {
    if (!date) return 'לא צוין';
    return new Date(date).toLocaleDateString('he-IL');
  };

  return (
    <Box sx={{ 
      width: '250px', // הקטנת הרוחב הכללי
      direction: 'rtl',
      '& *': { 
        fontSize: '14px',
        textAlign: 'right' // הצמדה לימין לכל הטקסט
      }
    }}>
      {/* כותרת */}
      <Typography variant="h6" sx={{ 
        mb: 1, 
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        {elder.firstName} {elder.lastName}
      </Typography>

      {/* מידע בסיסי */}
      <Box sx={{ mb: 1 }}>
        <Typography>כתובת: {elder.address?.street} {elder.address?.city}</Typography>
        <Typography>טלפון: {elder.phone || 'לא צוין'}</Typography>
        <Typography>ביקור אחרון: {formatDate(elder.lastVisit)}</Typography>
        <Typography>דחיפות: {elder.urgency || 'רגילה'}</Typography>
      </Box>

      {/* כפתורים */}
      <Box sx={{ 
        display: 'flex', 
        gap: '8px',
        mb: showDetails ? 2 : 0,
        justifyContent: 'flex-start', // הצמדה לימין
        '& .MuiButton-root': {
          minWidth: '100px', // הגבלת רוחב מינימלי
          maxWidth: '120px', // הגבלת רוחב מקסימלי
          padding: '4px 8px', // הקטנת padding
          height: '28px', // הקטנת גובה
        }
      }}>
        <Button
          variant="contained"
          onClick={() => setShowDetails(!showDetails)}
          sx={{ 
            textTransform: 'none',
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0'
            }
          }}
        >
          פרטי קשיש
        </Button>
        <Button
          variant="contained"
          onClick={handleVisitUpdate}
          sx={{ 
            textTransform: 'none',
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0'
            }
          }}
        >
          עדכן ביקור
        </Button>
      </Box>

      {/* פרטי קשיש - מוצג רק אחרי לחיצה על הכפתור */}
      {showDetails && (
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontWeight: 'bold', mb: 1 }}>פרטים אישיים:</Typography>
          <Typography>איש קשר לחירום: {elder.emergencyContact?.name || 'לא צוין'}</Typography>
          <Typography>טלפון לחירום: {elder.emergencyContact?.phone || 'לא צוין'}</Typography>
          <Typography>סטטוס: {elder.status || 'לא צוין'}</Typography>
          <Typography>תאריך לידה: {formatDate(elder.birthDate)}</Typography>
          <Typography>שפות: {elder.languages?.join(', ') || 'לא צוין'}</Typography>
          
          {elder.lastVisit && (
            <>
              <Typography sx={{ fontWeight: 'bold', mt: 2, mb: 1 }}>מביקור אחרון:</Typography>
              <Typography>תאריך: {formatDate(elder.lastVisit)}</Typography>
              <Typography>הערות: {elder.lastVisitNotes || 'אין הערות'}</Typography>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

const MapView = () => {
  const [mapData, setMapData] = useState({ elderly: [] });
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState([31.7767, 35.2345]);
  const [center, setCenter] = useState([31.7767, 35.2345]);
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [visitFilter, setVisitFilter] = useState('');
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
  const [radius, setRadius] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef(null);
  const [defaultAddress, setDefaultAddress] = useState(null);
  const [isUsingGPS, setIsUsingGPS] = useState(false);
  const [defaultLocation, setDefaultLocation] = useState(null);
  const [volunteerLocation, setVolunteerLocation] = useState(null);
  const [elderlySearchAddress, setElderlySearchAddress] = useState('');
  const [searchInputs, setSearchInputs] = useState({
    name: '',
    address: ''
  });
  const [addressInput, setAddressInput] = useState('');

  // פונקציה לטעינת נתונים מהשרת
  const fetchMapData = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        lat: userLocation[0],
        lng: userLocation[1],
        radius: radius
      });

      const response = await fetch(`/api/dashboard/map?${params}`);
      const data = await response.json();
      setMapData(data);
    } catch (error) {
      console.error('Error fetching map data:', error);
    }
  }, [userLocation, radius]);

  // טעינת נתונים בכל שינוי במיקום או רדיוס
  useEffect(() => {
    fetchMapData();
  }, [userLocation, radius, fetchMapData]);

  // פונקציה מעודכנת לעדכון מיקום לפי כתובת
  const updateLocationByAddress = async (address) => {
    if (!address) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}, Israel`
      );
      const data = await response.json();
      
      if (data && data[0]) {
        const newLocation = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        setUserLocation(newLocation);
        setCenter(newLocation);
        
        // עדכון המפה למיקום החדש
        if (mapRef.current) {
          mapRef.current.flyTo(newLocation, 13);
        }
        
        // רענון הנתונים
        fetchMapData();
      }
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // פונקציה מעודכנת לקבלת המיקום הנוכחי
  const getCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = [position.coords.latitude, position.coords.longitude];
          setUserLocation(newLocation);
          setCenter(newLocation);
          setAddressInput(''); // ניקוי שדה הכתובת
          
          // עדכון המפה למיקום החדש
          if (mapRef.current) {
            mapRef.current.flyTo(newLocation, 13);
          }
          
          // רענון הנתונים
          fetchMapData();
          setIsLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoading(false);
        },
        { enableHighAccuracy: true }
      );
    }
  };

  // פונקציה לסינון קשישים
  const getFilteredElderly = () => {
    return mapData.elderly.filter(elder => {
      // בדיקת מרחק
      const elderLocation = [elder.location.coordinates[1], elder.location.coordinates[0]];
      const distance = calculateDistance(userLocation, elderLocation);
      if (distance > radius) return false;

      // סינון לפי שם
      if (searchName) {
        const fullName = `${elder.firstName || ''} ${elder.lastName || ''}`.toLowerCase();
        if (!fullName.includes(searchName.toLowerCase())) return false;
      }

      // סינון לפי כתובת - כולל עיר
      if (searchAddress) {
        const searchTerm = searchAddress.toLowerCase();
        const elderStreet = (elder.address?.street || '').toLowerCase();
        const elderCity = (elder.address?.city || '').toLowerCase();
        const fullAddress = `${elderStreet} ${elderCity}`;
        
        if (!fullAddress.includes(searchTerm)) return false;
      }

      // סינון לפי ביקור אחרון
      if (visitFilter) {
        const lastVisit = elder.lastVisit ? new Date(elder.lastVisit) : null;
        const daysSinceLastVisit = lastVisit 
          ? Math.floor((new Date() - lastVisit) / (1000 * 60 * 60 * 24))
          : Infinity;

        switch (visitFilter) {
          case 'lastWeek': return daysSinceLastVisit <= 7;
          case 'overWeek': return daysSinceLastVisit > 7;
          case 'overTwoWeeks': return daysSinceLastVisit > 14;
          default: return true;
        }
      }

      return true;
    });
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
      await fetchMapData();
      
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
    <Container maxWidth={false} sx={{ p: 0 }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>מפת ביקורים</Typography>
        
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '100%',
          mb: 2
        }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>עדכון מיקום מתנדב</Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 1,
            width: '300px'
          }}>
            <TextField
              size="small"
              placeholder="הכנס כתובת..."
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  updateLocationByAddress(addressInput);
                }
              }}
              sx={{
                flex: 1,
                '& .MuiInputBase-input': {
                  textAlign: 'right',
                  direction: 'rtl'
                }
              }}
            />
            <Button
              variant="contained"
              onClick={() => updateLocationByAddress(addressInput)}
              disabled={isLoading || !addressInput.trim()}
              size="small"
            >
              עדכן
            </Button>
            <Button
              variant="outlined"
              onClick={getCurrentLocation}
              disabled={isLoading}
              size="small"
            >
              מיקום נוכחי
            </Button>
          </Box>
        </Box>

        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '100%',
          mt: -1
        }}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>סינון קשישים</Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            flexWrap: 'wrap',
            width: '100%'
          }}>
            <TextField
              size="small"
              placeholder="חיפוש לפי שם..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              sx={{
                width: '200px',
                '& .MuiInputBase-input': {
                  textAlign: 'right',
                  direction: 'rtl'
                }
              }}
            />
            <TextField
              size="small"
              placeholder="חיפוש לפי כתובת ועיר..."
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              sx={{
                width: '200px',
                '& .MuiInputBase-input': {
                  textAlign: 'right',
                  direction: 'rtl'
                }
              }}
            />
            <FormControl size="small" sx={{ width: '120px' }}>
              <InputLabel>רדיוס</InputLabel>
              <Select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                label="רדיוס"
              >
                <MenuItem value={5}>5 ק"מ</MenuItem>
                <MenuItem value={10}>10 ק"מ</MenuItem>
                <MenuItem value={20}>20 ק"מ</MenuItem>
                <MenuItem value={50}>50 ק"מ</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ width: '150px' }}>
              <InputLabel>ביקור אחרון</InputLabel>
              <Select
                value={visitFilter}
                onChange={(e) => setVisitFilter(e.target.value)}
                label="ביקור אחרון"
              >
                <MenuItem value="">הכל</MenuItem>
                <MenuItem value="lastWeek">שבוע אחרון</MenuItem>
                <MenuItem value="overWeek">שבוע ויותר</MenuItem>
                <MenuItem value="overTwoWeeks">שבועיים ויותר</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      <div style={{ height: 'calc(100vh - 250px)', width: '100%' }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <ZoomControl position="topleft" />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {userLocation && (
            <>
              <Marker
                position={userLocation}
                icon={volunteerIcon}
              >
                <Popup>
                  <div>
                    <h3>המיקום שלי</h3>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={userLocation}
                radius={radius * 1000}
                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
              />
            </>
          )}
          
          {getFilteredElderly().map((elder) => (
            <Marker
              key={elder._id}
              position={[elder.location.coordinates[1], elder.location.coordinates[0]]}
              icon={createElderlyIcon(calculateUrgency(elder))}
            >
              <Popup>
                <ElderlyPopup elder={elder} />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

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
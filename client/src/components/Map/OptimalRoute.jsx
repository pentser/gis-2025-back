import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

const OptimalRoute = ({ volunteerLocation, elderlyLocations }) => {
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      // יצירת המפה
      mapRef.current = L.map('map').setView([31.771959, 35.217018], 8);
      
      // הוספת שכבת מפה בסיסית
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapRef.current);
    }

    // ניקוי מסלול קודם אם קיים
    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current);
    }

    // חישוב המסלול האופטימלי
    if (volunteerLocation && elderlyLocations.length > 0) {
      // יצירת מערך של נקודות דרך
      const waypoints = [
        L.latLng(volunteerLocation[1], volunteerLocation[0]), // נקודת התחלה - מיקום המתנדב
        ...elderlyLocations.map(loc => L.latLng(loc[1], loc[0])) // נקודות קשישים
      ];

      // יצירת בקר מסלול
      routingControlRef.current = L.Routing.control({
        waypoints,
        routeWhileDragging: true,
        showAlternatives: true,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [{ color: '#1A365D', weight: 4 }]
        },
        createMarker: function() { return null; } // ביטול יצירת סמנים אוטומטיים
      }).addTo(mapRef.current);

      // הוספת סמנים מותאמים אישית
      L.marker(waypoints[0], {
        icon: L.divIcon({
          className: 'volunteer-marker',
          html: '📍',
          iconSize: [30, 30]
        })
      }).addTo(mapRef.current).bindPopup('מיקום מתנדב');

      elderlyLocations.forEach((loc, index) => {
        L.marker([loc[1], loc[0]], {
          icon: L.divIcon({
            className: 'elderly-marker',
            html: '👴',
            iconSize: [30, 30]
          })
        }).addTo(mapRef.current).bindPopup(`קשיש ${index + 1}`);
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, [volunteerLocation, elderlyLocations]);

  return (
    <div id="map" style={{ height: '500px', width: '100%' }} />
  );
};

export default OptimalRoute; 
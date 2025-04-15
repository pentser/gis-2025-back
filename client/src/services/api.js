const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// פונקציית עזר להוספת headers
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// פונקציית עזר לביצוע בקשות
const fetchWithAuth = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'שגיאת שרת' }));
    throw new Error(error.message || 'שגיאת שרת');
  }

  return response.json();
};

export const fetchVisits = () => fetchWithAuth('/api/visits');

export const fetchVisitById = (id) => fetchWithAuth(`/api/visits/${id}`);

export const createVisit = (visitData) => 
  fetchWithAuth('/api/visits', {
    method: 'POST',
    body: JSON.stringify(visitData),
  });

export const updateVisit = (id, visitData) =>
  fetchWithAuth(`/api/visits/${id}`, {
    method: 'PUT',
    body: JSON.stringify(visitData),
  });

export const deleteVisit = (id) =>
  fetchWithAuth(`/api/visits/${id}`, {
    method: 'DELETE',
  });

export const fetchElderly = () => fetchWithAuth('/api/elderly');

export const fetchElderlyById = (id) => fetchWithAuth(`/api/elderly/${id}`);

export const createElderly = (elderlyData) =>
  fetchWithAuth('/api/elderly', {
    method: 'POST',
    body: JSON.stringify(elderlyData),
  });

export const updateElderly = (id, elderlyData) =>
  fetchWithAuth(`/api/elderly/${id}`, {
    method: 'PUT',
    body: JSON.stringify(elderlyData),
  });

export const deleteElderly = (id) =>
  fetchWithAuth(`/api/elderly/${id}`, {
    method: 'DELETE',
  });

export const fetchDashboardData = () => fetchWithAuth('/api/dashboard');

export const fetchMapData = () => fetchWithAuth('/api/map');

export const fetchVisitStats = () => fetchWithAuth('/api/visits/stats');

export const fetchUrgentVisits = () => fetchWithAuth('/api/visits/urgent'); 
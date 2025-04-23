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

export const updateVisit = async (elderId, visitData) => {
  try {
    const response = await fetch(`${API_URL}/visits/${elderId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(visitData)
    });

    if (!response.ok) {
      throw new Error('שגיאה בעדכון הביקור');
    }

    return await response.json();
  } catch (error) {
    throw new Error(error.message);
  }
};

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

export const fetchMapData = (lat, lng) => {
  const params = new URLSearchParams();
  if (lat && lng) {
    params.append('lat', lat);
    params.append('lng', lng);
  }
  return fetchWithAuth(`/api/dashboard/map?${params.toString()}`);
};

export const fetchVisitStats = () => fetchWithAuth('/api/visits/stats');

export const fetchUrgentVisits = () => fetchWithAuth('/api/visits/urgent'); 
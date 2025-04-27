const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// פונקציית עזר להוספת headers
const getHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('נדרשת התחברות מחדש');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// פונקציית עזר לביצוע בקשות
export const fetchWithAuth = async (endpoint, options = {}) => {
  try {
    const headers = getHeaders();
    console.log(`Fetching ${endpoint}...`);

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      }
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('נדרשת התחברות מחדש');
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error fetching ${endpoint}:`, errorData);
      throw new Error(errorData.message || 'שגיאת שרת');
    }

    const data = await response.json();
    console.log(`${endpoint} response:`, data);
    return data;
  } catch (error) {
    console.error(`Error in fetchWithAuth (${endpoint}):`, error);
    throw error;
  }
};

export const fetchVisits = () => fetchWithAuth('/api/visits');

export const fetchVisitById = (id) => fetchWithAuth(`/api/visits/${id}`);

export const createVisit = async (visitData) => {
  try {
    console.log('שולח בקשה ליצירת ביקור:', visitData);
    
    // בדיקות תקינות
    if (!visitData.elder) {
      throw new Error('נדרש לציין קשיש');
    }

    if (!visitData.date) {
      throw new Error('נדרש לציין תאריך');
    }

    if (!visitData.duration) {
      throw new Error('נדרש לציין משך ביקור');
    }

    // אם המשתמש הוא מתנדב, נוודא שיש volunteer ID
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.role === 'volunteer' && !visitData.volunteer) {
      visitData.volunteer = user._id;
    }

    const response = await fetch(`${API_URL}/api/visits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(visitData)
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('שגיאת שרת:', data);
      throw new Error(data.message || 'שגיאה ביצירת ביקור');
    }

    console.log('ביקור נוצר בהצלחה:', data);
    return data;
  } catch (error) {
    console.error('שגיאה ביצירת ביקור:', error);
    throw error;
  }
};

export const updateVisit = async (visitId, visitData) => {
  try {
    const response = await fetch(`${API_URL}/api/visits/${visitId}`, {
      method: 'PUT',
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

export const fetchVolunteers = () => fetchWithAuth('/api/volunteers');

export const fetchVolunteerVisits = async () => {
  try {
    console.log('שולח בקשה לקבלת ביקורים מהשרת');
    const response = await fetch(`${API_URL}/api/visits/my`, {
      headers: {
        ...getHeaders()
      }
    });

    if (!response.ok) {
      console.error('שגיאת שרת:', response.status, response.statusText);
      throw new Error('שגיאה בקבלת ביקורים מהשרת');
    }

    const responseText = await response.text();
    console.log('תשובה גולמית מהשרת:', responseText);

    if (!responseText || responseText.trim() === '') {
      console.error('התקבלה תשובה ריקה מהשרת');
      return [];
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('שגיאה בפענוח JSON:', parseError);
      console.error('התוכן שהתקבל:', responseText);
      return [];
    }

    console.log('תשובה מהשרת אחרי פענוח:', data);

    // בדיקה אם התקבל אובייקט ריק
    if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0) {
      console.error('התקבל אובייקט ריק מהשרת');
      return [];
    }

    // וידוא שהתשובה היא מערך
    if (!Array.isArray(data)) {
      console.error('התשובה מהשרת אינה מערך:', data);
      return [];
    }

    // בדיקת תקינות כל ביקור
    const validVisits = data.filter(visit => {
      if (!visit || typeof visit !== 'object') {
        console.log('נמצא ביקור לא תקין:', visit);
        return false;
      }
      const isValid = visit.elder && visit.date && visit.duration;
      if (!isValid) {
        console.log('ביקור חסר שדות חובה:', visit);
      }
      return isValid;
    });

    console.log('מספר ביקורים תקינים:', validVisits.length);
    return validVisits;
  } catch (error) {
    console.error('שגיאה בקבלת ביקורים:', error);
    throw error;
  }
};

// פונקציה חדשה לשליפת מתנדבים עבור מנהל
export const fetchAdminVolunteers = () => fetchWithAuth('/api/admin/volunteers');

// פונקציה חדשה לשליפת נתוני מפת האדמין
export const fetchAdminMapData = () => fetchWithAuth('/api/admin/map');

export const fetchAdminDashboard = () => fetchWithAuth('/api/admin/dashboard');
export const fetchAdminMap = () => fetchWithAuth('/api/admin/map'); 
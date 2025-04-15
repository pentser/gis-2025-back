const API_BASE_URL = '/api';

export const fetchVisits = async () => {
  const response = await fetch(`${API_BASE_URL}/visits`);
  if (!response.ok) {
    throw new Error('שגיאה בטעינת הביקורים');
  }
  return response.json();
};

export const fetchVisitById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/visits/${id}`);
  if (!response.ok) {
    throw new Error('שגיאה בטעינת הביקור');
  }
  return response.json();
};

export const createVisit = async (visitData) => {
  const response = await fetch(`${API_BASE_URL}/visits`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(visitData),
  });
  if (!response.ok) {
    throw new Error('שגיאה ביצירת הביקור');
  }
  return response.json();
};

export const updateVisit = async (id, visitData) => {
  const response = await fetch(`${API_BASE_URL}/visits/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(visitData),
  });
  if (!response.ok) {
    throw new Error('שגיאה בעדכון הביקור');
  }
  return response.json();
};

export const deleteVisit = async (id) => {
  const response = await fetch(`${API_BASE_URL}/visits/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('שגיאה במחיקת הביקור');
  }
  return response.json();
};

export const fetchElderly = async () => {
  const response = await fetch(`${API_BASE_URL}/elderly`);
  if (!response.ok) {
    throw new Error('שגיאה בטעינת הקשישים');
  }
  return response.json();
};

export const fetchElderlyById = async (id) => {
  const response = await fetch(`${API_BASE_URL}/elderly/${id}`);
  if (!response.ok) {
    throw new Error('שגיאה בטעינת פרטי הקשיש');
  }
  return response.json();
};

export const createElderly = async (elderlyData) => {
  const response = await fetch(`${API_BASE_URL}/elderly`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(elderlyData),
  });
  if (!response.ok) {
    throw new Error('שגיאה ביצירת הקשיש');
  }
  return response.json();
};

export const updateElderly = async (id, elderlyData) => {
  const response = await fetch(`${API_BASE_URL}/elderly/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(elderlyData),
  });
  if (!response.ok) {
    throw new Error('שגיאה בעדכון פרטי הקשיש');
  }
  return response.json();
};

export const deleteElderly = async (id) => {
  const response = await fetch(`${API_BASE_URL}/elderly/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('שגיאה במחיקת הקשיש');
  }
  return response.json();
};

export const fetchDashboardData = async () => {
  const response = await fetch(`${API_BASE_URL}/dashboard`);
  if (!response.ok) {
    throw new Error('שגיאה בטעינת נתוני לוח הבקרה');
  }
  return response.json();
};

export const fetchMapData = async () => {
  const response = await fetch(`${API_BASE_URL}/map`);
  if (!response.ok) {
    throw new Error('שגיאה בטעינת נתוני המפה');
  }
  return response.json();
};

export const fetchVisitStats = async () => {
  const response = await fetch(`${API_BASE_URL}/visits/stats`);
  if (!response.ok) {
    throw new Error('שגיאה בטעינת נתוני הסטטיסטיקה');
  }
  return response.json();
};

export const fetchUrgentVisits = async () => {
  const response = await fetch(`${API_BASE_URL}/visits/urgent`);
  if (!response.ok) {
    throw new Error('שגיאה בטעינת ביקורים דחופים');
  }
  return response.json();
}; 
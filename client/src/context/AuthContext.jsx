import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth חייב להיות בתוך AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else {
        console.error('שגיאה באימות:', await response.text());
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('שגיאה בבדיקת אותנטיקציה:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (formData) => {
    try {
      setError(null);
      const { email, password, role } = formData;
      
      if (!email || !password) {
        throw new Error('נדרש אימייל וסיסמה');
      }

      console.log('מנסה להתחבר עם:', { email, role });
      
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, role })
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('שגיאת התחברות:', data);
        setError(data.message || 'שגיאה בהתחברות');
        throw new Error(data.message || 'שגיאה בהתחברות');
      }

      console.log('התחברות מוצלחת. תגובת השרת:', data);
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        console.log('פרטי המשתמש נשמרו:', data.user);
        return data;
      } else {
        throw new Error('לא התקבל טוקן מהשרת');
      }
    } catch (error) {
      console.error('שגיאה בתהליך ההתחברות:', error);
      setError(error.message);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('שגיאת הרשמה:', data);
        setError(data.message || 'שגיאה בהרשמה');
        throw new Error(data.message || 'שגיאה בהרשמה');
      }

      console.log('הרשמה מוצלחת:', data);
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data;
      } else {
        throw new Error('לא התקבל טוקן מהשרת');
      }
    } catch (error) {
      console.error('שגיאה בהרשמה:', error);
      setError(error.message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('שגיאה בהתנתקות:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await fetch(`${API_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error('שגיאה בעדכון הפרופיל');
      }

      const data = await response.json();
      setUser(data);
      return data;
    } catch (error) {
      console.error('שגיאה בעדכון הפרופיל:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateProfile,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 
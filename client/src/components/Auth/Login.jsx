import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // בדיקה אם הגענו מדף הנחיתה עם פרמטר role
  const role = new URLSearchParams(location.search).get('role');
  const isAdmin = role === 'admin';

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'נדרש אימייל';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'אימייל לא תקין';
    }
    if (!formData.password) {
      errors.password = 'נדרשת סיסמה';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      await login({ ...formData, role: isAdmin ? 'admin' : 'volunteer' });
      if (isAdmin) {
        navigate('/app/dashboard');
      } else {
        navigate('/app/map');
      }
    } catch (err) {
      setError(err.message || 'שגיאה בהתחברות');
    }
  };

  return (
    <div className={styles.authContainer}>
      <form className={styles.authForm} onSubmit={handleSubmit}>
        <h2 className={styles.regTitles}>
          {isAdmin ? 'התחברות מנהל מערכת' : 'התחברות מתנדב'}
        </h2>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="email">אימייל</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          {validationErrors.email && (
            <div className={styles.error}>{validationErrors.email}</div>
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="password">סיסמה</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {validationErrors.password && (
            <div className={styles.error}>{validationErrors.password}</div>
          )}
        </div>

        <button type="submit" className={styles.submitButton}>
          התחבר
        </button>
      </form>
    </div>
  );
};

export default Login; 
import React, { useState } from 'react';
import styles from './ContactForm.module.css';

const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    homeAddress: '',
    workAddress: '',
    notes: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // כאן נוסיף את הלוגיקה לשליחת הטופס לשרת
    console.log('טופס נשלח:', formData);
  };

  return (
    <div className={styles.container}>
      <h2>טופס יצירת קשר</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <label>שם פרטי:</label>
        <input 
          name="firstName" 
          value={formData.firstName} 
          onChange={handleChange} 
          required 
        />

        <label>שם משפחה:</label>
        <input 
          name="lastName" 
          value={formData.lastName} 
          onChange={handleChange} 
          required 
        />

        <label>טלפון:</label>
        <input 
          type="tel" 
          name="phone" 
          value={formData.phone} 
          onChange={handleChange} 
          required 
        />

        <label>מייל:</label>
        <input 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
          required 
        />

        <label>כתובת מגורים:</label>
        <input 
          name="homeAddress" 
          value={formData.homeAddress} 
          onChange={handleChange} 
          required 
        />

        <label>כתובת עבודה:</label>
        <input 
          name="workAddress" 
          value={formData.workAddress} 
          onChange={handleChange} 
        />

        <label>הערות:</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
        />

        <button type="submit">שלח</button>
      </form>
    </div>
  );
};

export default ContactForm; 
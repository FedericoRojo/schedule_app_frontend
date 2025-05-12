import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import '../styles/ProfilePage.css';
import {strings} from '../locales/es.js';

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUser();
  }, []);

  const  fetchUser = async() => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/users/auth`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': token
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data.result);
        setFirstName(data.result.first_name || '');
        setLastName(data.result.last_name || '');
        setPhone(data.result.phone || '');
        setEmail(data.result.email || '');
      } else {
        const errorData = await response.json();
        throw new Error('Register failed, ', errorData.errors);
      }
    } catch (error) {
      throw error;
    }
  }
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await updateProfile( firstName, lastName, phone, email );
        setFirstName(firstName);
        setLastName(lastName);
        setPhone(phone);
        setEmail(email);
      setSuccess('Perfil actualizado correctamente.');
    } catch (err) {
      setError('Error al actualizar el perfil.');
    }
  };

  

  const updateProfile = async ( firstName, lastName, phone, email) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/users/update/profile/${user.id}`, {
        method: 'PUT',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': token
        },
        body: JSON.stringify({ 
          email, 
          firstName,
          lastName,
          phoneNumber: phone
        }),
      });
      if (response.ok) {
        
      } else {
        const errorData = await response.json();
        throw new Error('Register failed, ', errorData.errors);
      }
    } catch (error) {
      throw error;
    }
  };

  return (
  <div className="profile-container">
    <div className="profile-card">
      <h1 className="profile-title">{strings.PROFILE_PAGE.TITLE}</h1>

      {error && <p className="profile-error">{error}</p>}
      {success && <p className="profile-success">{success}</p>}

      <form onSubmit={handleSubmit} className="profile-form">
        <input
          type="text"
          placeholder={strings.PROFILE_PAGE.FIRST_NAME_PLACEHOLDER}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder={strings.PROFILE_PAGE.LAST_NAME_PLACEHOLDER}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder={strings.PROFILE_PAGE.EMAIL_PLACEHOLDER}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="tel"
          placeholder={strings.PROFILE_PAGE.PHONE_PLACEHOLDER}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <button type="submit" className="profile-button">
          {strings.PROFILE_PAGE.BUTTON_TEXT}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;

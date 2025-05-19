import { useState, useContext } from 'react';
import '../styles/RegisterPage.css';
import {strings} from '../locales/es.js';
import { ValidationError } from '../utils/error.js';
import { useNavigate } from 'react-router-dom';
import {registerUser} from './../services/user.js'

function RegisterPage() {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await register(email, password, name, lastName, phoneNumber);
    } catch (err) {
        if (err instanceof ValidationError) {
            setError(err.errors);
        } else {
            setError([{msg: 'Error inesperado'}]);
        }
    }
  };

   const register = async (emailInput, passwordInput, nameInput, lastNameInput, phoneNumberInput) => {
    try {
        await registerUser(emailInput, passwordInput, nameInput, lastNameInput, phoneNumberInput);
        navigate('/login');
    } catch (error) {
        throw error; 
    }
    };

  return (
  <div className="login-container">
    <div className="login-card">
      <h1 className="login-title">{strings.REGISTER_PAGE.TITLE}</h1>
      
      {error && 
      (error.map(elem =>  <p className="login-error" key={elem.msg}>{elem.msg}</p>))
      }

      <form onSubmit={handleSubmit} className="login-form">
        <input 
          type="text"
          placeholder={strings.REGISTER_PAGE.NAME_PLACEHOLDER}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input 
          type="text"
          placeholder={strings.REGISTER_PAGE.LASTNAME_PLACEHOLDER}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder={strings.REGISTER_PAGE.EMAIL_PLACEHOLDER}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          required
        />
        <input 
          type="number"
          placeholder={strings.REGISTER_PAGE.PHONE_PLACEHOLDER}
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={strings.REGISTER_PAGE.PASSWORD_PLACEHOLDER}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          required
        />
        <button type="submit" className="login-button">
          {strings.REGISTER_PAGE.BUTTON_TEXT}
        </button>
      </form>

      <p className="login-footer">
        {strings.REGISTER_PAGE.FOOTER_TEXT} <a href="/login">{strings.REGISTER_PAGE.LOGIN_LINK}</a>
      </p>
    </div>
  </div>
);
}

export default RegisterPage;
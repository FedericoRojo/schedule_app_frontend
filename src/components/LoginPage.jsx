import { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import '../styles/LoginPage.css';
import {strings} from '../locales/es.js';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError('Invalid email or password');
    }
  };

      return (
        <div className="login-container">
          <div className="login-card">
            <h1 className="login-title">{strings.LOGIN_PAGE.TITLE}</h1>
            
            {error && <p className="login-error">{error}</p>}

            <form onSubmit={handleSubmit} className="login-form">
              <input
                type="email"
                placeholder={strings.LOGIN_PAGE.EMAIL_PLACEHOLDER}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="login-input"
                required
              />
              <input
                type="password"
                placeholder={strings.LOGIN_PAGE.PASSWORD_PLACEHOLDER}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
                required
              />
              <button type="submit" className="login-button">
                {strings.LOGIN_PAGE.BUTTON_TEXT}
              </button>
            </form>

            <p className="login-footer">
              {strings.LOGIN_PAGE.FOOTER_TEXT} <a href="/register">{strings.LOGIN_PAGE.REGISTER_LINK}</a>
            </p>
          </div>
        </div>
    );
}

export default LoginPage;
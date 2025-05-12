import { useEffect, useState, useRef, useContext } from "react";
import {useNavigate} from 'react-router-dom'
import { AuthContext } from './AuthContext';
import '../styles/Header.css';
import MenuIcon from '@mui/icons-material/Menu';
import {strings} from '../locales/es.js';

function Header({}){
    const imageLogo = import.meta.env.VITE_APP_IMAGE_ID || 'default';
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null)

   return (
  <header className="header">
    <div className="header-logo" onClick={() => navigate('/')}>
      <img src={`/assets/${imageLogo}.png`} alt={strings.HEADER.LOGO_ALT} />
    </div>

      {user && (
        <div className="header-profile-container" ref={dropdownRef}>
          <div 
            className="header-profile" 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <MenuIcon fontSize="medium"/>
          </div>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div 
                className="dropdown-item"
                onClick={() => {
                  navigate('/profile');
                  setIsDropdownOpen(false);
                }}
              >
                {strings.HEADER.PROFILE}
              </div>
              {
                user.role == 1 && (
                  <div 
                    className="dropdown-item"
                    onClick={() => {
                      navigate('/admin/employee');
                      setIsDropdownOpen(false);
                    }}
                  >
                    {strings.HEADER.ADMINISTRATION}
                  </div>
                ) 
              }
              {
                user.role == 2 && (
                  <div 
                    className="dropdown-item"
                    onClick={() => {
                      navigate('/admin');
                      setIsDropdownOpen(false);
                    }}
                  >
                    {strings.HEADER.ADMINISTRATION}
                  </div>
                ) 
              }
              
              <div 
                className="dropdown-item"
                onClick={() => {
                  logout();
                  setIsDropdownOpen(false);
                }}
              >
                {strings.HEADER.LOGOUT}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
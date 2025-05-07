import { useEffect, useState, useRef, useContext } from "react";
import {useNavigate} from 'react-router-dom'
import { AuthContext } from './AuthContext';
import '../styles/Header.css';
import logo from '../assets/logo.avif';

function Header({}){
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null)

    return (
        <header className="header">
          <div className="header-logo" onClick={() => navigate('/')}>
            <img src={logo} alt="App Logo" />
          </div>
    
          {user && (
            <div className="header-profile-container" ref={dropdownRef}>
              <div 
                className="header-profile" 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <img src={logo} alt="Profile" />
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
                    Profile
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
                        Administración
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
                        Administración
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
                    Logout
                  </div>
                </div>
              )}
            </div>
          )}
        </header>
      );
}

export default Header;
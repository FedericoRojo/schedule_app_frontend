import { useState, useContext } from 'react';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/EmployeeSchedule.css';
import { AuthContext } from './AuthContext';
import AvailabilityManager from './EmployeeSections/AvailabilityManager';
import AppointmentManager from './EmployeeSections/AppointmentManager'

const EmployeeSchedule = ({ localizer }) => {
  const {user} = useContext(AuthContext)
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('appointments');

  return (
    <div className="schedule-container">
      <div className="sidebar">
        <button 
          className={`sidebar-button ${activeTab === 'appointments' ? 'active' : ''}`}
          onClick={() => setActiveTab('appointments')}
        >
          Turnos
        </button>
        <button 
          className={`sidebar-button ${activeTab === 'availability' ? 'active' : ''}`}
          onClick={() => setActiveTab('availability')}
        >
          Disponibilidad
        </button>
      </div>

      <div className="main-content">
        {activeTab === 'appointments' ? (
          <AppointmentManager 
            employeeId={user.id}
          />
        ) : (
          <AvailabilityManager 
            employeeId={user.id}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            />
        )}
      </div>
    </div>
  );
};


export default EmployeeSchedule;
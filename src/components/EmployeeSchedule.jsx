import { useState, useContext } from 'react';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/EmployeeSchedule.css';
import { AuthContext } from './AuthContext';
import AvailabilityManager from './AvailabilityManager';

const EmployeeSchedule = ({ localizer }) => {
  const {user} = useContext(AuthContext)
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('appointments');
  const [localDate, setLocalDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [serviceDuration] = useState(60); // Ejemplo

  const handleNavigate = (newDate) => {
    setLocalDate(newDate);
  };

  const calendarEvents = () => {
    // Tu lógica existente para generar eventos
    return [
      // Eventos de ejemplo
      {
        title: 'Disponible',
        start: new Date(2024, 2, 25, 9, 0),
        end: new Date(2024, 2, 25, 10, 0),
        status: 'available'
      },
      {
        title: 'Turno Ocupado',
        start: new Date(2024, 2, 25, 11, 0),
        end: new Date(2024, 2, 25, 12, 0),
        status: 'booked'
      }
    ];
  };

  const eventStyleGetter = (event) => {
    const backgroundColor = event.status === 'available' ? '#90EE90' : '#FF7F7F';
    return { style: { backgroundColor } };
  };

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
          <AppointmentsSection 
            appointments={appointments}
            onCancelAppointment={(id) => {/* Lógica de cancelación */}}
          />
        ) : (
          <AvailabilitySection 
            employeeId={user.id}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            />
        )}
      </div>
    </div>
  );
};

// Componente para la sección de Turnos
const AppointmentsSection = ({ appointments, onCancelAppointment }) => {
  return (
    <div className="appointments-section">
      <h2>Próximos Turnos</h2>
      
      <table className="appointments-table">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Servicio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(appointment => (
            <tr key={appointment.id}>
              <td>{appointment.clientName}</td>
              <td>{moment(appointment.date).format('DD/MM/YYYY')}</td>
              <td>{moment(appointment.startTime).format('HH:mm')}</td>
              <td>{appointment.serviceName}</td>
              <td>
                <button 
                  className="cancel-button"
                  onClick={() => onCancelAppointment(appointment.id)}
                >
                  Cancelar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const AvailabilitySection = ({ employeeId, selectedDate, setSelectedDate }) => {
  return (
    <div className="availability-section">
      <AvailabilityManager 
          employeeId={employeeId}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}/>
    </div>
  );
};

export default EmployeeSchedule;
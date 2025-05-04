import { useEffect, useState } from "react";
import {useNavigate} from 'react-router-dom';
import moment from 'moment';
import '../styles/HomePage.css';

function HomePage({}){

  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [appointments, setAppointments] = useState([]);  
  const [reload, setReload] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [reload]);

  const fetchAppointments = async() => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/appointment`, {
      method: 'GET',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json();
    console.log(data);
    setAppointments(data.result);
  }

  const handleCancelAppointment = (id) => {
    fetchCancelAppointment(id);
  };

  const fetchCancelAppointment = async (id) => {
    const token = localStorage.getItem('token');
    try{
      const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/appointment/cancel/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': token
        }
      })
      const data = await response.json();
      console.log(data);
      setReload(prev => !prev);
    }catch(error){
      console.log(error);
      setError(error.msg);
    }
  }

  return (
    <div className="home-page">
      <h1 className="title">Turnos</h1>
      <div className="appointments-list">
        {(appointments != null && appointments.length > 0) ? (
          appointments.map((appt) => (
            (appt.status != "cancelled") && 
            (
            <div key={appt.id} className="appointment-card">
              <div className="appointment-details">
                <p><strong>Service:</strong> {appt.service_name}</p>
                <p><strong>Date:</strong> {moment(appt.date).format('YYYY-MM-DD')}</p>
                <p><strong>Time:</strong> {moment(appt.time).format('HH:mm')}</p>
              </div>
              <button 
                onClick={() => handleCancelAppointment(appt.id)}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
            )
            
          ))
        ) : (
          <p className="no-appointments">No appointments scheduled.</p>
        )}
      </div>

      <button 
        onClick={() => navigate('/book')} 
        className="book-button"
      >
        Book New Appointment
      </button>
    </div>
  );
}

export default HomePage;
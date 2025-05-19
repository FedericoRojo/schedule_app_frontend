import { useEffect, useState } from "react";
import {useNavigate} from 'react-router-dom';
import moment from 'moment';
import '../styles/HomePage.css';
import {strings} from '../locales/es.js'
import {getUserAppointments, cancelAppointment} from './../services/appointment.js';

function HomePage({}){

  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [canBook, setCanBook] = useState(true);
  const [appointments, setAppointments] = useState([]);  
  const [reload, setReload] = useState(false);
  const distanceInDaysFromActualDate = 7;
  const maxAppointmentsPerPerson = 5;

  useEffect(() => {
    fetchAppointments();
  }, [reload]);


    

  

  const fetchAppointments = async() => {
    const response = await getUserAppointments();
    const data = await response.json();
    setAppointments(data.result);
  }

  const handleCancelAppointment = (id) => {
    fetchCancelAppointment(id);
  };

  const fetchCancelAppointment = async (id) => {
    try{
      const response = await cancelAppointment(id);
      setReload(prev => !prev);
    }catch(error){
      console.log(error);
      setError(error.msg);
    }
  }

  return (
    <div className="home-page">
      <h1 className="title">{strings.HOME_PAGE.TITLE}</h1>
      <div className="appointments-list">
        {appointments && appointments.length > 0 ? (
          appointments
            .filter(appt => appt.status !== "cancelled")
            .map(appt => {
              
              const date =  moment.utc(appt.start_time).format('YYYY-MM-DD');
              const time =    moment.utc(appt.start_time).local().format('HH:mm');

              return (
                <div key={appt.id} className="appointment-card">
                  <div className="appointment-details">
                    <p><strong>{strings.HOME_PAGE.DETAIL_LABELS.SERVICE}</strong> {appt.service_name}</p>
                    <p><strong>{strings.HOME_PAGE.DETAIL_LABELS.DATE}</strong> {date}</p>
                    <p><strong>{strings.HOME_PAGE.DETAIL_LABELS.TIME}</strong> {time}</p>
                  </div>
                  <button
                    onClick={() => handleCancelAppointment(appt.id)}
                    className="cancel-button"
                  >
                    {strings.HOME_PAGE.CANCEL_BUTTON}
                  </button>
                </div>
              );
            })
        ) : (
          <p className="no-appointments">{strings.HOME_PAGE.NO_APPOINTMENTS}</p>
        )}
      </div>
      { canBook && (
        <button 
          onClick={() => navigate('/book')} 
          className="book-button"
        >
          {strings.HOME_PAGE.BOOK_BUTTON}
        </button>
      )}
    </div>
  );
}

export default HomePage;
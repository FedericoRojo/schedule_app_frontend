import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/es'; 
import {calculateAvailableSlotsExcludingAppointments} from '../../utils/format.js';
import {getAppointments, updateAppointmentStatus} from '../../services/appointment.js';
import {getAvailabilities} from '../../services/availability.js'

import {calendarHourEnd, calendarHourStart} from './../../utils/calendar_config.js'
import '../../styles/AppointmentManager.css';
import {strings} from '../../locales/es.js'


moment.updateLocale('es', {
      week: { dow: 1 }               
    });
moment.locale('es');
const localizer = momentLocalizer(moment);


const AppointmentManager = ({
    employeeId
}) => {
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [localDate, setLocalDate] = useState(selectedDate || new Date());
  const [appointmentStatus, setAppointmentStatus] = useState({id: '', status: ''});



  useEffect(() => {
    fetchData();
  }, [localDate]);

  const getWeekRange = (localDate) => {
            const today = moment().startOf('day');
            const weekStart = moment(localDate).startOf('isoWeek');
            const start = weekStart.isBefore(today) ? today.format('YYYY-MM-DD') : weekStart.format('YYYY-MM-DD');
            
            const end   = moment(localDate).endOf('isoWeek').format('YYYY-MM-DD');
  
            return {start, end}
  }

  const fetchData = async () => {
    try {
        const {start, end} = getWeekRange(localDate);

        const availabilityResponse = await getAvailabilities(employeeId, start, end)
        const appointmetsResponse = await getAppointments(employeeId, start, end)
        
        const availabilityData = await availabilityResponse.json();
        const appointmentData = await appointmetsResponse.json();

        
        setAvailability(availabilityData.result);
        setAppointments(appointmentData.result);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };


  const buildEvents = () => {
    const result = [];
    let newAvailability = calculateAvailableSlotsExcludingAppointments(availability, appointments);
    if (newAvailability != null && newAvailability.length != 0) {
      newAvailability.forEach(slot => {
          const start = moment.utc(slot.start_time).local().toDate();
          const end = moment.utc(slot.end_time).local().toDate();
          result.push({
            id: `avail-${slot.id}`,
            start: start,
            end: end,
            title: strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.SLOTS.TITLE_AVAIL,
            status: strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.SLOTS.STATUS_AVAIL,
            resource: slot
          });
      });
    }
  
    if (appointments != null && appointments.length != 0) {
      appointments.forEach(appt => {
        const start = moment.utc(appt.startTime).local().toDate();
        const end = moment.utc(appt.endTime).local().toDate();
        
        result.push({
          id: `appt-${appt.id}`,
          start: start,
          end: end,
          title: appt.service.name,
          status: appt.status,
          resource: appt
        });
      });
    }
    return result;
  }

  
  const events = useMemo(() => buildEvents(), [availability, appointments]);
  

  const eventStyleGetter = (event) => {
      const statusColors = {
        availability: '#AED6F1',  
        appointment: {
          pending: '#F1C40F',     
          confirmed: '#3498DB',   
          cancelled: '#E74C3C',   
          completed: '#27AE60'    
        }
      };

      const backgroundColor = event.status === 'availability' 
          ? statusColors.availability 
          : statusColors.appointment[event.status] || '#F5F5F5';  

        const style = {
          backgroundColor,
          borderRadius: '4px',
          border: 'none',
          color: '#000',
          opacity: event.status === 'cancelled' ? 0.7 : 1,  
          fontStyle: event.status === 'completed' ? 'italic' : 'normal'
        };

        return { style };
    };

  

  const onSelectEvent = (event) => {

    if(event.resource.client != null){
      setSelectedEvent({
        id: event.id,
        user: event.resource.client.name,
        phone: event.resource.client.phone,
        service: event.resource.service.name,
        duration: event.resource.service.duration,
        start: moment(event.start).format('HH:mm'),
        date: moment(event.start).format('YYYY-MM-DD'),
        status: event.resource.status
      })
      setShowModal(true);
    }
  };

  const confirmChangeAppointmentStatus = async() => {
    try{
      const selectedId = appointmentStatus.id;
      const elemId = selectedId.split('-')[1];
      const response = await updateAppointmentStatus(elemId, appointmentStatus.status)

      setAppointments( prevAppt => prevAppt.map(elem => 
        elem.id != elemId 
        ? elem 
        : {...elem, status: appointmentStatus.status})
      )


      setAppointmentStatus({id: '', status: ''})
      setShowModal(false)
    }catch(e){
      console.log(e);
    }
  }

  const handleNavigate = (newDate) => {
    const monday = moment(newDate).startOf('isoWeek').toDate();
    setLocalDate(monday);
  };

  return (
    <div className="p-4">
      
      <Calendar
        onNavigate={handleNavigate}
        culture='es'
        date={localDate}
        localizer={localizer}
        events={events}
        defaultView="week"
        views={['day', 'week', 'month']}
        step={15}
        timeslots={2}
        min={new Date(0,0,0,calendarHourStart,0)}
        max={new Date(0,0,0,calendarHourEnd,0)}
        style={{ height: '80vh' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={onSelectEvent}
         messages={{
                      next: strings.CALENDAR.NEXT,
                      previous: strings.CALENDAR.PREVIOUS,
                      today: strings.CALENDAR.TODAY,
                      month: strings.CALENDAR.MONTH,
                      week: strings.CALENDAR.WEEK,
                      day: strings.CALENDAR.DAY,
        }}
      />

      {showModal && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setShowModal(false)}
          setAppointmentStatus={setAppointmentStatus}
          appointmentStatus={appointmentStatus}
          onConfirm={confirmChangeAppointmentStatus}
        />
      )}
    </div>
  );
};

export default AppointmentManager;

const EventDetailsModal = ({event, onClose, onConfirm, appointmentStatus, setAppointmentStatus}) => {
  if (!event) return null

  return (
    <div className="edm-overlay">
  <div className="edm-container">
    <h2 className="edm-title">
      {strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.TITLE}
    </h2>
    
    <div className="edm-content">
      <p>
        <strong>{strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.LABELS.SERVICE}:</strong> 
         {event.service || strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.DEFAULTS.SERVICE}
      </p>
      
      <p>
        <strong>{strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.LABELS.DATE}:</strong> 
         {event.date?.toString() || strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.DEFAULTS.DESCRIPTION}
      </p>
      
      <p>
        <strong>{strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.LABELS.START}:</strong> 
         {event.start?.toString() || strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.DEFAULTS.START_DATE}
      </p>
      
      <p>
        <strong>{strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.LABELS.DURATION}:</strong> 
         {event.duration || strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.DEFAULTS.DESCRIPTION} 
         {strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.UNITS.DURATION}
      </p>

      <p>
        <strong>{strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.LABELS.USER}:</strong> 
        {event.user || strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.DEFAULTS.USER_NAME}
      </p>
      
      <p>
        <strong>{strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.LABELS.PHONE}:</strong> 
         {event.phone || strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.DEFAULTS.USER_PHONE}
      </p>

      <div className="status-container">
          <label htmlFor="status-select">
            <strong>{strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.LABELS.STATUS}:</strong>
          </label>
          <select
            id="status-select"
            value={appointmentStatus.status || event.status || strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.DEFAULTS.USER_STATUS}
            onChange={(e) => setAppointmentStatus({id: event.id, status: e.target.value})}
            className="status-select"
          >
            {Object.entries(strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.STATUS).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>
      </div>
    </div>

    <div className="edm-actions">
      <button onClick={onClose} className="edm-close-button">
        {strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.BUTTONS.CLOSE}
      </button>
      <button onClick={onConfirm} className="edm-close-button">
        {strings.EMPLOYEE_SCHEDULE.APPOINTMENT_MANAGER.DETAILS.BUTTONS.CONFIRM}
      </button>
    </div>
  </div>
</div>
  )
}

  
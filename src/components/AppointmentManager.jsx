import React, { useEffect, useState, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'moment/locale/es'; 


moment.updateLocale('es', {
      week: { dow: 1 }               // dow = day of week: lunes=1 … domingo=7
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



  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const start = moment(localDate).startOf('isoWeek').format('YYYY-MM-DD');
        const end   = moment(localDate).endOf('isoWeek').format('YYYY-MM-DD');
        
        const token = localStorage.getItem('token');
        const availabilityResponse = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/availability/employee?employeeId=${employeeId}&startDay=${start}&endDay=${end}`, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            })
        const appointmetsResponse = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/appointment/employee?employeeId=${employeeId}&startDay=${start}&endDay=${end}`, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            })

        const availabilityData = await availabilityResponse.json();
        const appointmentData = await appointmetsResponse.json();

        setAvailability(availabilityData.result);
        setAppointments(appointmentData.result);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const events = useMemo(() => {
    const result = [];
  
    if (availability != null && availability.length != 0) {
      availability.forEach(slot => {
        result.push({
          id: `avail-${slot.id}`,
          start: new Date(`${slot.date}T${slot.start_time}`),
          end: new Date(`${slot.date}T${slot.end_time}`),
          title: 'Available',
          type: 'availability',
          data: slot,
        });
      });
    }
  
    if (appointments != null && appointments.length != 0) {
      appointments.forEach(appt => {
        result.push({
          id: `appt-${appt.id}`,
          start: new Date(`${appt.date}T${appt.start_time}`),
          end: moment(`${appt.date}T${appt.start_time}`).add(appt.duration || 1, 'hours').toDate(),
          title: appt.service_name,
          type: 'appointment',
          data: appt,
        });
      });
    }
    return result;
  }, [availability, appointments]);
  

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.type === 'availability' ? '#E0F7FA' : '#FFE0B2',
      borderRadius: '4px',
      border: 'none',
      color: '#000',
    };
    return { style };
  };

  const onSelectEvent = (event) => {
    setSelectedEvent(event.data);
    setShowModal(true);
  };

  return (
    <div className="p-4">
      <Calendar
        localizer={localizer}
        events={events}
        defaultView="week"
        views={['day', 'week', 'month']}
        step={15}
        timeslots={2}
        style={{ height: '80vh' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={onSelectEvent}
      />

      {showModal && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default AppointmentManager;

const EventDetailsModal = ( ) => {
  return (<></>)
}

  
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

  const subtractAppointmentsFromAvailability = (availability, appointments) => {
    let newSlots = availability.map(slot => ({ ...slot }));
    
    
    if(appointments.length > 0){

      appointments.forEach(appt => {
        const temp = [];
        const dateOnly = moment.utc(appt.date).format('YYYY-MM-DD');
        const startA = moment.utc(`${dateOnly}T${appt.startTime}`);
        const endA = moment.utc(`${dateOnly}T${appt.endTime}`);
        
        newSlots.forEach(slot => {
          const slotDateOnly = moment.utc(slot.date).format('YYYY-MM-DD');
          const startS = moment.utc(`${slotDateOnly}T${slot.start_time}`);
          const endS = moment.utc(`${slotDateOnly}T${slot.end_time}`);

          if (!startA.isSame(startS, 'day') || endA.isSameOrBefore(startS) || startA.isSameOrAfter(endS)) {
            temp.push(slot);
          } else {
            const overlapStart = moment.max(startA, startS);
            const overlapEnd = moment.min(endA, endS);

            if (startS.isBefore(overlapStart)) 
              temp.push({ 
                    id: `${slot.id}-pre-${startS.valueOf()}`,
                    date: slot.date, 
                    start_time: startS.format('HH:mm:ss'),
                    end_time: overlapStart.format('HH:mm:ss') });
            if (overlapEnd.isBefore(endS))
               temp.push({ 
                    id: `${slot.id}-post-${overlapEnd.valueOf()}`,
                    date: slot.date, 
                    start_time: overlapEnd.format('HH:mm:ss'), 
                    end_time: endS.format('HH:mm:ss') });
          
          }

        });

        newSlots = temp;
      });

    }

    return newSlots;
  };

  const events = useMemo(() => {
    const result = [];
    
    let newAvailability = subtractAppointmentsFromAvailability(availability, appointments);

    if (newAvailability != null && newAvailability.length != 0) {
      newAvailability.forEach(slot => {
          const datePart = moment.utc(slot.date).format('YYYY-MM-DD'); 
          const start = moment.utc(`${datePart}T${slot.start_time}`).local().toDate();
          const end = moment.utc(`${datePart}T${slot.end_time}`).local().toDate();
          result.push({
            id: `avail-${slot.id}`,
            start: start,
            end: end,
            title: 'Available',
            status: 'availability'
          });
      });
    }
  
    if (appointments != null && appointments.length != 0) {
      appointments.forEach(appt => {
        const datePart = moment.utc(appt.date).format('YYYY-MM-DD'); 
        const start = moment.utc(`${datePart}T${appt.startTime}`).local().toDate();
        const end = moment.utc(`${datePart}T${appt.endTime}`).local().toDate();

        result.push({
          id: `appt-${appt.id}`,
          start: start,
          end: end,
          title: appt.service.name,
          status: 'appointment'
        });
      });
    }
    console.log(result);
    return result;
  }, [availability, appointments]);

  const buildEvents = () => {
    const result = [];
    
    let newAvailability = subtractAppointmentsFromAvailability(availability, appointments);

    if (newAvailability != null && newAvailability.length != 0) {
      newAvailability.forEach(slot => {
          const datePart = moment.utc(slot.date).format('YYYY-MM-DD'); 
          const start = moment.utc(`${datePart}T${slot.start_time}`).local().toDate();
          const end = moment.utc(`${datePart}T${slot.end_time}`).local().toDate();
          result.push({
            id: `avail-${slot.id}`,
            start: start,
            end: end,
            title: 'Available',
            status: 'availability',
            resource: slot
          });
      });
    }
  
    if (appointments != null && appointments.length != 0) {
      appointments.forEach(appt => {
        const datePart = moment.utc(appt.date).format('YYYY-MM-DD'); 
        const start = moment.utc(`${datePart}T${appt.startTime}`).local().toDate();
        const end = moment.utc(`${datePart}T${appt.endTime}`).local().toDate();

        result.push({
          id: `appt-${appt.id}`,
          start: start,
          end: end,
          title: appt.service.name,
          status: 'appointment',
          resource: appt
        });
      });
    }
    console.log(result);
    return result;
  }
  

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: event.status === 'availability' ? '#E0F7FA' : '#FFE0B2',
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
      {console.log(events)}
      
      <Calendar
        localizer={localizer}
        events={buildEvents()}
        defaultView="week"
        views={['day', 'week', 'month']}
        step={15}
        timeslots={2}
        min={new Date(0,0,0,8,0)}
        max={new Date(0,0,0,20,0)}
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

  
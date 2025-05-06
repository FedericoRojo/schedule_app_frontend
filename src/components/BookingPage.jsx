import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BookingPage.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

const BookingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(moment().toDate());
  const [services, setServices] = useState([]);
  const [specialists, setSpecialists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const servicesResponse = await fetch(
          `${import.meta.env.VITE_APP_API_BASE_URL}/services`,
          {headers: {
            'Authorization': token,
            'Content-Type': "application-json"
          }}
        );
        const servicesData = await servicesResponse.json();
        
        const specialistsResponse = await fetch(
          `${import.meta.env.VITE_APP_API_BASE_URL}/users/employees`,
          {
            headers: {
              'Authorization': token,
              "Content-Type": "application-json"
            }
          }
        );
        const specialistsData = await specialistsResponse.json();

        setServices(servicesData.result);
        setSpecialists(specialistsData.result);
      } catch (error) {
        console.error('Fetch error:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);  

 

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleSpecialistSelect = (specialist) => {
    setSelectedSpecialist(specialist);
    setCurrentStep(3);
  };

  const handleAppointmentConfirmation = async () => {
    const token = localStorage.getItem('token');
    const specialistID = selectedSpecialist.id;   

    const timeUTC = moment(selectedTime).utc();
    const dateUTC      = timeUTC.format('YYYY-MM-DD');
    const startTimeUTC = timeUTC.format('HH:mm');
    const endTimeUTC = timeUTC.clone().add(selectedService.duration, 'minutes').format('HH:mm');

    const appointmentConfirmationResponse = await fetch(`
      ${import.meta.env.VITE_APP_API_BASE_URL}/appointment/new`,
      { method: 'POST',
        headers: 
        {
        'Authorization': token,
        'Content-Type': "application/json"
        }
      , body: JSON.stringify({
          employee_id: specialistID, 
          service_id: selectedService.id, 
          date: timeUTC.format('YYYY-MM-DD'), 
          start_time: startTimeUTC,
          end_time: endTimeUTC
        })
      });

    
    const appointmentConfirmationData = await appointmentConfirmationResponse.json();
    navigate('/');
  }

  return (
    <div className="booking-container">
      <div className="stepper">
        <div 
          className={`step ${currentStep >= 1 ? 'active' : ''}`} 
          onClick={() => currentStep > 1 && setCurrentStep(1)}
        >
          1. Service
        </div>
        <div 
          className={`step ${currentStep >= 2 ? 'active' : ''}`} 
          onClick={() => currentStep > 2 && setCurrentStep(2)}
        >
          2. Specialist
        </div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
          3. Date & Time
        </div>
      </div>

      <div className="step-content">
        {currentStep === 1 && (
            isLoading ? (
              <div className="loading-message">Loading services...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <ServiceStep 
                services={services}
                selectedService={selectedService}
                onSelect={handleServiceSelect}
              />
            )
        )}

        {currentStep === 2 && (
          <SpecialistStep 
            specialists={specialists}
            selectedSpecialist={selectedSpecialist}
            onSelect={handleSpecialistSelect}
            onBack={() => setCurrentStep(1)}
          />
        )}

        {currentStep === 3 && (
          <TimeStep 
            onBack={() => setCurrentStep(2)}
            setCurrentStep={setCurrentStep}
            employeeId={selectedSpecialist.id}
            serviceDuration={selectedService.duration}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
          />
        )}

        {currentStep === 4 && (
          <SummaryStep 
            selectedService={selectedService}
            selectedSpecialist={selectedSpecialist}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onBack={() => setCurrentStep(3)}
            onConfirm={handleAppointmentConfirmation}
          />
        )}

      </div>
    </div>
  );
};


const ServiceStep = ({ services, selectedService, onSelect }) => (
  <div className="step-wrapper">
    <h2>Select a Service</h2>
    {services.length === 0 
    ? 
      (<div className="empty-message">No services available</div>) 
    : 
      (<div className="card-grid">
        {services.map((service) => (
          <div 
            key={service.id}
            className={`card ${selectedService?.id === service.id ? 'selected' : ''}`}
            onClick={() => onSelect(service)}
          >
            <h3>{service.name}</h3>
            <p>{service.duration}</p>
          </div>
        ))}
        </div>
      )
    }
    
  </div>
);

const SpecialistStep = ({ specialists, selectedSpecialist, onSelect, onBack }) => (
  <div className="step-wrapper">
    <h2>Select a Specialist</h2>
    <button className="back-button" onClick={onBack}>
      ← Back to Services
    </button>
    <div className="card-grid">
      {specialists.map((specialist) => (
        <div 
          key={specialist.id}
          className={`card ${selectedSpecialist?.id === specialist.id ? 'selected' : ''}`}
          onClick={() => onSelect(specialist)}
        >
          <h3>{specialist.first_name} {specialist.last_name}</h3>
        </div>
      ))}
    </div>
  </div>
);

const TimeStep = ({
  employeeId,
  serviceDuration,
  onBack,
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  setCurrentStep
}) => {
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [localDate, setLocalDate] = useState(selectedDate || new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  // UTC ↔ Local helpers
  const toUTCString = dateLocal => moment(dateLocal).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');

  useEffect(() => {
    setSelectedDate(localDate);
  }, [localDate, setSelectedDate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!employeeId || !serviceDuration) return;
      setIsLoading(true);
      try {
        const { start, end } = getWeekRange(localDate);
        const token = localStorage.getItem('token');
        const [availRes, appsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/availability/employee?employeeId=${employeeId}&startDay=${start}&endDay=${end}`, { headers: { Authorization: token, 'Content-Type': 'application/json' }}),
          fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/appointment/employee?employeeId=${employeeId}&startDay=${start}&endDay=${end}`, { headers: { Authorization: token, 'Content-Type': 'application/json' }})
        ]);
        const availData = await availRes.json();
        const appsData = await appsRes.json();
        setAvailability(availData.result || []);
        setAppointments(appsData.result || []);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [localDate, employeeId, serviceDuration]);

  // Generate free slots in UTC
  const generateNewAvailabilityUTC = (availability, appointments) => {
    let newSlots = availability.map(slot => ({ ...slot }));

    console.log(appointments);
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
          console.log(startS);

          if (!startA.isSame(startS, 'day') || endA.isSameOrBefore(startS) || startA.isSameOrAfter(endS)) {
            temp.push(slot);
          } else {
            const overlapStart = moment.max(startA, startS);
            const overlapEnd = moment.min(endA, endS);
            if (startS.isBefore(overlapStart)) temp.push({ date: slot.date, start_time: startS.format('HH:mm:ss'), end_time: overlapStart.format('HH:mm:ss') });
            if (overlapEnd.isBefore(endS)) temp.push({ date: slot.date, start_time: overlapEnd.format('HH:mm:ss'), end_time: endS.format('HH:mm:ss') });
          }

        });
        newSlots = temp;
      });

    }

    return newSlots;
  };

  // Generate time slots of serviceDuration in UTC
  const generateTimeSlotsUTC = () => {
    
    if (availability.length == 0 && !serviceDuration) return [];

    const freeSlots = generateNewAvailabilityUTC(availability, appointments);
    
    const slots = [];

    freeSlots.forEach(slot => {
      const datePart = moment.utc(slot.date).format('YYYY-MM-DD'); 
      let current = moment.utc(`${datePart}T${slot.start_time}`); 
      const end     = moment.utc(`${datePart}T${slot.end_time}`);

      while (current.isBefore(end)) {
        const endSlot = moment.utc(current).add(serviceDuration, 'minutes');
        if (endSlot.isSameOrBefore(end)) {
          slots.push({
            id: current.valueOf(),
            start: current.toDate(),
            end: endSlot.toDate(),
            status: 'available',
            title: 'Available'
          });
          current = endSlot;
        } else break;
      }

    });

    return slots;
  };

  // Calendar events with local times
  const calendarEvents = () => {
    let result = generateTimeSlotsUTC().map(slot => ({
      id: slot.id,
      title: slot.title,
      start: moment.utc(slot.start).local().toDate(),
      end: moment.utc(slot.end).local().toDate(),
      status: slot.status,
      resource: slot
    })) 

    return result;

  };

  // Style events, highlight selected
  const eventStyleGetter = event => {
    const isSelected = event?.id === selectedEvent?.id;
    return {
      style: {
        backgroundColor: isSelected ? '#3399FF' : '#90EE90',
        border: isSelected ? '2px solid #0066CC' : 'none',
        borderRadius: '4px',
        color: 'black'
      }
    };
  };

  // Select event
  const handleSelectEvent = event => {
    if (event) {
      setSelectedEvent(event);
    }
  };

  const handleNavigate = (newDate) => {
      setLocalDate(newDate);
  };

  const onSubmit = () => {
    setSelectedTime(selectedEvent.start); 
    setCurrentStep(4)
  };

  return (
    <div className="time-step-container">
      <button className="back-button" onClick={onBack}>← Back to Specialist</button>
      <div className="calendar-container">
        {isLoading ? (
          <div className="loading-message">Loading availability...</div>
        ) : (
          <Calendar
            localizer={localizer}
            events={calendarEvents()}
            defaultView="week"
            views={[ 'week' ]}
            date={localDate}
            onNavigate={handleNavigate}
            style={{ height: 500 }}
            min={new Date(0,0,0,8,0)}
            max={new Date(0,0,0,20,0)}
            eventPropGetter={eventStyleGetter}
            selectable
            onSelectEvent={handleSelectEvent}
          />
        )}
      </div>
      {selectedEvent && (
        <button className="confirm-button next-button mt-4" onClick={onSubmit}>
          Confirm
        </button>
      )}
    </div>
  );
};



  const getWeekRange = (date = new Date(), weekStartsOn = 1) => {
    const d = new Date(date);
    const day = d.getDay();
    
    // Calculate start date
    const diff = d.getDate() - day + (day === 0 ? -6 : weekStartsOn);
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
  
    // Calculate end date
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  
    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    };
  };

  const SummaryStep = ({ 
    selectedService, 
    selectedSpecialist, 
    selectedDate, 
    selectedTime, 
    onBack, 
    onConfirm 
  }) => {
    const formattedDate = moment(selectedTime).format('LL');
    const formattedTime = moment(selectedTime).format('LT');
  
    return (
      <div className="step-wrapper">
        <h2>Confirmación de Turno</h2>
        <button className="back-button" onClick={onBack}>
          ← Volver a Horario
        </button>
        
        <div className="summary-details">
          <div className="detail-item">
            <span className="detail-label">Servicio:</span>
            <span className="detail-value">{selectedService.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Especialista:</span>
            <span className="detail-value">
              {selectedSpecialist.first_name} {selectedSpecialist.last_name}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Precio:</span>
            <span className="detail-value">${selectedService.price}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Fecha:</span>
            <span className="detail-value">{formattedDate}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Hora:</span>
            <span className="detail-value">{formattedTime}</span>
          </div>
        </div>
  
        <button className="confirm-button" onClick={onConfirm}>
          Confirmar Turno
        </button>
      </div>
    );
  };

export default BookingPage;
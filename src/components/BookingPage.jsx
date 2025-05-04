import { useState, useEffect } from 'react';
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
        
        // Fetch appointments
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
          date: moment(selectedTime).format('YYYY-MM-DD'), 
          start_time: moment(selectedTime).format('hh:mm')
        })
      });

    
    const appointmentConfirmationData = await appointmentConfirmationResponse.json();
    console.log(appointmentConfirmationData);
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
    const [availability, setAvailability] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [localDate, setLocalDate] = useState(selectedDate || new Date());

    useEffect(() => {
      const fetchData = async () => {
        if (!employeeId || !serviceDuration) return;
        
          (true);
        try {
          const { start, end } = getWeekRange(localDate);
          const token = localStorage.getItem('token');
          const availResponse = await fetch(
            `${import.meta.env.VITE_APP_API_BASE_URL}/availability/employee?employeeId=${employeeId}&startDay=${start}&endDay=${end}`,
            {headers: {
              'Authorization': token,
              'Content-Type': "application-json"
            }}
          );
          const availabilityData = await availResponse.json();
          
          
          // Fetch appointments
          const appsResponse = await fetch(
            `${import.meta.env.VITE_APP_API_BASE_URL}/appointment/employee?employeeId=${employeeId}&startDay=${start}&endDay=${end}`,
            {
              headers: {
                'Authorization': token,
                "Content-Type": "application-json"
              }
            }
          );
          const appointmentsData = await appsResponse.json();

          setAvailability(availabilityData.result);
          setAppointments(appointmentsData.result);
        } catch (error) {
          console.error('Fetch error:', error);

        } finally {
          setIsLoading(false);
        }
      };
  
      fetchData();
    }, [localDate, employeeId, serviceDuration]);  

    useEffect(() => {
      setSelectedDate(localDate);
    }, [localDate]);
  
    const handleNavigate = (newDate) => {
      
      setLocalDate(newDate);
    };

function generateNewAvailability(availability, appointments) {
  const sqlFormat = 'YYYY-MM-DD HH:mm:ss';
  let newAvailability = [...availability];
  
  for (const appointment of appointments) {
    const tempAvailability = [];
    const appointmentDate = moment(appointment.date).format('YYYY-MM-DD');
    const appointmentStart = moment(`${appointmentDate} ${appointment.startTime}`);
    const appointmentEnd = moment(`${appointmentDate} ${appointment.endTime}`);

    for (const slot of newAvailability) {
      const slotDate = moment(slot.date).format('YYYY-MM-DD');
      const slotStart = moment(`${slotDate} ${slot.start_time}`);
      const slotEnd = moment(`${slotDate} ${slot.end_time}`);
      

      // Check if slots are on different days or don't overlap
      if (!appointmentStart.isSame(slotStart, 'day') ||
          appointmentEnd.isSameOrBefore(slotStart) ||
          appointmentStart.isSameOrAfter(slotEnd)
      ) {
        tempAvailability.push(slot);
        continue;
      }

      // Calculate overlap boundaries
      const overlapStart = moment.max(appointmentStart, slotStart);
      const overlapEnd = moment.min(appointmentEnd, slotEnd);

      // Add non-overlapping portions
      if (slotStart.isBefore(overlapStart)) {
        
        tempAvailability.push({
          start_time: slotStart.format('HH:mm:ss'),
          end_time: overlapStart.format('HH:mm:ss'),
          date: slot.date
        });
      }
      
      if (overlapEnd.isBefore(slotEnd)) {
        tempAvailability.push({
          start_time: overlapEnd.format('HH:mm:ss'),
          end_time: slotEnd.format('HH:mm:ss'),
          date: slot.date
        });
      }
    }
    
    newAvailability = tempAvailability;
    
  }
  return newAvailability;
}

const generateTimeSlots = () => {
  if (!availability?.length || !appointments || !serviceDuration) return [];
  

  const availableSlots = generateNewAvailability(availability, appointments);
  const timeSlots = [];
  

  availableSlots.forEach(slot => {
    const slotDate = moment(slot.date).format('YYYY-MM-DD');
    let current = moment(`${slotDate} ${slot.start_time}`);
    const end = moment(`${slotDate} ${slot.end_time}`);
    
    
    while (current < end) {
      const slotEnd = moment(current).add(serviceDuration, 'minutes');
      
      if (slotEnd.isSameOrBefore(end)) {


        timeSlots.push({
          start: current.toDate(),
          end: slotEnd.toDate(),
          status: 'available',
          title: 'Available'
        });
        current = slotEnd;

      } else {
        break;
      }
    }
  });
  
  return timeSlots;
};
          // Generar eventos para el calendario
    const calendarEvents = () => {
        const result =  generateTimeSlots().map(slot => ({
          title: slot.title,
          start: slot.start,
          end: slot.end,
          status: slot.status
        })); 
        
        return result;
    };

    // Estilos para los eventos
    const eventStyleGetter = (event) => {
      const style = {
        backgroundColor: event.status === 'available' ? '#90EE90' : '#FF7F7F',
        borderRadius: '4px',
        color: 'black',
        border: 'none'
      };
      return { style };
    };

      // Manejar selección de slot
      const handleSlotSelect = (slot) => {
        if (slot.status === 'available') {
          setSelectedTime(slot.start);
        }
      };  

      const onSubmit = () => {
        setCurrentStep(4);
      }
  
      return (
        <div className="time-step-container">
          <button className="back-button" onClick={onBack}>
            ← Back to Specialist
          </button>
    
          <div className="calendar-container">
          { isLoading 
              ? 
              (<div className="loading-message">Loading availability...</div>) 
              : 
              (<Calendar
                localizer={localizer}
                events={calendarEvents()}
                defaultView="week"
                views={['week']}
                date={localDate}
                onNavigate={handleNavigate}
                style={{ height: 500 }}
                min={new Date(0, 0, 0, 9, 0, 0)}
                max={new Date(0, 0, 0, 18, 0, 0)}
                eventPropGetter={eventStyleGetter}
                selectable={true}
                onSelectEvent={handleSlotSelect}
              />)}
            
          </div>
    
          {selectedTime && (
            <button 
              className="confirm-button next-button" 
              onClick={onSubmit}
              disabled={!selectedTime}
            >
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
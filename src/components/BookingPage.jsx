import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/BookingPage.css';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {calculateAvailableSlotsExcludingAppointments} from '../utils/format.js';
import {getAvailabilities} from '../services/availability.js';
import {getAppointments, getUserAppointments, createAppointment} from '../services/appointment.js';
import {getServices} from './../services/service.js';
import {getEmployees} from './../services/user.js'
import {strings} from '../locales/es.js';
import {calendarHourEnd, calendarHourStart} from './../utils/calendar_config.js'
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es', {
  months: 'Enero_Febrero_Marzo_Abril_Mayo_Junio_Julio_Agosto_Septiembre_Octubre_Noviembre_Diciembre'.split('_'),
  weekdaysShort: 'Dom_Lun_Mar_Mié_Jue_Vie_Sáb'.split('_')
});

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
  const [personalAppointments, setPersonalAppointments] = useState([]);
  const navigate = useNavigate();
  const minDistanceDaysBeetweenAppointments = 3;
  const minDistanceInMinutesFromActualDateToTakeAnAppointment = 30;

  useEffect(() => {
    const fetchData = async () => {
      try {

        const apptResponse = await getUserAppointments();
        const apptData = await apptResponse.json();

        const servicesResponse = await getServices();
        const servicesData = await servicesResponse.json();
        
        const specialistsResponse = await getEmployees();
        const specialistsData = await specialistsResponse.json();

        setServices(servicesData.result);
        setSpecialists(specialistsData.result);
        setPersonalAppointments(apptData.result);

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
    const specialistID = selectedSpecialist.id;   
    
    const startAppt = moment(selectedTime).utc().toISOString();
    const endAppt = moment.utc(startAppt).add(selectedService.duration, 'minutes');
    try{
      const response =  await createAppointment(specialistID, selectedService.id, startAppt, startAppt, endAppt);
    }catch(e){
      console.error(e);
      setError(e);
    }
    navigate('/');
  }

  return (
    <div className="booking-container">
      <div className="stepper">
          <div 
            className={`step ${currentStep >= 1 ? 'active' : ''}`} 
            onClick={() => currentStep > 1 && setCurrentStep(1)}
          >
            {strings.BOOKING_PAGE.STEPPER_LABELS[0]}
          </div>
          <div 
            className={`step ${currentStep >= 2 ? 'active' : ''}`} 
            onClick={() => currentStep > 2 && setCurrentStep(2)}
          >
            {strings.BOOKING_PAGE.STEPPER_LABELS[1]}
          </div>
          <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
            {strings.BOOKING_PAGE.STEPPER_LABELS[2]}
          </div>
      </div>

      <div className="step-content">
          {currentStep === 1 && (
              isLoading ? (
                <div className="loading-message">
                  {strings.BOOKING_PAGE.LOADING_SERVICES}
                </div>
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
            selectedService={selectedService}
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
            minDistanceInDays={minDistanceDaysBeetweenAppointments}
            personalAppointments={personalAppointments}
            minDistanceInMinutesFromActualDateToTakeAnAppointment={minDistanceInMinutesFromActualDateToTakeAnAppointment}
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
    <h2>{strings.BOOKING_PAGE.SERVICE_STEP.TITLE}</h2>
    {services.length === 0 
    ? 
      (<div className="empty-message">
        {strings.BOOKING_PAGE.SERVICE_STEP.NO_SERVICES}
      </div>) 
    : 
      (<div className="card-grid">
        {services.map((service) => (
          <div 
            key={service.id}
            className={`card ${selectedService?.id === service.id ? 'selected' : ''}`}
            onClick={() => onSelect(service)}
          >
            <h3>{service.name}</h3>
            <p>
              {strings.BOOKING_PAGE.SERVICE_STEP.DURATION_LABEL}: {service.duration}
            </p>
          </div>
        ))}
        </div>
      )
    }
  </div>
);

const ofreceElServicio = (serviciosDelEspecialista, servicioElegido) => {
  return serviciosDelEspecialista.some(elem => elem.service_id == servicioElegido.id );
}

const SpecialistStep = ({ specialists, selectedSpecialist, onSelect, onBack, selectedService }) => (
  <div className="step-wrapper">
    <h2>{strings.BOOKING_PAGE.SPECIALIST_STEP.TITLE}</h2>
    <button className="back-button" onClick={onBack}>
      {strings.BOOKING_PAGE.SPECIALIST_STEP.BACK_BUTTON}
    </button>
    <div className="card-grid">
      {specialists.map((specialist) => {
        if(ofreceElServicio(specialist.services, selectedService)){
          return( 
            <div 
              key={specialist.id}
              className={`card ${selectedSpecialist?.id === specialist.id ? 'selected' : ''}`}
              onClick={() => onSelect(specialist)}
            >
              <h3>
                {strings.BOOKING_PAGE.SPECIALIST_STEP.NAME_FORMAT
                  .replace('{firstName}', specialist.first_name)
                  .replace('{lastName}', specialist.last_name)}
              </h3>
            </div>
          )
        }
      })}
    </div>
  </div>
);

const TimeStep = ({
  employeeId,
  serviceDuration,
  onBack,
  selectedDate,
  setSelectedDate,
  setSelectedTime,
  setCurrentStep,
  personalAppointments,
  minDistanceInDays,
  minDistanceInMinutesFromActualDateToTakeAnAppointment
}) => {
  const [availability, setAvailability] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [localDate, setLocalDate] = useState(selectedDate || new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [canBook, setCanBook] = useState(false);

  const toUTCString = dateLocal => moment(dateLocal).utc().format('YYYY-MM-DDTHH:mm:ss[Z]');

  useEffect(() => {
    setSelectedDate(localDate);
  }, [localDate, setSelectedDate]);

  useEffect(() => {
    if(selectedEvent){
      const isValid = canBookAppointment(personalAppointments, selectedEvent.start, minDistanceInDays);
      
      setCanBook(isValid);
    }
  }, [selectedEvent]);

  useEffect(() => {
    const fetchData = async () => {
      if (!employeeId || !serviceDuration) return;
      setIsLoading(true);
      try {
        const { start, end } = getWeekRange(localDate);

        const availRes = await getAvailabilities(employeeId, start, end); 
        const appsRes = await getAppointments(employeeId, start, end);

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

  

  const generateTimeSlotsUTC = () => {
    
    if (availability.length == 0 && !serviceDuration) return [];

    const freeSlots = calculateAvailableSlotsExcludingAppointments(availability, appointments);
    
    const slots = [];

    freeSlots.forEach(slot => {
      let current = moment.utc(slot.start_time); 
      const end     = moment.utc(slot.end_time);

      const actualDate = moment().utc();

      while (current.isBefore(end)) {
        const endSlot = moment.utc(current).add(serviceDuration, 'minutes');
        if (endSlot.isSameOrBefore(end)) {
          if(endSlot.isAfter(actualDate.clone().add(minDistanceInMinutesFromActualDateToTakeAnAppointment, 'minutes'))){
            slots.push({
              id: current.valueOf(),
              start: current,
              end: endSlot,
              status: strings.BOOKING_PAGE.TIME_STEP.SLOTS.STATUS_AVAIL,
              title: strings.BOOKING_PAGE.TIME_STEP.SLOTS.TITLE_AVAIL
            });
          }
          current = endSlot;
        } else break;
        
      }

    });

    return slots;
  };


  const calendarEvents = () => {
    let result = generateTimeSlotsUTC().map(slot => ({
      id: slot.id,
      title: slot.title,
      start: slot.start.local().toDate(),
      end: slot.end.local().toDate(),
      status: slot.status,
      resource: slot
    })) 
    return result;
  };

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

      
  function canBookAppointment(appointments, newDate, minDistanceDays) {
      const targetDate = moment(newDate);
      if(appointments.length > 0){
        for (const appointment of appointments) {
            const appointmentDate = moment(appointment.date);
            const distance = Math.abs(appointmentDate.diff(targetDate, 'days'));

            if (distance <= minDistanceDays) {
                return false;
            }

            // Si el turno actual está después y la distancia es suficiente, 
            // no es necesario revisar los siguientes (por estar ordenados)
            if (appointmentDate.isAfter(targetDate) && distance > minDistanceDays) {
                break;
            }
        }
      }
      return true;
  }

  return (
    <div className="time-step-container">
      <button className="back-button" onClick={onBack}>
        {strings.BOOKING_PAGE.TIME_STEP.BACK_BUTTON}
      </button>
      <div className="calendar-container">
        {isLoading ? (
          <div className="loading-message">
            {strings.BOOKING_PAGE.TIME_STEP.LOADING}
          </div>
        ) : (
          <Calendar
            culture='es'
            localizer={localizer}
            events={calendarEvents()}
            defaultView="week"
            views={['week']}
            date={localDate}
            onNavigate={handleNavigate}
            style={{ height: 500 }}
            min={new Date(0,0,0,calendarHourStart,0)}
            max={new Date(0,0,0,calendarHourEnd,0)}
            eventPropGetter={eventStyleGetter}
            selectable
            onSelectEvent={handleSelectEvent}
            messages={{
              next: strings.CALENDAR.NEXT,
              previous: strings.CALENDAR.PREVIOUS,
              today: strings.CALENDAR.TODAY,
              month: strings.CALENDAR.MONTH,
              week: strings.CALENDAR.WEEK,
              day: strings.CALENDAR.DAY
            }}
          />
        )}
      </div>
      {selectedEvent && canBook ?  (
        <button className="confirm-button next-button mt-4" onClick={onSubmit}>
          {strings.BOOKING_PAGE.TIME_STEP.CONFIRM_BUTTON}
        </button>
      ) : !selectedEvent ? (
        <p  className="warning-message info">{strings.BOOKING_PAGE.TIME_STEP.VALIDATION_MESSAGES.NO_SLOT_SELECTED}</p>
      ): (
        <p  className="warning-message warning">{strings.BOOKING_PAGE.TIME_STEP.VALIDATION_MESSAGES.MIN_DISTANCE}</p>
      )}
    </div>
  );
};

  const getWeekRange = (localDate) => {
            const today = moment().startOf('day');
            const weekStart = moment(localDate).startOf('isoWeek');
            const start = weekStart.isBefore(today) ? today.format('YYYY-MM-DD') : weekStart.format('YYYY-MM-DD');
            
            const end   = moment(localDate).endOf('isoWeek').format('YYYY-MM-DD');
  
            return {start, end}
      }
  

  const SummaryStep = ({ 
    selectedService, 
    selectedSpecialist, 
    selectedTime, 
    onBack, 
    onConfirm,
  }) => {
    const formattedDate = moment(selectedTime).format('LL');
    const formattedTime = moment(selectedTime).format('LT');
  
    return (
      <div className="step-wrapper">
        <h2>{strings.BOOKING_PAGE.SUMMARY_STEP.TITLE}</h2>
        <button className="back-button" onClick={onBack}>
          {strings.BOOKING_PAGE.SUMMARY_STEP.BACK_BUTTON}
        </button>
        
        <div className="summary-details">
          <div className="detail-item">
            <span className="detail-label">
              {strings.BOOKING_PAGE.SUMMARY_STEP.DETAIL_LABELS.SERVICE}
            </span>
            <span className="detail-value">{selectedService.name}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">
              {strings.BOOKING_PAGE.SUMMARY_STEP.DETAIL_LABELS.SPECIALIST}
            </span>
            <span className="detail-value">
              {selectedSpecialist.first_name} {selectedSpecialist.last_name}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">
              {strings.BOOKING_PAGE.SUMMARY_STEP.DETAIL_LABELS.PRICE}
            </span>
            <span className="detail-value">
              {strings.BOOKING_PAGE.SUMMARY_STEP.CURRENCY}{selectedService.price}
            </span>
          </div>
          <div className="detail-item">
            <span className="detail-label">
              {strings.BOOKING_PAGE.SUMMARY_STEP.DETAIL_LABELS.DATE}
            </span>
            <span className="detail-value">{formattedDate}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">
              {strings.BOOKING_PAGE.SUMMARY_STEP.DETAIL_LABELS.TIME}
            </span>
            <span className="detail-value">{formattedTime}</span>
          </div>
        </div>        
        
        <button className="confirm-button" onClick={onConfirm}>
          {strings.BOOKING_PAGE.SUMMARY_STEP.BUTTON_TEXT}
        </button>
      </div>
    );
  };

export default BookingPage;
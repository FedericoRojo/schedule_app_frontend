import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import {useState, useEffect, useCallback, useMemo } from 'react';
import moment from 'moment';
import ModeSelector from './ModeSelector';
import 'moment/locale/es'; 
import {  getAvailabilities, newAvailabilities, updateAvailability, deleteAvailability } from '../../services/availability.js'
import '../../styles/AvailabilityManager.css';
import {strings} from '../../locales/es.js'
import {calendarHourEnd, calendarHourStart} from './../../utils/calendar_config.js'


const DnDCalendar = withDragAndDrop(Calendar);


const AvailabilityManager = ({
    employeeId,
    selectedDate,
    setSelectedDate,
}) => {
    const mode = Object.freeze({
        VIEW: 'view',
        ADD: 'add',
        EDIT: 'edit',
        DELETE: 'delete'
      }); 
    const [currentMode, setCurrentMode] = useState(mode.VIEW);
    const [availability, setAvailability] = useState([]);

    const [addTarget, setAddTarget] = useState(null);
    const [editTarget, setEditTarget] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    
    const [localDate, setLocalDate] = useState(selectedDate || new Date());
    
    moment.updateLocale('es', {
      week: { dow: 1 }               // dow = day of week: lunes=1 … domingo=7
    });
    moment.locale('es'); 
    const localizer = momentLocalizer(moment);

    const getWeekRange = (localDate) => {
          const today = moment().startOf('day');
          const weekStart = moment(localDate).startOf('isoWeek');
          const start = weekStart.isBefore(today) ? today.format('YYYY-MM-DD') : weekStart.format('YYYY-MM-DD');
          
          const end   = moment(localDate).endOf('isoWeek').format('YYYY-MM-DD');

          return {start, end}
    }

    const fetchData = async () => {
      if (!employeeId) return;
      try {
          
          const {start, end} = getWeekRange(localDate);

          const availResponse = await getAvailabilities(employeeId, start, end)
         
          const availabilityData = await availResponse.json();
          console.log(availabilityData.result);
          setAvailability(availabilityData.result);

      } catch (error) {
          console.error('Fetch error:', error);
      } finally {
          setIsLoading(false);
      }
    };
    
    useEffect(() => {
        fetchData();
    }, [localDate, currentMode]); 
    
    
    function toCalendarEvent(slot){
        return {
            id: slot.id,
            title: slot.title || strings.EMPLOYEE_SCHEDULE.AVAILABILITY_MANAGER.AVAILABLE,
            start: moment.utc(slot.start_time).local().toDate(),
            end: moment.utc(slot.end_time).local().toDate(),
            isAvailability: true
        }
    }
    
    function buildEvents(){
        let events = availability.map(toCalendarEvent);

        if(editTarget){
            events = events.map( event => {
                if(event.id === editTarget.original.id){
                    return {
                        ...event,
                        start: editTarget.modified.start,
                        end: editTarget.modified.end,
                        isPreview: true,
                    };
                }else{
                    return event
                }
            })
        }

    
        if (addTarget) {
          const previews = Array.isArray(addTarget.slots)
            ? addTarget.slots
            : [ addTarget ];
        
          
          previews.forEach(slot => {
            events.push({
              id: `new-${slot.start.getTime()}`,
              title: 'Nuevo turno',
              start: slot.start,
              end:   slot.end,
              isPreview: true,
            });
          });
        }
    
        if(deleteTarget){
            events = events.map(event => {
                if(event.id == deleteTarget.id){
                    return {
                        ...event,
                        isPreview: true
                    }
                }else{
                    return event
                }
            })
        }
        return events
    }

    
    const events = useMemo(() => buildEvents(), [
      availability,
      editTarget,
      addTarget,
      deleteTarget
    ]);
    
    const isCompletlyWithinAvailability = useCallback((start, end) => {
        return availability.some(slot => {
          const slotStart = moment(`$${slot.start_time}`);
          const slotEnd = moment(`$${slot.end_time}`);
          
          return (
              moment(start).isSame(slotStart, 'day') && 
              moment(start).isSameOrAfter(slotStart) &&
              moment(end).isSameOrBefore(slotEnd)
          );
        });
    }, [availability]);
    
    function handleADDSelectSlot({start, end}){
        if(currentMode == mode.ADD){
            if(!isCompletlyWithinAvailability(start, end)){

                const newSlots = createLimits(start, end);

                if (newSlots.length === 0) {
                    alert('No hay espacio disponible');
                  } else if (newSlots.length === 1) {
                    // Bloque sin superposiciones
                    setAddTarget({ start: newSlots[0].start, end: newSlots[0].end });
                  } else {
                    // Bloque dividido en múltiples partes
                    setAddTarget({ slots: newSlots });
                  }
            }
            
        }
    }
    
    function handleEventResize({event, start, end}){
        if(currentMode == mode.EDIT || event.isAvailability){
            if(start < end){
              setEditTarget({original: event, modified: {start, end}})
            }
        }
    }

     
    
    function handleSelectEvent(event){
        if(currentMode == mode.DELETE && event.isAvailability){
            setDeleteTarget(event);
        }
    }

    const createLimits = (start, end) => {
        const utcStart = moment(start).utc();
        const utcEnd   = moment(end).utc();

        const newBlock = {
          start: utcStart.clone().startOf('minute'),
          end:   utcEnd.clone().startOf('minute')
        };
        const fragments = [ newBlock ];
        
        availability.forEach(oldSlot => {

            const oldSlotStart = moment.utc(oldSlot.start_time);
            const oldSlotEnd   = moment.utc(oldSlot.end_time)

            let i = 0;
            while (i < fragments.length) {
              const frag = fragments[i];
              const fStart = frag.start;
              const fEnd   = frag.end;
      
              if (fStart.isSame(oldSlotStart, 'day') && fStart.isBefore(oldSlotEnd) && fEnd.isAfter(oldSlotStart)) {
                const newFrags = [];

                // izquierda
                if (fStart.isBefore(oldSlotStart)) {
                  newFrags.push({ start: fStart, end: oldSlotStart.clone() });
                }
                // derecha
                if (fEnd.isAfter(oldSlotEnd)) {
                  newFrags.push({ start: oldSlotEnd.clone(), end: fEnd });
                }
                fragments.splice(i, 1, ...newFrags);

                i += newFrags.length;
                continue;
              }
              i++;
            }
      });
        
      return fragments
        .filter(f => f.end.diff(f.start, 'minutes') > 0)
        .map(f => ({
          start: f.start.local().toDate(),
          end:   f.end.local().toDate()
        }));
    };


    async function confirmAdd() {
      if (!addTarget) return;
        
        try {
            const token = localStorage.getItem('token');
            const slotsToInsert = addTarget.slots || [addTarget];
            let formattedSlotsToPrint = [] ;

            const formattedSlots = slotsToInsert.map(slot => {
                formattedSlotsToPrint.push({
                    date:  slot.start.toISOString(), 
                    start_time: moment.utc(slot.start).toISOString(),
                    end_time:  moment.utc(slot.end).toISOString(),
                    employee_id: employeeId
                })
                
                return {
                  date:  slot.start.toISOString(), 
                  start_time: moment.utc(slot.start).toISOString(),
                  end_time: moment.utc(slot.end).toISOString(),
                  employee_id: employeeId
                }
            });
    
            
            const response = await newAvailabilities(formattedSlots);
            
            if (!response.ok) throw new Error('Error en el servidor');
    
            const newAvailability = [...availability, ...formattedSlotsToPrint];
            setAvailability(newAvailability);
            setAddTarget(null);
        
        } catch (error) {
            console.error('Error al guardar:', error);
            alert('Error al guardar los turnos: ' + error.message);
        }
    }

  async function confirmEdit() {
    try{
        const date = moment(editTarget.original.start).utc().toISOString()
        const start = moment(editTarget.modified.start).utc().toISOString()
        const end = moment(editTarget.modified.end).utc().toISOString()

        const response = await updateAvailability( editTarget.original.id, employeeId, date, start, end );
        
        if(response.ok){
            setAvailability(prev =>
                prev.map(s =>
                  s.id === editTarget.original.id
                    ? { ...s,
                        date:       date,
                        start_time: start,
                        end_time:   end,
                      }
                    : s
                )
              );
        }else{
          const jsonError = await response.json();
          setError(jsonError.error);
        }
        setEditTarget(null);
      }catch(error){
        console.log("Error al guardar edición: ", error)
        setAvailability(originalAvailability);
      }
    
  }

  async function confirmDelete() {
    try{
      const response = await deleteAvailability(deleteTarget.id);
      
      if(response.ok){
        setAvailability(prev =>
          prev.filter(s => s.id !== deleteTarget.id)
        );
        setDeleteTarget(null);
      }else{
        const jsonError = await response.json();
        setError(jsonError.error);
        console.log('Error en el servidor: ', jsonError);
      }
    }catch(e){
      console.log('Error al eliminar bloque de tiempo: ', e);
    }
  }

  const handleNavigate = (newDate) => {
    const monday = moment(newDate).startOf('isoWeek').toDate();
    setLocalDate(monday);
  };

  const eventStyleGetter = (event) => {
    const isEditing = editTarget?.original?.id === event.id;
  
    let backgroundColor;
  
    if (isEditing) {
      backgroundColor = '#ADD8E6';
    } else if (event.status === 'available') {
      backgroundColor = '#90EE90';
    } else {
      backgroundColor = '#90EE90';
    }
  
    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        color: 'black',
        cursor: currentMode === mode.EDIT && event.isAvailability ? 'grab' : 'default',
        border: isEditing ? '2px dashed #1E90FF' : 'none'
      }
    };
  };

  return (
    <div>
      <ModeSelector 
        currentMode={currentMode} 
        setCurrentMode={setCurrentMode} 
        mode={mode} 
      />
      
      {error != null && (
        <div className="error-message">
          {error}
          <button 
            className="error-close-btn" 
            onClick={() => setError(null)} 
            aria-label={strings.EMPLOYEE_SCHEDULE.AVAILABILITY_MANAGER.ERROR.CLOSE_ARIA}
          >
            ×
          </button>
        </div>
      )}

      <DnDCalendar
        date={localDate}
        localizer={localizer}
        culture='es'
        events={events}
        defaultView='week'
        views={['week']}
        onNavigate={handleNavigate}
        min={new Date(0, 0, 0, calendarHourStart, 0, 0)}
        max={new Date(0, 0, 0, calendarHourEnd, 0, 0)}
        eventPropGetter={eventStyleGetter}
        selectable={true}
        onSelectSlot={handleADDSelectSlot}
        onSelectEvent={handleSelectEvent}
        onEventResize={handleEventResize}
        draggableAccessor={event => currentMode === mode.EDIT && event.isAvailability}
        resizableAccessor={event => currentMode === mode.EDIT && event.isAvailability}
        messages={{
          next: strings.CALENDAR.NEXT,
          previous: strings.CALENDAR.PREVIOUS,
          today: strings.CALENDAR.TODAY,
          month: strings.CALENDAR.MONTH,
          week: strings.CALENDAR.WEEK,
          day: strings.CALENDAR.DAY,
        }}
      />

      {currentMode === 'add' && addTarget && (
        <div className="action-bar">
          <button onClick={confirmAdd}>
            {strings.EMPLOYEE_SCHEDULE.AVAILABILITY_MANAGER.BUTTONS.CONFIRM}
          </button>
          <button onClick={() => setAddTarget(null)}>
            {strings.EMPLOYEE_SCHEDULE.AVAILABILITY_MANAGER.BUTTONS.CANCEL}
          </button>
        </div>
      )}
      
      {currentMode === 'edit' && editTarget && (
        <div className="action-bar">
          <button onClick={confirmEdit}>
            {strings.EMPLOYEE_SCHEDULE.AVAILABILITY_MANAGER.BUTTONS.CONFIRM}
          </button>
          <button onClick={() => setEditTarget(null)}>
            {strings.EMPLOYEE_SCHEDULE.AVAILABILITY_MANAGER.BUTTONS.CANCEL}
          </button>
        </div>
      )}
      
      {currentMode === 'delete' && deleteTarget && (
        <div className="action-bar">
          <button onClick={confirmDelete}>
            {strings.EMPLOYEE_SCHEDULE.AVAILABILITY_MANAGER.BUTTONS.DELETE}
          </button>
          <button onClick={() => setDeleteTarget(null)}>
            {strings.EMPLOYEE_SCHEDULE.AVAILABILITY_MANAGER.BUTTONS.CANCEL}
          </button>
        </div>
      )}
    </div>
  );

}

export default AvailabilityManager


  
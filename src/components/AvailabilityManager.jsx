import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import {useState, useEffect, useCallback} from 'react';
import moment from 'moment';
import ModeSelector from './ModeSelector';
import 'moment/locale/es'; 


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

    
    const [localDate, setLocalDate] = useState(selectedDate || new Date());

    moment.updateLocale('es', {
      week: { dow: 1 }               // dow = day of week: lunes=1 … domingo=7
    });
    moment.locale('es');
    const localizer = momentLocalizer(moment);
    
    useEffect(() => {
        const fetchData = async () => {
        if (!employeeId) return;
        try {
            //const { start, end } = getWeekRange(localDate);
            const start = moment(localDate).startOf('isoWeek').format('YYYY-MM-DD');
            const end   = moment(localDate).endOf('isoWeek').format('YYYY-MM-DD');
            
            const token = localStorage.getItem('token');
            const availResponse = await fetch(
            `${import.meta.env.VITE_APP_API_BASE_URL}/availability/employee?employeeId=${employeeId}&startDay=${start}&endDay=${end}`,
            {headers: {
                'Authorization': token,
                'Content-Type': "application-json"
            }}
            );
            const availabilityData = await availResponse.json();
            setAvailability(availabilityData.result);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
        };
        fetchData();
    }, [localDate]); 
    
    
    function toCalendarEvent(slot){
        const base = moment.utc(slot.date);
        const [h1, m1] = slot.start_time.split(':').map(Number);
        const [h2, m2] = slot.end_time.split(':').map(Number);
    
        return {
            id: slot.id,
            title: slot.title || 'Disponible',
            start: base.clone().set({hour: h1, minute:m1}).local().toDate(),
            end: base.clone().set({hour:h2, minute:m2}).local().toDate(),
            isAvailability: true,
            //Faltan estilos por defecto
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
              id: `new-${slot.start.getTime()}`,  // o cualquier ID único temporal
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

    
    const isCompletlyWithinAvailability = useCallback((start, end) => {
        return availability.some(slot => {
        const slotStart = moment(`${slot.date} ${slot.start_time}`);
        const slotEnd = moment(`${slot.date} ${slot.end_time}`);
        
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
            setEditTarget({original: event, modified: {start, end}})
        }
    }

    function handleEventDrop({ event, start, end }) {
        if (mode !== mode.EDIT || !event.isAvailability) return;
        setEditTarget({ original: event, modified: { start, end } });
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
          const oldUtcDate = moment.utc(oldSlot.date);
          const [h1, m1] = oldSlot.start_time.split(':').map(Number);
          const [h2, m2] = oldSlot.end_time.split(':').map(Number);
    
          const oldSlotStart = oldUtcDate.clone().set({ hour: h1, minute: m1 });
          const oldSlotEnd   = oldUtcDate.clone().set({ hour: h2, minute: m2 });
    
          let i = 0;
          while (i < fragments.length) {
            const frag = fragments[i];
            const fStart = frag.start;
            const fEnd   = frag.end;
    
            if (fStart.isSame(oldUtcDate, 'day') &&
                fStart.isBefore(oldSlotEnd) &&
                fEnd.isAfter(oldSlotStart)) {
    
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
                    start_time: moment.utc(slot.start).format('HH:mm:ss'),
                    end_time: moment.utc(slot.end).  format('HH:mm:ss'),
                    employee_id: employeeId
                })
                
                return {
                  date:  slot.start.toISOString(), 
                  start_time: moment.utc(slot.start).format('HH:mm:ss'),
                  end_time: moment.utc(slot.end).  format('HH:mm:ss'),
                  employee_id: employeeId
                }
            });
    
            
        
            const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/availability/new`, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ slots: formattedSlots })
            });
        
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
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/availability/update/${editTarget.original.id}`, {
          method: "PUT",
          headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            employee_id: employeeId,
            date: editTarget.original.start,
            start_time: moment.utc(editTarget.modified.start).format('HH:mm:ss'),
            end_time: moment.utc(editTarget.modified.end).format('HH:mm:ss')
          })
        });

        

        if(response.ok){
            setAvailability(prev =>
                prev.map(s =>
                  s.id === editTarget.original.id
                    ? { ...s,
                        date:       editTarget.modified.start.toISOString(),
                        start_time: moment.utc(editTarget.modified.start).format('HH:mm:ss'),
                        end_time:   moment.utc(editTarget.modified.end)  .format('HH:mm:ss'),
                      }
                    : s
                )
              );
              setEditTarget(null);
        }

      }catch(error){
        console.log("Error al guardar edición: ", error)
        setAvailability(originalAvailability);
      }



    
  }

  async function confirmDelete() {
    try{
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/availability/${deleteTarget.id}`,{
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      })
      if(response.ok){
        setAvailability(prev =>
          prev.filter(s => s.id !== deleteTarget.id)
        );
        setDeleteTarget(null);
      }else{
        const jsonError = await response.json();
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
        mode={mode} />

      <DnDCalendar
        date={localDate}
        localizer={localizer}
        events={buildEvents()}
        defaultView='week'
        views={['week']}
        onNavigate={handleNavigate}
        min={new Date(0, 0, 0, 8, 0, 0)}
        max={new Date(0, 0, 0, 21, 0, 0)}
        eventPropGetter={eventStyleGetter}
        selectable={true}
        onSelectSlot={handleADDSelectSlot}
        onSelectEvent={handleSelectEvent}
        onEventResize={handleEventResize}
        onEventDrop={handleEventDrop}
        draggableAccessor={event => currentMode === mode.EDIT && event.isAvailability}
        resizableAccessor={event => currentMode === mode.EDIT && event.isAvailability}
      />

      
      {currentMode === 'add' && addTarget && (
        <div className="action-bar">
          <button onClick={confirmAdd}>Confirmar</button>
          <button onClick={() => setAddTarget(null)}>Cancelar</button>
        </div>
      )}
      {currentMode === 'edit' && editTarget && (
        <div className="action-bar">
          <button onClick={confirmEdit}>Confirmar</button>
          <button onClick={() => setEditTarget(null)}>Cancelar</button>
        </div>
      )}
      {currentMode === 'delete' && deleteTarget && (
        <div className="action-bar">
          <button onClick={confirmDelete}>Confirmar</button>
          <button onClick={() => setDeleteTarget(null)}>Cancelar</button>
        </div>
      )}
    </div>
  );

}

export default AvailabilityManager


  
  
import moment from 'moment';
  
const calculateAvailableSlotsExcludingAppointments = (availability, appointments) => {
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


export {calculateAvailableSlotsExcludingAppointments}
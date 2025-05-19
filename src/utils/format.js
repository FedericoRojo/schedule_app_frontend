  
import moment from 'moment';
  
const calculateAvailableSlotsExcludingAppointments = (availability, appointments) => {
    let newSlots = availability.map(slot => ({ ...slot }));
    
    
    if(appointments.length > 0){

      appointments.forEach(appt => {
        const temp = [];
        const startA = moment.utc(appt.startTime);
        const endA = moment.utc(appt.endTime);

        newSlots.forEach(slot => {
          const startS = moment.utc(slot.start_time);
          const endS = moment.utc(slot.end_time);

          if (!startA.isSame(startS, 'day') || endA.isSameOrBefore(startS) || startA.isSameOrAfter(endS)) {
            temp.push(slot);
          } else {
            const overlapStart = moment.max(startA, startS);
            const overlapEnd = moment.min(endA, endS);

            if (startS.isBefore(overlapStart)) 
              temp.push({ 
                    id: `${slot.id}-pre-${startS.valueOf()}`,
                    date: slot.date, 
                    start_time: startS,
                    end_time: overlapStart });
            if (overlapEnd.isBefore(endS))
               temp.push({ 
                    id: `${slot.id}-post-${overlapEnd.valueOf()}`,
                    date: slot.date, 
                    start_time: overlapEnd, 
                    end_time: endS });
          
          }

        });

        newSlots = temp;
      });

    }

    return newSlots;
  };


export {calculateAvailableSlotsExcludingAppointments}
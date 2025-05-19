async function getAvailabilities(employeeId, start, end){
    const token = localStorage.getItem('token');
    const availabilityResponse = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/availability/employee?employeeId=${employeeId}&startDay=${start}&endDay=${end}`, {
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        }
    })
    return availabilityResponse
}

async function newAvailabilities(formattedSlots){
    const token = localStorage.getItem('token');
     const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/availability/new`, {
        method: 'POST',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ slots: formattedSlots })
    });
    return response;
}

async function updateAvailability(id, employeeId, date, start, end){
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/availability/update/${id}`, {
        method: "PUT",
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            employee_id: employeeId,
            date: date,
            start_time: start,
            end_time: end
        })
    });
    return response;
}

async function deleteAvailability(id){
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/availability/${id}`,{
        method: 'DELETE',
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      })
      return response;
}

export {getAvailabilities, newAvailabilities, updateAvailability, deleteAvailability}
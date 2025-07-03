
async function getAppointments(employeeId, start, end){
    const token = localStorage.getItem('token')
    const appointmetsResponse = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/appointment/employee?employeeId=${employeeId}&startDay=${start}&endDay=${end}`, {
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        }
    })
    return appointmetsResponse;
}

async function getUserAppointments(){
     const token = localStorage.getItem('token');
     const apptResponse = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/appointment`, {
        method: 'GET',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json'
        }
    })
    return apptResponse;
}

async function updateAppointmentStatus(id, status){
    const token = localStorage.getItem('token');
    try{
        const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/appointment/update/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({status: status})
        })
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update status');
        }
        
        return await response.json();
    }catch (error) {
        console.error('Update error:', error);
        throw error;
    }

}

async function cancelAppointment(id){
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/appointment/cancel/${id}`, {
        method: 'PUT',
        headers: {
            'Authorization': token
        }
    })
    return response;
}

async function createAppointment(specialistID, serviceId, dateAppt, startAppt, endAppt){
    const token = localStorage.getItem('token');
    const response = await fetch(`
      ${import.meta.env.VITE_APP_API_BASE_URL}/appointment/new`, { 
        method: 'POST',
        headers: {
            'Authorization': token,
            'Content-Type': "application/json"
        },
        body: JSON.stringify({
          employee_id: specialistID, 
          service_id: serviceId, 
          date: dateAppt, 
          start_time: startAppt,
          end_time: endAppt
        })
      });
    return response;
}
export {getAppointments, getUserAppointments, createAppointment, cancelAppointment, updateAppointmentStatus}
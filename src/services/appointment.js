
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

export {getAppointments, getUserAppointments}
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

export {getAvailabilities}
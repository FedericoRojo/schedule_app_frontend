
async function updateService(id, newService){
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/services/update/${id}`, {
        method: 'PUT',
        headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        name: newService.name,
        description: '',
        price: newService.price,
        duration: newService.duration
        })
    })
    return response;
}

async function deleteService(id){
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/services/${id}`, {
        method: 'DELETE',
        headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
        }
    })
    return response;
}

async function addService(service){
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/services/new`, {
        method: 'POST',
        headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: service.name,
            description: '',
            price: service.price,
            duration: service.duration
        })
    })
    return response;
}

async function getServices(){
    const token = localStorage.getItem("token");
    const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/services`,{
        headers: {
            'Authorization': token
        }
    });
    return response;
}

export {updateService, deleteService, addService, getServices}
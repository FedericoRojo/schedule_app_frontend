import { responsiveFontSizes } from "@mui/material";

async function updateUserRole(employee){
    const token = localStorage.getItem('token');
    const response = await fetch(
        `${import.meta.env.VITE_APP_API_BASE_URL}/users/upgrade/${employee.id}`, 
        {
        method: 'PUT',
        headers: { 
            'Authorization': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            role: employee.role
        })
        }
    );
    return response
}

async function updateEmployee(employee){
    const token = localStorage.getItem('token');
    const response = await fetch(
        `${import.meta.env.VITE_APP_API_BASE_URL}/users/update/${employee.id}`, 
        {
        method: 'PUT',
        headers: { 
            'Authorization': token,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            firstName: employee.first_name,
            lastName: employee.last_name,
            role: employee.role,
            services: employee.services.map(s => s.service_id) 
        })
        }
    );
    return response;
}

async function getEmployees(){
     const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/users/employees`,{
        headers: {
        'Authorization': token
        }
    });
    return response;
}

async function searchUser(firstName, lastName){
    const token = localStorage.getItem('token');
    const response = await fetch(
        `${import.meta.env.VITE_APP_API_BASE_URL}/users/search?firstName=${firstName}&lastName=${lastName}`,
        {
        headers: {
            'Authorization': token
        }
        }
    );
    return response
}

async function deleteUser(id){
     const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
        'Authorization' : token
        }
    });
    return response
}

async function authUser(){
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/users/auth`, {
        method: 'GET',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': token
        }
    });
    return response;
}

const updateUserProfile = async ( userID, firstName, lastName, phone, email) => {
try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/users/update/profile/${userID}`, {
    method: 'PUT',
    headers: { 
        'Content-Type': 'application/json',
        'Authorization': token
    },
    body: JSON.stringify({ 
        email, 
        firstName,
        lastName,
        phoneNumber: phone
    }),
    });
    if (response.ok) {
    return response;
    } else {
    const errorData = await response.json();
    throw new Error('Update user failed, ', errorData.errors);
    }
} catch (error) {
    throw error;
}
};

const registerUser1 = async(emailInput, passwordInput, nameInput, lastNameInput, phoneNumberInput) => {
    const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/users/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                email: emailInput, 
                password: passwordInput,
                firstName: nameInput,
                lastName: lastNameInput,
                phoneNumber: phoneNumberInput 
              }),
    });
    return response;
}


const registerUser = async(emailInput, passwordInput, nameInput, lastNameInput, phoneNumberInput) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: emailInput, 
                password: passwordInput,
                firstName: nameInput,
                lastName: lastNameInput,
                phoneNumber: phoneNumberInput 
            }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new ValidationError('Registro fallido', data.errors || [{msg: 'Error desconocido'}]);
        }
        
        return data;
        
    } catch (error) {
        throw error;
    }
}


export {updateUserRole, updateEmployee, getEmployees, searchUser, deleteUser, authUser, updateUserProfile, registerUser}
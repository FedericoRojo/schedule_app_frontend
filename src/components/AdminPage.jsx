import React, { useEffect, useState } from 'react';
import '../styles/AdminPage.css';
import EmployeesSection from './AdminSections/EmployeesSection';
import ServicesSection from './AdminSections/ServicesSection';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const menuItems = [
    { id: 'services', label: 'Servicios', icon: '⚙️' },
    { id: 'employees', label: 'Empleados', icon: '👥' },
  ];


  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try{
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/services`,{
        headers: {
          'Authorization': token
        }
      });
      const data = await response.json();
      const newData = data.result.map(elem => ({...elem, editing: false})); 
      setServices(newData);
    }catch(e){
      console.log(e);
    }
  }

  const renderContent = () => {
    switch(activeTab) {
      case 'services':
        return <ServicesSection services={services} setServices={setServices} fetchServices={fetchServices}/>;
      case 'employees':
        return <EmployeesSection allServices={services} setAllServices={setServices}/>;
      default:
        return <div>Seleccione una opción</div>;
    }
  };

  

  return (
    <div className="admin-container">
      <div className="admin-sidebar">
        <h2>Panel Admin</h2>
        
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
          >
            <span className="menu-item-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      <div className="admin-main">
        <div className="content-card">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
  

export default AdminPage;
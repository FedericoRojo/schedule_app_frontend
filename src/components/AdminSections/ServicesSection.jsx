import React, { useEffect, useState } from 'react';
import {strings} from './../../locales/es.js'
import {updateService, deleteService, addService} from '../../services/service.js'

export default function ServicesSection ({services, setServices, fetchServices}) {
    const [newService, setNewService] = useState({ name: '', price: '', duration: '' });
    const [deletingServiceId, setDeletingServiceId] = useState(null);
    const [showHandleAddService, setShowHandleAddService] = useState(false);
    const [firstServicesLoad, setFirstServicesLoad] = useState(false);
    const [reload, setReload] = useState(false);

    useEffect(() => {
      if(services.length == 0){
        fetchServices();
      }
      setFirstServicesLoad(true)
    }, []);

    useEffect(() => {
      if(firstServicesLoad){
        fetchServices();
      }
    }, [reload, firstServicesLoad]);

 

    const fetchUpdateService = async(id) => {
      try{
        await updateService(id, newService);
        setReload(prev => !prev);
      }catch(e){
        console.log(e);
      }
    }
  
    const handleEdit = (id) => {
      setServices(services.map(service => 
        service.id === id ? { ...service, editing: true } : service
      ));
    };
  
    const handleSave = async (id) => {
      await fetchUpdateService(id);
      setNewService({ name: '', price: null, duration: null });
    };
  
    const handleCancel = (id) => {
      setServices(services.map(service => 
        service.id === id ? { ...service, editing: false } : service
      ));
    };
  
    const handleDelete = (id) => {
      setDeletingServiceId(id);
    };
  
    const handleConfirmDelete = async () => {
      await fetchDeleteService();
      setDeletingServiceId(null);
    };

    const fetchDeleteService = async () => {
      try{
        await deleteService(deletingServiceId);
        setReload(prev => !prev);
      }catch(e){
        console.log(e);
      }
    }
  
    const handleChange = (id, field, value) => {
      setServices( 
        services.map(service => {
          let result = null;
          if(service.id === id){
            result = { ...service, [field]: value };
            setNewService({name: result.name, duration: result.duration, price: result.price });
          }else{
            result = service;
          } 
          return result
        })
      );
    };
  
    const handleAddService = async  () => {
      if (newService.name && newService.price) {
        await handleFetchAddService()
        setNewService({ name: '', price: null, duration: null });
      }
      setShowHandleAddService(false);
    };

    const handleFetchAddService = async ( ) => {
      try{
        const response = await addService(newService)
        const data = await response.json();
        setReload(prev => !prev);
      }catch(e){
        console.log(e);
      }
    }

    const handleShowAddService = () => {
        setShowHandleAddService(true);
    }
  
    return (
      <div>
        <h2>{strings.ADMIN_PAGE.SERVICES_SECTION.TITLE}</h2>
        { showHandleAddService ?
         (<div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder={strings.ADMIN_PAGE.SERVICES_SECTION.PLACEHOLDERS.NAME}
              value={newService.name}
              onChange={(e) => setNewService({...newService, name: e.target.value})}
              className="edit-input"
            />
            <input
              type="number"
              placeholder={strings.ADMIN_PAGE.SERVICES_SECTION.PLACEHOLDERS.PRICE}
              value={newService.price}
              onChange={(e) => setNewService({...newService, price: e.target.value})}
              className="edit-input"
              style={{ margin: '0 10px' }}
            />
             <input
              type="number"
              placeholder={strings.ADMIN_PAGE.SERVICES_SECTION.PLACEHOLDERS.DURATION}
              value={newService.duration}
              onChange={(e) => setNewService({...newService, duration: e.target.value})}
              className="edit-input"
              style={{ margin: '0 10px' }}
            />
            <button onClick={handleAddService} className="action-button confirm-button">
              {strings.ADMIN_PAGE.SERVICES_SECTION.BUTTONS.CONFIRM}
            </button>
          </div>) 
         : 
         (<div>
            <button onClick={handleShowAddService} className="action-button confirm-button">
             {strings.ADMIN_PAGE.SERVICES_SECTION.BUTTONS.ADD}
            </button>
         </div>)}
        
  
        <table className="services-table">
          <thead>
            <tr>
                <th>{strings.ADMIN_PAGE.SERVICES_SECTION.TABLE_HEADERS.NAME}</th>
                <th>{strings.ADMIN_PAGE.SERVICES_SECTION.TABLE_HEADERS.DURATION}</th>
                <th>{strings.ADMIN_PAGE.SERVICES_SECTION.TABLE_HEADERS.PRICE}</th>
            </tr>
          </thead>
          <tbody>
            {services.map(service => (
              <tr key={service.id} className={service.editing ? 'service-row editing' : 'service-row'}>
                <td>
                  {service.editing ? (
                    <input
                      type="text"
                      value={service.name}
                      onChange={(e) => handleChange(service.id, 'name', e.target.value)}
                      className="edit-input"
                    />
                  ) : service.name}
                </td>
                <td>
                  {service.editing ? (
                    <input
                      type="number"
                      value={service.duration}
                      onChange={(e) => handleChange(service.id, 'duration', e.target.value)}
                      className="edit-input"
                    />
                  ) : `${service.duration} min`}
                </td>
                <td>
                  {service.editing ? (
                    <input
                      type="number"
                      value={service.price}
                      onChange={(e) => handleChange(service.id, 'price', e.target.value)}
                      className="edit-input"
                    />
                  ) : `$${service.price}`}
                </td>
                <td className="actions-cell">
                  {service.editing ? (
                    <>
                      <button
                        onClick={() => handleSave(service.id)}
                        className="action-button confirm-button"
                      >
                        {strings.ADMIN_PAGE.SERVICES_SECTION.BUTTONS.CONFIRM}
                      </button>
                      <button
                        onClick={() => handleCancel(service.id)}
                        className="action-button cancel-button"
                      >
                        {strings.ADMIN_PAGE.SERVICES_SECTION.BUTTONS.CANCEL}
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(service.id)}
                        className="action-button edit-button"
                      >
                         {strings.ADMIN_PAGE.SERVICES_SECTION.BUTTONS.EDIT}
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="action-button delete-button"
                      >
                        {strings.ADMIN_PAGE.SERVICES_SECTION.BUTTONS.DELETE}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
  
        {deletingServiceId && (
          <div className="confirmation-modal">
            <div className="modal-content">
              <h3>{strings.ADMIN_PAGE.SERVICES_SECTION.MODAL.TITLE}</h3>
              <div className="modal-buttons">
                <button
                  onClick={handleConfirmDelete}
                  className="action-button delete-button"
                >
                  {strings.ADMIN_PAGE.SERVICES_SECTION.MODAL.CONFIRM}
                </button>
                <button
                  onClick={() => setDeletingServiceId(null)}
                  className="action-button cancel-button"
                >
                   {strings.ADMIN_PAGE.SERVICES_SECTION.MODAL.CANCEL}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
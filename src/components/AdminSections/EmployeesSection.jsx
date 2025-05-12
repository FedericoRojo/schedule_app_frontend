import React, {useEffect, useState, useCallback} from 'react';
import {strings} from './../../locales/es.js';


export default function EmployeesSection({ allServices, setAllServices }) {
    const [employees, setEmployees] = useState([]);
    const [newEmployee, setNewEmployee] = useState({
      firstName: '',
      lastName: '',
      role: 0,
      services: []
    });
    const [deletingEmployeeId, setDeletingEmployeeId] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchFirstName, setSearchFirstName] = useState('');
    const [searchLastName, setSearchLastName] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [modifiedRoles, setModifiedRoles] = useState({});


    useEffect(() => {
      fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/users/employees`,{
          headers: {
            'Authorization': token
          }
        });
        if (!response.ok) throw new Error('Error obteniendo empleados');
        const data = await response.json();
        setEmployees(data.result.map(emp => ({ ...emp, editing: false })));
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const handleSearchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_BASE_URL}/users/search?firstName=${searchFirstName}&lastName=${searchLastName}`,
          {
            headers: {
              'Authorization': token
            }
          }
        );
        
        if (!response.ok) throw new Error('Error en la búsqueda');
        const data = await response.json();
        setSearchResults(data.result);
      } catch (error) {
        console.error('Error:', error);
        setSearchResults([]);
      }
    };
    
    
    const confirmDelete = async () => {
      if (!deletingEmployeeId) return;

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_APP_API_BASE_URL}/users/${deletingEmployeeId}`, {
          method: 'DELETE',
          headers: {
            'Authorization' : token
          }
        });

        if (!response.ok) throw new Error('Error eliminando empleado');
        
        await fetchEmployees();
        setDeletingEmployeeId(null);
      } catch (error) {
        console.error('Error:', error);
        setDeletingEmployeeId(null);
      }
    };


    const handleServiceToggle = useCallback((employeeId, serviceId) => {
        setEmployees(
          prev => prev.map(emp => 
            emp.id === employeeId ? 
            {
              ...emp,
              services: emp.services.some(service => service.service_id === serviceId)
                        ? emp.services.filter(service => service.service_id !== serviceId)
                        : [
                            ...emp.services,
                            (()=>{
                              const foundService = allServices?.find(service => service.id === serviceId);
                              return foundService 
                                ? { 
                                    service_id: foundService.id,
                                    service_name: foundService.name 
                                  }
                                : null;
                            })()
                          ].filter(item => item) 
            } 
            : 
            emp
          )
        );
      }, []);
    
    const handleUpdateSave = useCallback(async (updatedEmployee) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_BASE_URL}/users/update/${updatedEmployee.id}`, 
          {
            method: 'PUT',
            headers: { 
              'Authorization': token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              firstName: updatedEmployee.first_name,
              lastName: updatedEmployee.last_name,
              role: updatedEmployee.role,
              services: updatedEmployee.services.map(s => s.service_id) 
            })
          }
        );
        
        if (!response.ok) throw new Error('Error actualizando empleado');
        
        await fetchEmployees();

      } catch (error) {
        console.error('Error:', error);
      }
    }, [fetchEmployees]);

    const updateRole = async (updatedEmployee) => {
        try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_BASE_URL}/users/upgrade/${updatedEmployee.id}`, 
          {
            method: 'PUT',
            headers: { 
              'Authorization': token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              role: updatedEmployee.role
            })
          }
        );
        
        if (!response.ok) throw new Error('Error actualizando empleado');
        
        await fetchEmployees();

      } catch (error) {
        console.error('Error:', error);
      }
    }

      const handleDelete = useCallback(async (id) => {
        setDeletingEmployeeId(id);
      }, []);

      const handleCloseSearch = () => {
        setShowSearchModal(false);
        setSearchFirstName('');
        setSearchLastName('');
        setSearchResults([]);
        setModifiedRoles({});
      }

      return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Empleados</h2>
              <button 
                onClick={() => setShowSearchModal(true)}
                className="action-button confirm-button"
              >
                + Agregar Empleado
              </button>
            </div>
      
            <EmployeeTable employees={employees} allServices={allServices} handleUpdateSave={handleUpdateSave}
              handleDelete={handleDelete} handleServiceToggle={handleServiceToggle} 
            />
    
            {showSearchModal && (
                <SearchComponent searchFirstName={searchFirstName} setSearchFirstName={setSearchFirstName}
                 searchLastName={searchLastName} setSearchLastName={setSearchLastName}
                 handleSearchUsers={handleSearchUsers} handleCloseSearch={handleCloseSearch} 
                 searchResults={searchResults} hasSearched={hasSearched} setHasSearched={setHasSearched}
                 modifiedRoles={modifiedRoles} updateRole={updateRole}/>
            )}

            {deletingEmployeeId && (
                <DeleteModal confirmDelete={confirmDelete} setDeletingEmployeeId={setDeletingEmployeeId}/>
            )}
        </div>
      );
};

const EmployeeTable = ({employees, allServices, handleUpdateSave, handleDelete, handleServiceToggle}) => {
  return (
      <table className="employee-table">
            <thead>
              <tr>
                  <th>{strings.ADMIN_PAGE.EMPLOYEE_SECTION.TABLE_HEADERS.NAME}</th>
                  <th>{strings.ADMIN_PAGE.EMPLOYEE_SECTION.TABLE_HEADERS.LASTNAME}</th>
                  <th>{strings.ADMIN_PAGE.EMPLOYEE_SECTION.TABLE_HEADERS.ROLE}</th>
                  <th>{strings.ADMIN_PAGE.EMPLOYEE_SECTION.TABLE_HEADERS.SERVICES}</th>
                  <th>{strings.ADMIN_PAGE.EMPLOYEE_SECTION.TABLE_HEADERS.ACTIONS}</th>
              </tr>
            </thead>
            <tbody>
                {employees!= null && employees.length > 0 && employees.map(employee => (
                    <EmployeeRow
                        key={employee.id}
                        employee={employee}
                        allServices={allServices}
                        onSave={handleUpdateSave}
                        onDelete={handleDelete}
                        onServiceToggle={handleServiceToggle}
                    />
                ))}
            </tbody>
      </table>
  )
}

const SearchComponent = ({searchFirstName, setSearchFirstName, searchLastName, setSearchLastName,
        handleSearchUsers, handleCloseSearch, searchResults, hasSearched, setHasSearched, updateRole
}) => {
  return (
    <div className="confirmation-modal">
      <div className="add-employee-modal">
          <h3>{strings.ADMIN_PAGE.EMPLOYEE_SECTION.MODAL_TITLES.SEARCH_AND_MANAGE}</h3>
            
          <div className="modal-input-group">
            <label>{strings.ADMIN_PAGE.EMPLOYEE_SECTION.MODAL_LABELS.FIRST_NAME}</label>
            <input
                type="text"
                placeholder={strings.ADMIN_PAGE.EMPLOYEE_SECTION.MODAL_PLACEHOLDERS.SEARCH_FIRST_NAME}
                value={searchFirstName}
                onChange={(e) => {
                  setSearchFirstName(e.target.value)
                  setHasSearched(false);
                }}
                className="edit-input"
            />
          </div>

          <div className="modal-input-group">
            <label>{strings.ADMIN_PAGE.EMPLOYEE_SECTION.MODAL_LABELS.LAST_NAME}</label>
            <input
              type="text"
              placeholder={strings.ADMIN_PAGE.EMPLOYEE_SECTION.MODAL_PLACEHOLDERS.SEARCH_LAST_NAME}
              value={searchLastName}
                onChange={(e) => {
                  setSearchLastName(e.target.value)
                  setHasSearched(false);
                }}
                className="edit-input"
            />
          </div>

          <div className="modal-buttons">
            <button
                onClick={() => {
                  setHasSearched(true)
                  handleSearchUsers()
                }}
                className="action-button confirm-button"
                disabled={!searchFirstName && !searchLastName}
                  
            >
              {strings.ADMIN_PAGE.EMPLOYEE_SECTION.MODAL_BUTTONS.SEARCH}
            </button>
            <button
              onClick={handleCloseSearch}
                className="action-button cancel-button"
            >
              {strings.ADMIN_PAGE.EMPLOYEE_SECTION.MODAL_BUTTONS.CLOSE}
            </button>
          </div>

          <SearchResult searchResults={searchResults} hasSearched={hasSearched} updateRole={updateRole}/>
          
      </div>
    </div>
  )
}

const SearchResult = ({searchResults, hasSearched, updateRole}) => {
  const [newRole, setNewRole] = useState(''); 
  return searchResults.length > 0 ? 
      (<div className="search-results">
          <h4>{strings.ADMIN_PAGE.EMPLOYEE_SECTION.SEARCH_RESULTS.TITLE}</h4>
          <div className="results-list">
            {searchResults.map(user => (
              <div key={user.id} className="user-result-item">
                <div className="user-info">
                    <span>{user.firstName} {user.lastName}</span>
                </div>
                
                <div className="role-management">
                    <select
                      value={newRole ?? user.role}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="role-select"
                    >
                      {Object.entries(strings.ADMIN_PAGE.EMPLOYEE_SECTION.ROLE_OPTIONS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                    
                    <button 
                      onClick={() => {
                        updateRole({id: user.id, role: newRole})
                        setNewRole('');
                      }}
                      className="action-button save-role-button"
                    >
                      Guardar Cambios
                    </button>
                </div>
              </div>
            ))}
          </div>
      </div>
        ) : hasSearched ? (
          <p className="no-results">
            {strings.ADMIN_PAGE.EMPLOYEE_SECTION.SEARCH_RESULTS.NONE_FOUND}
          </p>
        ) : (<></>)
}

const DeleteModal = ({confirmDelete, setDeletingEmployeeId }) => {
  return (
  <div className="confirmation-modal">
      <div className="modal-content">
        <h3>{strings.ADMIN_PAGE.EMPLOYEE_SECTION.MODAL_TITLES.DELETE_CONFIRMATION}</h3>
        <div className="modal-buttons">
            <button
                onClick={confirmDelete}
                className="action-button delete-button"
            >
                {strings.ADMIN_PAGE.EMPLOYEE_SECTION.MODAL_BUTTONS.CONFIRM_DELETE}
            </button>
            <button
                onClick={() => setDeletingEmployeeId(null)}
                className="action-button cancel-button"
            >
                {strings.ADMIN_PAGE.EMPLOYEE_SECTION.MODAL_BUTTONS.CANCEL}
            </button>
        </div>
      </div>
  </div>)
}

const EmployeeRow = React.memo(({ 
    employee,
    allServices,
    onSave,
    onCancel,
    onDelete,
    onServiceToggle
  }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(employee);
    

    useEffect(() => {
      setDraft(employee);
    }, [employee]);
  
    const handleLocalEdit = () => {
      setEditing(true);
    };
  
    const handleSave = () => {
      setEditing(false);
      onSave(draft);
    };
  
    const handleCancel = () => {
      setEditing(false);
      setDraft(employee);
      onCancel(employee.id);
    };
  
    return (
      <tr>
        <td>
          {editing ? (
            <input
              value={draft.first_name}
              onChange={(e) => setDraft({...draft, first_name: e.target.value})}
              className="edit-input"
            />
          ) : (
            employee.first_name
          )}
        </td>
        <td>
          {editing ? (
            <input
              value={draft.last_name}
              onChange={(e) => setDraft({...draft, last_name: e.target.value})}
              className="edit-input"
            />
          ) : (
            employee.last_name
          )}
        </td>
        <td>
          {editing ? (
            <select
              value={draft.role}
              onChange={(e) => setDraft({...draft, role: e.target.value})}
              className="edit-input"
            >
              {Object.entries(strings.ADMIN_PAGE.EMPLOYEE_SECTION.ROLE_OPTIONS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          ) : (
            draft.role
          )}
        </td>
        <td>
          <div className="services-tag-container">
            {editing ? (
              allServices.map(service => (
                <label key={service.id} className="service-checkbox-item">
                  <input
                    type="checkbox"
                    checked={draft.services.some(s => s.service_id === service.id)}
                    onChange={() => onServiceToggle(draft.id, service.id)}
                  />
                  {service.name}
                </label>
              ))
            ) : (
              draft.services.map(service => (
                <div key={service.service_id} className="service-tag">
                  {allServices?.find(s => s.id === service.service_id)?.name}
                </div>
              ))
            )}
          </div>
        </td>
        <td className="actions-cell">
          {editing ? (
            <>
              <button onClick={handleSave} className="action-button confirm-button">
                ✔
              </button>
              <button onClick={handleCancel} className="action-button cancel-button">
                ✖
              </button>
            </>
          ) : (
            <>
              {employee.role != 2 && (
                <>
                  <button onClick={handleLocalEdit} className="action-button edit-button">
                    Editar
                  </button>
                  <button onClick={() => onDelete(employee.id)} className="action-button delete-button">
                    Eliminar
                  </button>
                </>  
              )}
              
            </>
          )}
        </td>
      </tr>
    );
  }, (prevProps, nextProps) => {
    return JSON.stringify(prevProps.employee) === JSON.stringify(nextProps.employee) &&
         JSON.stringify(prevProps.allServices) === JSON.stringify(nextProps.allServices);
  });
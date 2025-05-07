import React, {useEffect, useState, useCallback} from 'react';


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
    
    const handleRoleChange = (userId, newRole) => {
      setModifiedRoles(prev => ({
        ...prev,
        [userId]: parseInt(newRole)
      }));
    };
    
    const handleSaveRole = async (userId) => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${import.meta.env.VITE_APP_API_BASE_URL}/users/${userId}/role`,
          {
            method: 'PUT',
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              role: modifiedRoles[userId]
            })
          }
        );
    
        if (!response.ok) throw new Error('Error actualizando rol');
        
        setSearchResults(prev => prev.map(user => 
          user.id === userId ? { ...user, role: modifiedRoles[userId] } : user
        ));

        setModifiedRoles(prev => {
          const newState = { ...prev };
          delete newState[userId];
          return newState;
        });

        fetchEmployees();

    
      } catch (error) {
        console.error('Error:', error);
      }
    };

    const handleAddEmployee = async () => {
      if (!newEmployee.firstName || !newEmployee.lastName) return;

      try {
        const response = await fetch('API_URL/employees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEmployee)
        });

        if (!response.ok) throw new Error('Error agregando empleado');
        
        await fetchEmployees();
        setShowAddModal(false);
        setNewEmployee({ 
          firstName: '', 
          lastName: '', 
          role: 0, 
          services: [] 
        });
      } catch (error) {
        console.error('Error:', error);
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
    
          <table className="employee-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Rol</th>
                <th>Servicios</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
                {employees.map(employee => (
                    <EmployeeRow
                        key={employee.id}
                        employee={employee}
                        allServices={allServices}
                        onEdit={(id) => setEditingId(id)} // If you need tracking
                        onSave={handleUpdateSave}
                        onCancel={(id) => {/* Reset logic */}}
                        onDelete={handleDelete}
                        onServiceToggle={handleServiceToggle}
                    />
                ))}
            </tbody>
          </table>
    
         {/* Search and Role Management Section */}
          {showSearchModal && (
            <div className="confirmation-modal">
              <div className="add-employee-modal">
                <h3>Buscar y Administrar Usuarios</h3>
                
                <div className="modal-input-group">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={searchFirstName}
                    onChange={(e) => setSearchFirstName(e.target.value)}
                    className="edit-input"
                  />
                </div>

                <div className="modal-input-group">
                  <label>Apellido:</label>
                  <input
                    type="text"
                    placeholder="Buscar por apellido..."
                    value={searchLastName}
                    onChange={(e) => setSearchLastName(e.target.value)}
                    className="edit-input"
                  />
                </div>

                <div className="modal-buttons">
                  <button
                    onClick={handleSearchUsers}
                    className="action-button confirm-button"
                    disabled={!searchFirstName && !searchLastName}
                  >
                    Buscar
                  </button>
                  <button
                    onClick={handleCloseSearch}
                    className="action-button cancel-button"
                  >
                    Cerrar
                  </button>
                </div>

                {/* Search Results */}
                {searchResults.length > 0 ? 
                  (
                  <div className="search-results">
                    <h4>Resultados de la búsqueda:</h4>
                    <div className="results-list">
                      {searchResults.map(user => (
                        <div key={user.id} className="user-result-item">
                          <div className="user-info">
                            <span>{user.firstName} {user.lastName}</span>
                          </div>
                          
                          <div className="role-management">
                            <select
                              value={modifiedRoles[user.id] ?? user.role}
                              onChange={(e) => handleRoleChange(user.id, e.target.value)}
                              className="role-select"
                            >
                              <option value={0}>Usuario Normal</option>
                              <option value={1}>Empleado</option>
                              <option value={2}>Administrador</option>
                            </select>
                            
                            <button 
                              onClick={() => handleSaveRole(user.id)}
                              className="action-button save-role-button"
                            >
                              Guardar Cambios
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="no-results">No se encontraron usuarios</p>
                )}
              </div>
            </div>
          )}
    
          {/* Modal confirmación eliminación */}
          {deletingEmployeeId && (
          <div className="confirmation-modal">
            <div className="modal-content">
              <h3>¿Eliminar este empleado?</h3>
              <div className="modal-buttons">
                <button
                  onClick={confirmDelete}
                  className="action-button delete-button"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setDeletingEmployeeId(null)}
                  className="action-button cancel-button"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      );
};

const EmployeeRow = React.memo(({ 
    employee,
    allServices,
    onEdit,
    onSave,
    onCancel,
    onDelete,
    onServiceToggle
  }) => {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(employee);
  
    // Reset draft when employee prop changes
    useEffect(() => {
      setDraft(employee);
    }, [employee]);
  
    const handleLocalEdit = () => {
      setEditing(true);
      onEdit(employee.id);
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
              <option value="1">Peluquero</option>
              <option value="2">Admin</option>
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
              <button onClick={handleLocalEdit} className="action-button edit-button">
                Editar
              </button>
              <button onClick={() => onDelete(employee.id)} className="action-button delete-button">
                Eliminar
              </button>
            </>
          )}
        </td>
      </tr>
    );
  }, (prevProps, nextProps) => {
    return JSON.stringify(prevProps.employee) === JSON.stringify(nextProps.employee) &&
         JSON.stringify(prevProps.allServices) === JSON.stringify(nextProps.allServices);
  });
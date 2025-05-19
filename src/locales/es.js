// strings.js
export const strings = {
    LOGIN_PAGE: {
        TITLE: "Iniciar sesión",
        EMAIL_PLACEHOLDER: "Correo electrónico",
        PASSWORD_PLACEHOLDER: "Contraseña",
        BUTTON_TEXT: "Ingresar",
        FOOTER_TEXT: "¿No tienes una cuenta?",
        REGISTER_LINK: "Regístrate"
    },
    REGISTER_PAGE: {
        TITLE: "Registrarse",
        NAME_PLACEHOLDER: "Nombre",
        LASTNAME_PLACEHOLDER: "Apellido",
        EMAIL_PLACEHOLDER: "Correo electrónico",
        PHONE_PLACEHOLDER: "Número telefónico",
        PASSWORD_PLACEHOLDER: "Contraseña",
        BUTTON_TEXT: "Crear cuenta",
        FOOTER_TEXT: "¿Ya tienes una cuenta?",
        LOGIN_LINK: "Iniciar sesión"
    },
    HEADER: {
        LOGO_ALT: "Logo de la aplicación",
        PROFILE: "Perfil",
        ADMINISTRATION: "Administración",
        LOGOUT: "Cerrar sesión"
    },
    PROFILE_PAGE: {
        TITLE: "Editar Perfil",
        FIRST_NAME_PLACEHOLDER: "Nombre",
        LAST_NAME_PLACEHOLDER: "Apellido",
        EMAIL_PLACEHOLDER: "Correo electrónico",
        PHONE_PLACEHOLDER: "Número telefónico",
        BUTTON_TEXT: "Guardar Cambios"
    },
    BOOKING_PAGE: {
        STEP_TITLES: {
            SERVICE: "Servicio",
            SPECIALIST: "Especialista",
            DATE_TIME: "Fecha y Hora",
            SUMMARY: "Resumen"
        },
        LOADING_SERVICES: "Cargando servicios...",
        STEPPER_LABELS: [
            "1. Servicio",
            "2. Especialista",
            "3. Fecha y Hora"
        ],
        SERVICE_STEP: {
            TITLE: "Seleccionar servicio",
            NO_SERVICES: "No hay servicios disponibles",
            DURATION_LABEL: "Duración"
        },
        SPECIALIST_STEP: {
            TITLE: "Seleccionar especialista",
            BACK_BUTTON: "← Volver a Servicios",
            NO_SPECIALISTS: "No hay especialistas disponibles",
            NAME_FORMAT: "{firstName} {lastName}" // Opcional para consistencia en formato de nombres
        },
        TIME_STEP: {
            BACK_BUTTON: "← Volver a Especialista",
            LOADING: "Cargando disponibilidad...",
            CONFIRM_BUTTON: "Confirmar",
            VALIDATION_MESSAGES: {
                NO_SLOT_SELECTED: "Debes seleccionar un turno",
                MIN_DISTANCE: "No puedes agendar citas tan seguidas"
            },
            SLOTS: {
                STATUS_AVAIL: 'available',
                TITLE_AVAIL: 'Available'
            }
        },
         SUMMARY_STEP: {
            TITLE: "Confirmación de Turno",
            BACK_BUTTON: "← Volver a Horario",
            BUTTON_TEXT: "Confirmar Turno",
            DETAIL_LABELS: {
                SERVICE: "Servicio:",
                SPECIALIST: "Especialista:",
                PRICE: "Precio:",
                DATE: "Fecha:",
                TIME: "Hora:"
            },
            CURRENCY: "$" 
        },

    },
    CALENDAR: {
        AGENDA: "Agenda",
        DATE: "Fecha",
        TIME: "Hora",
        EVENT: "Evento",
        NEXT: 'Siguiente',
        PREVIOUS: 'Anterior',
        TODAY: 'Hoy',
        MONTH: 'Mes',
        WEEK: 'Semana',
        DAY: 'Day',
        WEEKDAYS: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"], 
        MONTHS: [
            "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
            "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
        ],
    },
    HOME_PAGE: {
        TITLE: "Turnos",
        DETAIL_LABELS: {
        SERVICE: "Servicio:",
        DATE: "Fecha:",
        TIME: "Hora:"
        },
        CANCEL_BUTTON: "Cancelar",
        NO_APPOINTMENTS: "No hay turnos programados",
        BOOK_BUTTON: "Reservar nuevo turno"
    },
    ADMIN_PAGE: {
        TITLE: "Panel de Administración",
        MENU_ITEMS: {
            USERS: "Usuarios",
            SERVICES: "Servicios",
            APPOINTMENTS: "Turnos",
            SETTINGS: "Configuración"
            // Agregar más ítems según necesites
        },
        EMPLOYEE_SECTION: {
            TITLE: "Empleados",
            ADD_EMPLOYEE_BUTTON: "+ Agregar Empleado",
            TABLE_HEADERS: {
                NAME: "Nombre",
                LASTNAME: "Apellido",
                ROLE: "Rol",
                SERVICES: "Servicios",
                ACTIONS: "Acciones"
            },
            MODAL_TITLES: {
                SEARCH_AND_MANAGE: "Buscar y Administrar Usuarios",
                DELETE_CONFIRMATION: "¿Eliminar este empleado?"
            },
            MODAL_LABELS: {
                FIRST_NAME: "Nombre:",
                LAST_NAME: "Apellido:"
            },
            MODAL_PLACEHOLDERS: {
                SEARCH_FIRST_NAME: "Buscar por nombre...",
                SEARCH_LAST_NAME: "Buscar por apellido..."
            },
            MODAL_BUTTONS: {
                SEARCH: "Buscar",
                CLOSE: "Cerrar",
                SAVE_CHANGES: "Guardar Cambios",
                CONFIRM_DELETE: "Confirmar",
                CANCEL: "Cancelar"
            },
            SEARCH_RESULTS: {
                TITLE: "Resultados de la búsqueda:",
                NONE_FOUND: "No se encontraron usuarios"
            },
            ROLE_OPTIONS: {
                '0': "Usuario Normal",
                '1': "Empleado",
                '2': "Administrador"
            }
        },
        SERVICES_SECTION: {
            TITLE: "Servicios",
            BUTTONS: {
                ADD: "Agregar Servicio",
                CONFIRM: "Confirmar",
                CANCEL: "Cancelar",
                EDIT: "Editar",
                DELETE: "Eliminar"
            },
            TABLE_HEADERS: {
                NAME: "Nombre",
                DURATION: "Duración",
                PRICE: "Precio"
            },
            PLACEHOLDERS: {
                NAME: "Nombre del servicio",
                PRICE: "Precio",
                DURATION: "Duración (minutos)"
            },
            MODAL: {
                TITLE: "¿Estás seguro de eliminar este servicio?",
                CONFIRM: "Confirmar",
                CANCEL: "Cancelar"
            },
            UNITS: {
                DURATION: "min",
                CURRENCY: "$"
            },
            NO_SERVICES: "No hay servicios registrados"
        }
    },
    EMPLOYEE_SCHEDULE: {
        SIDEBAR: {
            BUTTONS: {
                APPOINTMENTS: "Turnos",
                AVAILABILITY: "Disponibilidad"
            }
        },
        APPOINTMENT_MANAGER: {
            DETAILS: {
                TITLE: "Detalles del evento",
                LABELS: {
                    SERVICE: "Servicio",
                    DATE: "Día",
                    START: "Inicio",
                    END: "Fin",
                    DURATION: "Duración",
                    USER: "Usuario",
                    PHONE: "Teléfono"
                },
                DEFAULTS: {
                    SERVICE: "Título del evento",
                    DESCRIPTION: "Sin descripción",
                    START_DATE: "Fecha de inicio",
                    END_DATE: "Fecha de fin",
                    USER_NAME: "Nombre del usuario",
                    USER_PHONE: "Número de teléfono del usuario"
                },
                BUTTONS: {
                    CLOSE: "Cerrar"
                },
                UNITS: {
                    DURATION: "min"
                }
            },
            SLOTS: {
                TITLE_AVAIL: 'Available',
                STATUS_AVAIL: "availability"
            }
        },
        AVAILABILITY_MANAGER: {
            BUTTONS: {
                CONFIRM: "Confirmar",
                CANCEL: "Cancelar",
                DELETE: "Eliminar"
            },
            MODES: {
                ADD: "add",
                EDIT: "edit",
                DELETE: "delete"
            },
            ERROR: {
                CLOSE_ARIA: "Cerrar mensaje de error"
            },
            LABELS: {
                AVAILABLE: "Disponible"
            }
        },
        MODE_SELECTOR: {
            BUTTONS: {
                LABELS: {
                VIEW: "👁️ Visualizar",
                ADD: "➕ Añadir",
                EDIT: "✏️ Editar",
                DELETE: "🗑️ Eliminar"
                }
            }
        }
    }
};
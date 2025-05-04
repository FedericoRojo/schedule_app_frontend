import { useState } from 'react';

const ModeSelector = ({currentMode, setCurrentMode, mode}) => {
  
  const handleModeChange = (newMode) => {
    setCurrentMode(newMode);
  };

  return (
    <div className="mode-selector">
      <button
        onClick={() => handleModeChange(mode.VIEW)}
        className={`mode-button ${currentMode === mode.VIEW ? 'active view-active' : ''}`}
      >
        👁️ Visualizar
      </button>

      <button
        onClick={() => handleModeChange(mode.ADD)}
        className={`mode-button ${currentMode === mode.ADD ? 'active add-active' : ''}`}
      >
        ➕ Añadir
      </button>

      <button
        onClick={() => handleModeChange(mode.EDIT)}
        className={`mode-button ${currentMode === mode.EDIT ? 'active edit-active' : ''}`}
      >
        ✏️ Editar
      </button>

      <button
        onClick={() => handleModeChange(mode.DELETE)}
        className={`mode-button ${currentMode === mode.DELETE ? 'active delete-active' : ''}`}
      >
        🗑️ Eliminar
      </button>

      <style jsx>{`
        .mode-selector {
          display: flex;
          gap: 8px;
          padding: 16px;
          background-color: #f3f4f6;
          border-radius: 8px;
        }
        
        .mode-button {
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          background-color: #e5e7eb;
          color: #1f2937;
          transition: all 0.2s ease;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        
        .mode-button:hover {
          background-color: #d1d5db;
        }
        
        .mode-button.active {
          color: white;
        }
        
        .view-active {
          background-color: #3b82f6;
        }
        
        .add-active {
          background-color: #10b981;
        }
        
        .edit-active {
          background-color: #f59e0b;
        }
        
        .delete-active {
          background-color: #ef4444;
        }
      `}</style>
    </div>
  );
};

export default ModeSelector;
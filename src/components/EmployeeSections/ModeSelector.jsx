import '../../styles/ModeSelector.css';
import {strings} from '../../locales/es.js'

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
        {strings.EMPLOYEE_SCHEDULE.MODE_SELECTOR.BUTTONS.LABELS.VIEW}
      </button>

      <button
        onClick={() => handleModeChange(mode.ADD)}
        className={`mode-button ${currentMode === mode.ADD ? 'active add-active' : ''}`}
      >
        {strings.EMPLOYEE_SCHEDULE.MODE_SELECTOR.BUTTONS.LABELS.ADD}
      </button>

      <button
        onClick={() => handleModeChange(mode.EDIT)}
        className={`mode-button ${currentMode === mode.EDIT ? 'active edit-active' : ''}`}
      >
        {strings.EMPLOYEE_SCHEDULE.MODE_SELECTOR.BUTTONS.LABELS.EDIT}
      </button>

      <button
        onClick={() => handleModeChange(mode.DELETE)}
        className={`mode-button ${currentMode === mode.DELETE ? 'active delete-active' : ''}`}
      >
        {strings.EMPLOYEE_SCHEDULE.MODE_SELECTOR.BUTTONS.LABELS.DELETE}
      </button>
    </div>
  );
};

export default ModeSelector;
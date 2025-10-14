import React from 'react';

interface SimulationControlProps {
  isPaused: boolean;
  onToggle: () => void;
}

const SimulationControl: React.FC<SimulationControlProps> = ({ isPaused, onToggle }) => {
  return (
    <div className="flex items-center space-x-2">
      <span className={`text-sm font-semibold ${isPaused ? 'text-gray-500' : 'text-green-400'}`}>
        {isPaused ? 'Paused' : 'Live'}
      </span>
      <label htmlFor="simulation-toggle" className="relative inline-flex items-center cursor-pointer">
        <input 
          type="checkbox" 
          id="simulation-toggle" 
          className="sr-only peer" 
          checked={!isPaused}
          onChange={onToggle}
        />
        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
      </label>
    </div>
  );
};

export default SimulationControl;
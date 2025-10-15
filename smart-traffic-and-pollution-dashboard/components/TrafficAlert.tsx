import React from 'react';
import { TrafficConeIcon } from './icons';
import type { TrafficAlertData } from '../types';

interface TrafficAlertProps {
  alert: TrafficAlertData;
  onDismiss: () => void;
}

const TrafficAlert: React.FC<TrafficAlertProps> = ({ alert, onDismiss }) => {
  const severity = alert.severity;
  const colorClasses = {
    critical: "bg-red-900/60 border-red-500 text-red-100",
    major: "bg-orange-900/60 border-orange-500 text-orange-100",
    minor: "bg-yellow-900/60 border-yellow-500 text-yellow-100",
  };
  
  const iconColor = {
    critical: "text-red-400",
    major: "text-orange-400",
    minor: "text-yellow-400",
  }

  return (
    <div className={`p-4 rounded-lg shadow-lg border-l-4 flex items-start space-x-4 animate-fade-in ${colorClasses[severity]}`} role="alert">
      <TrafficConeIcon className={`w-8 h-8 flex-shrink-0 mt-1 ${iconColor[severity]}`} />
      <div className="flex-grow">
        <h3 className="font-bold text-white">{alert.type} at {alert.location}</h3>
        <p className="text-sm mt-1">{alert.detour}</p>
      </div>
       <button
          onClick={onDismiss}
          className="text-gray-500 hover:text-white transition-colors flex-shrink-0"
          aria-label="Dismiss alert"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
    </div>
  );
};

export default TrafficAlert;

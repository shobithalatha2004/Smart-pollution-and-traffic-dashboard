
import React from 'react';
import { AlertIcon } from './icons';

interface WeatherAlertProps {
  message: string;
  severity: 'info' | 'warning' | 'danger';
}

const WeatherAlert: React.FC<WeatherAlertProps> = ({ message, severity }) => {
  const baseClasses = "p-4 rounded-lg shadow-lg border-l-4 flex items-center space-x-3";
  const colorClasses = {
    info: "bg-blue-900/50 border-blue-400 text-blue-100",
    warning: "bg-yellow-900/50 border-yellow-400 text-yellow-100",
    danger: "bg-red-900/50 border-red-400 text-red-100",
  };
  
  const iconColor = {
    info: "text-blue-300",
    warning: "text-yellow-300",
    danger: "text-red-300",
  }

  return (
    <div className={`${baseClasses} ${colorClasses[severity]}`} role="alert">
      <AlertIcon className={`w-6 h-6 flex-shrink-0 ${iconColor[severity]}`} />
      <div>
        <p className="font-bold capitalize">{severity}</p>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
};

export default WeatherAlert;

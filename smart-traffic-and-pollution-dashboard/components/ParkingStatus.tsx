import React from 'react';
import type { ParkingData } from '../types';
import { ParkingIcon } from './icons';

interface ParkingStatusProps {
  data: ParkingData[];
}

const ParkingStatus: React.FC<ParkingStatusProps> = ({ data }) => {
  return (
    <div className="bg-gray-800/50 p-4 rounded-xl shadow-lg border border-gray-700 h-full">
      <h3 className="text-lg font-semibold text-white mb-4">Live Parking Occupancy</h3>
      <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
        {data.map((lot) => {
          const percentage = lot.total > 0 ? Math.round((lot.occupied / lot.total) * 100) : 0;
          let barColor = 'bg-green-500';
          let textColor = 'text-green-400';
          let statusText = 'Available';
          let glowClass = 'shadow-green-500/40';

          if (percentage >= 95) {
            barColor = 'bg-red-600';
            textColor = 'text-red-500';
            statusText = 'Full';
            glowClass = 'shadow-red-600/40';
          } else if (percentage >= 80) {
            barColor = 'bg-red-500';
            textColor = 'text-red-400';
            statusText = 'Almost Full';
            glowClass = 'shadow-red-500/40';
          } else if (percentage >= 60) {
            barColor = 'bg-yellow-500';
            textColor = 'text-yellow-400';
            statusText = 'Filling Up';
            glowClass = 'shadow-yellow-500/40';
          }

          return (
            <div key={lot.id} className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 transition-all hover:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center min-w-0">
                   <ParkingIcon className="w-5 h-5 text-blue-400 mr-3 flex-shrink-0" />
                   <p className="font-semibold text-gray-200 truncate">{lot.name}</p>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${barColor}`}></div>
                  <p className={`font-bold text-sm ${textColor}`}>{statusText}</p>
                </div>
              </div>
              
              <div className="mt-3">
                <div className="flex justify-between items-baseline mb-1 text-xs text-gray-400">
                    <span>Occupancy</span>
                    <span>{lot.occupied.toLocaleString()} / {lot.total.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`${barColor} h-2.5 rounded-full transition-all duration-500 shadow-lg ${glowClass}`} 
                      style={{ width: `${percentage}%` }}
                      title={`${percentage}% full`}
                    ></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParkingStatus;
import React from 'react';
import type { SelectedHotspot } from '../types';
import { TrafficIcon, PollutionIcon, ParkingIcon } from './icons';

interface HotspotDetailModalProps {
  hotspot: SelectedHotspot;
  onClose: () => void;
}

const HotspotDetailModal: React.FC<HotspotDetailModalProps> = ({ hotspot, onClose }) => {
  const isTraffic = hotspot.type === 'traffic';
  const isPollution = hotspot.type === 'pollution';
  const isParking = hotspot.type === 'parking';

  const colorClass = isTraffic
    ? { high: 'border-red-500', medium: 'border-yellow-500', low: 'border-green-500' }[hotspot.level]
    : isPollution
    ? { high: 'border-pink-500', medium: 'border-purple-400', low: 'border-cyan-300' }[hotspot.level]
    : { high: 'border-red-500', medium: 'border-yellow-500', low: 'border-green-500' }[hotspot.level] || 'border-blue-400';
    
  const getIcon = () => {
      if (isTraffic) return <TrafficIcon className="w-6 h-6 text-red-400" />;
      if (isPollution) return <PollutionIcon className="w-6 h-6 text-cyan-300" />;
      if (isParking) return <ParkingIcon className="w-6 h-6 text-blue-400" />;
      return null;
  };
  
  const getIconBg = () => {
    if (isTraffic) return 'bg-red-500/20';
    if (isPollution) return 'bg-cyan-500/20';
    if (isParking) return 'bg-blue-500/20';
    return 'bg-gray-500/20';
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="hotspot-modal-title"
    >
      <div
        className={`bg-gray-800 rounded-2xl shadow-2xl border-t-4 ${colorClass} w-full max-w-md m-4 transform transition-all duration-300 animate-scale-up`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className={`p-2 rounded-full mr-4 ${getIconBg()}`}>
                {getIcon()}
              </div>
              <div>
                <h2 id="hotspot-modal-title" className="text-xl font-bold text-white capitalize">{hotspot.type} Details</h2>
                {hotspot.type !== 'parking' && <p className="text-sm text-gray-400">Severity Level: <span className="font-semibold capitalize">{hotspot.level}</span></p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-300 mb-2">Live Data</h3>
            <pre className="bg-gray-900/70 p-4 rounded-lg text-gray-300 whitespace-pre-wrap font-mono text-sm">
              {hotspot.details}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotspotDetailModal;
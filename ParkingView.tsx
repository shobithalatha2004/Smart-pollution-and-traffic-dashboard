import React from 'react';
import type { ParkingData, Hotspot } from '../types';
import ParkingCard from './ParkingCard';
import MapCard from './MapCard';
import { ParkingIcon, MapPinIcon } from './icons';

interface ParkingViewProps {
  data: (ParkingData & { distance: number | null })[];
  hotspots: Hotspot[];
  userLocation: { lat: number; lng: number } | null;
  mapFlyTo: { lat: number; lng: number } | null;
  onFlyTo: (coords: { lat: number; lng: number }) => void;
}

const ParkingView: React.FC<ParkingViewProps> = ({ data, hotspots, userLocation, mapFlyTo, onFlyTo }) => {
  const totalSpots = data.reduce((sum, lot) => sum + lot.total, 0);
  const totalOccupied = data.reduce((sum, lot) => sum + lot.occupied, 0);
  const availability = totalSpots > 0 ? ((totalSpots - totalOccupied) / totalSpots) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-100px)] animate-fade-in">
      <div className="lg:col-span-3 h-full">
        <MapCard hotspots={hotspots} userLocation={userLocation} flyTo={mapFlyTo} />
      </div>
      <div className="lg:col-span-2 flex flex-col space-y-4 h-full">
        <h2 className="text-2xl font-bold text-white">Nearby Parking</h2>
        <div className="grid grid-cols-2 gap-4">
            <ParkingCard title="Total Availability" value={`${availability.toFixed(1)}%`} percentage={availability} />
            <ParkingCard title="Nearby Lots" value={data.length.toString()} />
        </div>
        <div className="flex-grow overflow-y-auto pr-2 space-y-3 bg-gray-800/20 p-2 rounded-lg">
          {data.map((lot) => {
            const percentage = lot.total > 0 ? Math.round((lot.occupied / lot.total) * 100) : 0;
            let barColor = 'bg-green-500';
            let glowClass = 'shadow-green-500/40';
            let borderColor = 'border-gray-700'; // Default border

            // Highlight nearly full lots with color-coded borders
            if (percentage >= 95) {
                barColor = 'bg-red-600';
                glowClass = 'shadow-red-600/40';
                borderColor = 'border-red-500'; // Nearly full: Red border
            } else if (percentage >= 80) {
                barColor = 'bg-red-500';
                glowClass = 'shadow-red-500/40';
                borderColor = 'border-red-500'; // Almost full: Red border
            } else if (percentage >= 60) {
                barColor = 'bg-yellow-500';
                glowClass = 'shadow-yellow-500/40';
                borderColor = 'border-yellow-500'; // Filling up: Yellow border
            }
            return (
              <div key={lot.id} className={`bg-gray-800/50 p-3 rounded-lg border-2 ${borderColor} transition-all duration-300 hover:border-indigo-500 hover:bg-gray-800`}>
                <div className="flex items-start justify-between">
                    <div className="min-w-0">
                        <p className="font-bold text-white truncate">{lot.name}</p>
                        {lot.distance !== null && (
                            <p className="text-xs text-gray-400">{lot.distance.toFixed(2)} km away</p>
                        )}
                    </div>
                    {/* Enhanced Button */}
                    <button 
                      onClick={() => onFlyTo({ lat: lot.lat, lng: lot.lng })}
                      className="flex items-center space-x-2 text-base bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-full transition-all duration-200 transform hover:scale-105 hover:shadow-xl shadow-lg shadow-indigo-600/30"
                      title="Locate on Map"
                    >
                        <MapPinIcon className="w-5 h-5" />
                        <span>Locate</span>
                    </button>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between items-baseline mb-1 text-xs text-gray-400">
                      <span>{lot.occupied.toLocaleString()} / {lot.total.toLocaleString()} spots</span>
                      <span className="font-semibold text-white">{percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`${barColor} h-2 rounded-full transition-all duration-500 shadow-lg ${glowClass}`} 
                        style={{ width: `${percentage}%` }}
                      ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ParkingView;
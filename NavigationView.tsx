import React from 'react';
import MapCard from './MapCard';
import { RouteIcon, CarIcon, ClockIcon } from './icons';
import type { Hotspot, RouteData } from '../types';

interface NavigationViewProps {
  userLocation: { lat: number; lng: number } | null;
  hotspots: Hotspot[];
  routeData: RouteData | null;
  onFindRoute: () => void;
}

const NavigationView: React.FC<NavigationViewProps> = ({ userLocation, hotspots, routeData, onFindRoute }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[calc(100vh-100px)] animate-fade-in">
      <div className="lg:col-span-3 h-full">
        <MapCard hotspots={hotspots} userLocation={userLocation} routeData={routeData} />
      </div>
      <div className="lg:col-span-2 flex flex-col space-y-4 h-full bg-gray-800/20 p-4 rounded-lg">
        <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
          <RouteIcon className="w-7 h-7 text-indigo-400" />
          <span>Real-Time Navigator</span>
        </h2>
        
        <div className="bg-gray-800/50 p-4 rounded-xl shadow-lg border border-gray-700">
          <p className="text-gray-300 mb-4">Calculate the fastest route to a destination based on live traffic conditions.</p>
          <button
            onClick={onFindRoute}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-full transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <CarIcon className="w-6 h-6" />
            <span>Find Fastest Route to City Center</span>
          </button>
        </div>
        
        <div className="flex-grow overflow-y-auto pr-2 space-y-3">
            {routeData ? (
                routeData.map(route => (
                    <div key={route.name} className={`p-4 rounded-lg border-2 ${route.color === '#ef4444' ? 'border-red-500 bg-red-900/20' : 'border-blue-500 bg-blue-900/20'}`}>
                        <h3 className={`font-bold text-lg ${route.color === '#ef4444' ? 'text-red-300' : 'text-blue-300'}`}>{route.name}</h3>
                        <div className="flex justify-between items-center mt-2 text-gray-300">
                            <div className="flex items-center space-x-2">
                                <RouteIcon className="w-5 h-5 text-gray-400" />
                                <span>{route.distanceKm.toFixed(1)} km</span>
                            </div>
                             <div className="flex items-center space-x-2">
                                <ClockIcon className="w-5 h-5 text-gray-400" />
                                <span>~{route.timeMin} min</span>
                            </div>
                        </div>
                         {route.name === 'Smart Detour' && (
                            <p className="text-sm text-green-400 mt-2 font-semibold">This route avoids heavy congestion and is recommended.</p>
                        )}
                    </div>
                ))
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                    <p>Click the button above to find a route.</p>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default NavigationView;
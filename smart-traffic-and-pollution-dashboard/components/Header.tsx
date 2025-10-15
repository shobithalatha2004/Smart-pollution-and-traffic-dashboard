import React from 'react';
import { BellIcon, SearchIcon, UserCircleIcon, SunIcon, CloudIcon, RainIcon, StormIcon, PartlyCloudyIcon } from './icons';
import SimulationControl from './SimulationControl';
import type { WeatherData } from '../types';

interface HeaderProps {
  isSimulationPaused: boolean;
  onToggleSimulation: () => void;
  weatherData: WeatherData;
}

const WeatherDisplay: React.FC<{ weather: WeatherData }> = ({ weather }) => {
  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'Clear Sky':
        return <SunIcon className="w-7 h-7 text-yellow-300" />;
      case 'Partly Cloudy':
        return <PartlyCloudyIcon className="w-7 h-7 text-gray-300" />;
      case 'Light Rain':
        return <RainIcon className="w-7 h-7 text-blue-300" />;
      case 'Thunderstorm':
        return <StormIcon className="w-7 h-7 text-purple-300" />;
      default:
        return <CloudIcon className="w-7 h-7 text-gray-400" />;
    }
  };

  return (
    <div className="flex items-center space-x-3 bg-gray-700/50 border border-gray-600 rounded-full px-4 py-1.5">
      {getWeatherIcon()}
      <div>
        <p className="font-bold text-white leading-tight">{weather.temperature.toFixed(0)}°C</p>
        <p className="text-xs text-gray-400 leading-tight">{weather.condition}</p>
      </div>
    </div>
  );
};


const Header: React.FC<HeaderProps> = ({ isSimulationPaused, onToggleSimulation, weatherData }) => {
  return (
    <header className="bg-gray-800/50 border-b border-gray-700 p-4 flex justify-between items-center z-10">
      <div>
        <h1 className="text-xl font-bold text-white">Smart Traffic and Pollution Dashboard</h1>
        <p className="text-sm text-gray-400">Real-time city metrics at your fingertips</p>
      </div>
      <div className="flex items-center space-x-4">
        <WeatherDisplay weather={weatherData} />
        <SimulationControl isPaused={isSimulationPaused} onToggle={onToggleSimulation} />
        <div className="relative hidden md:block">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-gray-700/50 border border-gray-600 rounded-full py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <BellIcon className="w-6 h-6 text-gray-300" />
        </button>
        <button className="p-2 rounded-full hover:bg-gray-700 transition-colors">
          <UserCircleIcon className="w-8 h-8 text-gray-300" />
        </button>
      </div>
    </header>
  );
};

export default Header;
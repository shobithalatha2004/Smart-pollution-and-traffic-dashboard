
import React from 'react';
import { HomeIcon, MapIcon, ChartBarIcon, CogIcon, LogoutIcon, ParkingSidebarIcon, SatelliteIcon } from './icons';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-indigo-600 text-white shadow-lg'
          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </a>
  </li>
);

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange }) => {
  return (
    <aside className="bg-gray-800/50 border-r border-gray-700 w-64 p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-center mb-10">
          <MapIcon className="w-8 h-8 text-indigo-400" />
          <span className="text-xl font-bold text-white ml-2">UrbanIQ</span>
        </div>
        <nav>
          <ul className="space-y-2">
            <NavItem
              icon={<HomeIcon className="w-6 h-6" />}
              label="Dashboard"
              isActive={activeView === 'dashboard'}
              onClick={() => onViewChange('dashboard')}
            />
            <NavItem
              icon={<ParkingSidebarIcon className="w-6 h-6" />}
              label="Parking"
              isActive={activeView === 'parking'}
              onClick={() => onViewChange('parking')}
            />
            <NavItem
              icon={<SatelliteIcon className="w-6 h-6" />}
              label="Satellite"
              isActive={activeView === 'satellite'}
              onClick={() => onViewChange('satellite')}
            />
             <NavItem
              icon={<ChartBarIcon className="w-6 h-6" />}
              label="Analytics"
              isActive={activeView === 'analytics'}
              onClick={() => onViewChange('analytics')}
            />
          </ul>
        </nav>
      </div>
      <div>
        <ul className="space-y-2">
          <NavItem
            icon={<CogIcon className="w-6 h-6" />}
            label="Settings"
            isActive={activeView === 'settings'}
            onClick={() => onViewChange('settings')}
          />
          <NavItem
            icon={<LogoutIcon className="w-6 h-6" />}
            label="Logout"
            isActive={false}
            onClick={() => alert('Logout clicked!')}
          />
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
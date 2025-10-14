
import React from 'react';
import type { KpiCardProps } from '../types';
import { ArrowUpIcon, ArrowDownIcon } from './icons';

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, trend }) => {
  const isUp = trend === 'up';
  const trendColor = isUp ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-gray-800/50 p-5 rounded-xl shadow-lg border border-gray-700 hover:border-indigo-500/50 transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className="bg-gray-700 p-3 rounded-full">
          {icon}
        </div>
      </div>
      <div className={`mt-4 flex items-center text-sm ${trendColor}`}>
        {isUp ? <ArrowUpIcon className="w-5 h-5" /> : <ArrowDownIcon className="w-5 h-5" />}
        <span className="ml-1">{isUp ? 'Improving' : 'Declining'}</span>
      </div>
    </div>
  );
};

export default KpiCard;

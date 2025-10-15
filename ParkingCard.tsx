import React from 'react';

interface ParkingCardProps {
  title: string;
  value: string;
  percentage?: number;
}

const ParkingCard: React.FC<ParkingCardProps> = ({ title, value, percentage }) => {
  let barColor: string | null = null;
  
  // Color logic for availability: high percentage is good (green)
  if (typeof percentage === 'number') {
    if (percentage < 15) {
      barColor = 'bg-red-500';
    } else if (percentage < 40) {
      barColor = 'bg-yellow-500';
    } else {
      barColor = 'bg-green-500';
    }
  }

  return (
    <div className="bg-gray-800/50 p-5 rounded-xl shadow-lg border border-gray-700 flex flex-col justify-between h-full">
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
      {typeof percentage === 'number' && barColor && (
        <div className="mt-4">
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className={`${barColor} h-2.5 rounded-full transition-all duration-500`}
              style={{ width: `${percentage}%` }}
              title={`${percentage.toFixed(1)}% Available`}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParkingCard;
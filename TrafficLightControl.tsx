
import React from 'react';

const TrafficLight: React.FC<{ status: 'red' | 'yellow' | 'green' }> = ({ status }) => (
    <div className="flex flex-col items-center bg-gray-900/50 p-2 rounded-lg border border-gray-700">
        <div className={`w-5 h-5 rounded-full m-1 ${status === 'red' ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-red-900/50'}`}></div>
        <div className={`w-5 h-5 rounded-full m-1 ${status === 'yellow' ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' : 'bg-yellow-900/50'}`}></div>
        <div className={`w-5 h-5 rounded-full m-1 ${status === 'green' ? 'bg-green-500 shadow-lg shadow-green-500/50' : 'bg-green-900/50'}`}></div>
    </div>
);

const TrafficLightControl: React.FC = () => {
    return (
        <div className="bg-gray-800/50 p-4 rounded-xl shadow-lg border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Standard Traffic Signal</h3>
            <div className="flex justify-around items-center pt-4">
                <div>
                    <TrafficLight status="green" />
                </div>
                <div>
                    <TrafficLight status="red" />
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-400">Mode</p>
                    <p className="font-bold text-gray-300">Fixed Time</p>
                </div>
            </div>
        </div>
    );
};

export default TrafficLightControl;
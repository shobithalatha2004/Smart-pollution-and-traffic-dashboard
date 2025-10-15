
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { GasData } from '../types';

interface HarmfulGasesProps {
  data: GasData[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F'];

const HarmfulGases: React.FC<HarmfulGasesProps> = ({ data }) => {
  return (
    <div className="bg-gray-800/50 p-4 rounded-xl shadow-lg border border-gray-700 h-full">
      <h3 className="text-lg font-semibold text-white mb-4">Harmful Gas Composition (µg/m³)</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              // Cast data to 'any' to resolve recharts typing issue where it incorrectly
              // requires an index signature for data objects passed to the Pie component.
              data={data as any}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              // The type of `percent` can be undefined or not a number; handle this safely.
              label={({ name, percent }) => `${name} ${(Number(percent || 0) * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(26, 32, 44, 0.9)',
                borderColor: '#4A5568',
                borderRadius: '0.5rem'
              }}
              labelStyle={{ color: '#E2E8F0' }}
            />
            <Legend wrapperStyle={{ color: '#E2E8F0', paddingTop: '20px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HarmfulGases;
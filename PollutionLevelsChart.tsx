
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { PollutionDataPoint } from '../types';

interface PollutionLevelsChartProps {
  data: PollutionDataPoint[];
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F'];

const PollutionLevelsChart: React.FC<PollutionLevelsChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <BarChart 
          data={data}
          layout="vertical"
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <XAxis type="number" stroke="#A0AEC0" />
          <YAxis type="category" dataKey="name" stroke="#A0AEC0" width={40} />
          <Tooltip 
            cursor={{fill: 'rgba(74, 85, 104, 0.3)'}}
            contentStyle={{ 
              backgroundColor: 'rgba(26, 32, 44, 0.8)', 
              borderColor: '#4A5568',
              borderRadius: '0.5rem' 
            }}
            labelStyle={{ color: '#E2E8F0' }}
          />
          <Bar dataKey="value" fill="#8884d8" barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PollutionLevelsChart;


import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TrafficDataPoint } from '../types';

interface TrafficPredictionChartProps {
  data: TrafficDataPoint[];
}

const TrafficPredictionChart: React.FC<TrafficPredictionChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis dataKey="time" stroke="#A0AEC0" />
          <YAxis stroke="#A0AEC0" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(26, 32, 44, 0.8)', 
              borderColor: '#4A5568',
              borderRadius: '0.5rem' 
            }}
            labelStyle={{ color: '#E2E8F0' }}
          />
          <Legend wrapperStyle={{ color: '#E2E8F0' }} />
          <Line type="monotone" dataKey="Predicted Congestion" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="Actual Congestion" stroke="#82ca9d" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrafficPredictionChart;

import React from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { HistoricalDataPoint } from '../types';

interface HistoricalChartProps {
  data: HistoricalDataPoint[];
}

const HistoricalChart: React.FC<HistoricalChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <ComposedChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
          <XAxis 
            dataKey="hour" 
            stroke="#A0AEC0" 
            tickFormatter={(tick) => (parseInt(tick.split(':')[0]) % 6 === 0 ? tick : '')}
            tickLine={false}
          />
          <YAxis yAxisId="left" stroke="#8884d8" label={{ value: 'Traffic / AQI', angle: -90, position: 'insideLeft', fill: '#A0AEC0' }} />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Parking Avail. (%)', angle: 90, position: 'insideRight', fill: '#A0AEC0' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(26, 32, 44, 0.9)', 
              borderColor: '#4A5568',
              borderRadius: '0.5rem' 
            }}
            labelStyle={{ color: '#E2E8F0' }}
          />
          <Legend wrapperStyle={{ color: '#E2E8F0' }} />
          <Line yAxisId="left" type="monotone" dataKey="traffic" name="Traffic Congestion" stroke="#8884d8" strokeWidth={2} dot={false} />
          <Line yAxisId="left" type="monotone" dataKey="aqi" name="Air Quality (AQI)" stroke="#ffc658" strokeWidth={2} dot={false} />
          <Bar yAxisId="right" dataKey="parking" name="Parking Availability" fill="#82ca9d" barSize={20} opacity={0.6} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoricalChart;

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p className="tooltip-label">{label}</p>
        <p className="tooltip-data">Storage Used: <span>{payload[0].value}%</span></p>
        <p className="tooltip-status">Status: <span className={data.status === 'Online' ? 'text-success' : 'text-error'}>{data.status}</span></p>
        {data.error && <p className="tooltip-error">Error: {data.error}</p>}
      </div>
    );
  }
  return null;
};

const DbBarChart = ({ data }) => {
  // We want to highlight bars that are getting full (e.g. > 80%) in a different color
  return (
    <div className="chart-container" style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20, right: 30, left: 20, bottom: 50,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2c2c35" vertical={false} />
          <XAxis 
            dataKey="clusterName" 
            stroke="#8b8b99" 
            tick={{ fill: '#8b8b99', fontSize: 12 }} 
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#8b8b99" 
            tick={{ fill: '#8b8b99' }} 
            label={{ value: 'Storage Used (%)', angle: -90, position: 'insideLeft', fill: '#8b8b99' }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} />
          <Legend wrapperStyle={{ paddingTop: '20px' }}/>
          <Bar dataKey="usedStoragePercent" name="Storage Used" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.status === 'Online' 
                  ? (entry.usedStoragePercent > 80 ? '#ef4444' : '#3b82f6') 
                  : '#4b5563'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DbBarChart;

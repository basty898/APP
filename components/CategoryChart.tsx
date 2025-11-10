import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  percent: number;
  [key:string]: any;
}

interface CategoryChartProps {
  data: ChartData[];
  colors: string[];
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value }: any) => {
  if (percent < 0.08) return null; // Don't render labels for tiny slices
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="pointer-events-none">
      <tspan x={x} dy="-0.4em" fontSize="10px" className="opacity-80">{name}</tspan>
      <tspan x={x} dy="1.1em" fontSize="12px" fontWeight="600">{`${(percent * 100).toFixed(0)}%`}</tspan>
    </text>
  );
};


const CategoryChart: React.FC<CategoryChartProps> = ({ data, colors }) => {

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-secondary">No hay datos para mostrar.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <defs>
            <filter id="pie-shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="rgba(13, 31, 60, 0.15)" />
            </filter>
        </defs>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius="100%"
          innerRadius="65%"
          fill="#8884d8"
          dataKey="value"
          paddingAngle={2}
          cornerRadius={8}
          isAnimationActive={true}
          animationDuration={800}
          animationEasing="ease-out"
          style={{ filter: 'url(#pie-shadow)', cursor: 'pointer' }}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} stroke={colors[index % colors.length]} className="focus:outline-none" />
          ))}
        </Pie>
        <Tooltip
            cursor={{ fill: 'transparent' }}
            contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backdropFilter: 'blur(5px)',
            }}
            formatter={(value: number, name: string, props) => [new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value), `${name} (${(props.payload.percent * 100).toFixed(0)}%)` ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryChart;
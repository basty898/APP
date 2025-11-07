import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Fix: Add index signature to ChartData to make it compatible with the 'recharts' library's data prop type.
interface ChartData {
  name: string;
  value: number;
  [key: string]: any;
}

interface CategoryChartProps {
  data: ChartData[];
  colors: string[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ data, colors }) => {

  if (data.length === 0) {
    return <div className="flex items-center justify-center h-full text-text-secondary">No hay datos para mostrar.</div>;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius="100%"
          innerRadius="70%"
          fill="#8884d8"
          dataKey="value"
          paddingAngle={5}
          cornerRadius={8}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} className="focus:outline-none" />
          ))}
        </Pie>
        <Tooltip
            contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ddd',
                borderRadius: '8px',
            }}
            formatter={(value: number) => [new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value), 'Gasto mensual']}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryChart;

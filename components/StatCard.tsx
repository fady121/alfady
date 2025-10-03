
import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  colorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, colorClass }) => {
  const textColor = colorClass.split(' ').find(cls => cls.startsWith('text-')) || 'text-gray-900';
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg flex items-center transition transform hover:-translate-y-1">
      <div className={`p-4 rounded-full me-4 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
      </div>
    </div>
  );
};

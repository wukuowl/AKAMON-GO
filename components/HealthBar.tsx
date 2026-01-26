import React from 'react';

interface HealthBarProps {
  current: number;
  max: number;
  label: string;
}

const HealthBar: React.FC<HealthBarProps> = ({ current, max, label }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  let colorClass = 'bg-green-500';
  if (percentage < 50) colorClass = 'bg-yellow-400';
  if (percentage < 20) colorClass = 'bg-red-500';

  return (
    <div className="w-full bg-gray-800 rounded-lg p-2 border border-gray-600 shadow-md">
      <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-1 text-gray-200">
        <span>{label}</span>
        <span>{Math.ceil(current)} / {max}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ease-out ${colorClass}`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default HealthBar;

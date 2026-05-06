import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend: string;
  color: string;
}

export function StatCard({ icon, label, value, trend, color }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm flex items-start justify-between">
      <div className="flex flex-col">
        <h3 className="text-gray-500 dark:text-gray-400 text-[13px] mb-2">{label}</h3>
        <p className="text-[2rem] leading-none font-normal text-gray-800 dark:text-white mb-2">{value}</p>
        <span className="text-[13px] text-gray-400 dark:text-gray-500 mt-1">{trend}</span>
      </div>
      <div className={`w-[3.25rem] h-[3.25rem] rounded-2xl flex items-center justify-center text-white shrink-0 ${color}`}>
        {icon}
      </div>
    </div>
  );
}

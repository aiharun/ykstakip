import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  colorClass: string; // e.g. "indigo", "emerald", "violet"
}

const colorMap: Record<string, { gradient: string; text: string; glow: string; bg: string }> = {
  'text-emerald-600 bg-emerald-600': {
    gradient: 'from-emerald-500/20 to-emerald-600/10',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
    bg: 'bg-emerald-500/15',
  },
  'text-blue-600 bg-blue-600': {
    gradient: 'from-blue-500/20 to-blue-600/10',
    text: 'text-blue-400',
    glow: 'shadow-blue-500/20',
    bg: 'bg-blue-500/15',
  },
  'text-violet-600 bg-violet-600': {
    gradient: 'from-violet-500/20 to-violet-600/10',
    text: 'text-violet-400',
    glow: 'shadow-violet-500/20',
    bg: 'bg-violet-500/15',
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, trend, colorClass }) => {
  const colors = colorMap[colorClass] || colorMap['text-violet-600 bg-violet-600'];

  return (
    <div className={`glass glass-hover gradient-border p-5 flex items-center space-x-4 transition-all duration-300 hover:scale-[1.02] group`}>
      <div className={`p-3 rounded-xl ${colors.bg} transition-all duration-300 group-hover:shadow-lg ${colors.glow}`}>
        <Icon className={`w-6 h-6 ${colors.text}`} />
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-0.5">{value}</h3>
        {trend && <p className={`text-xs ${colors.text} mt-1 font-medium`}>{trend}</p>}
      </div>
    </div>
  );
};

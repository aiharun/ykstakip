import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { StudyEntry } from '../types';
import { SUBJECT_COLORS } from '../constants';

interface ChartsProps {
  entries: StudyEntry[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass px-4 py-3 text-sm border border-white/10">
        <p className="text-gray-400 mb-1">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} className="text-white font-semibold">{p.value} Soru</p>
        ))}
      </div>
    );
  }
  return null;
};

export const Charts: React.FC<ChartsProps> = ({ entries }) => {
  const subjectData = Object.entries(
    entries.reduce((acc, entry) => {
      acc[entry.subject] = (acc[entry.subject] || 0) + entry.questionCount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  }).reverse();

  const dailyData = last7Days.map(date => {
    const dayEntries = entries.filter(e => e.date.startsWith(date));
    const totalQuestions = dayEntries.reduce((sum, e) => sum + e.questionCount, 0);
    return {
      date: new Date(date).toLocaleDateString('tr-TR', { weekday: 'short' }),
      questions: totalQuestions
    };
  });

  if (entries.length === 0) return null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 stagger">
      {/* Subject Distribution */}
      <div className="glass gradient-border p-6">
        <h3 className="text-white font-semibold mb-4">Derslere Göre Soru Dağılımı</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={subjectData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {subjectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SUBJECT_COLORS[entry.name as keyof typeof SUBJECT_COLORS] || '#818cf8'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                iconType="circle"
                formatter={(value: string) => <span className="text-gray-400 text-xs ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Progress */}
      <div className="glass gradient-border p-6">
        <h3 className="text-white font-semibold mb-4">Son 7 Gün Performansı</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
              <Bar dataKey="questions" fill="url(#barGradient)" radius={[6, 6, 0, 0]} barSize={28} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.5} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

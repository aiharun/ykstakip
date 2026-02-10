import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { StudyEntry } from '../types';
import { SUBJECT_COLORS } from '../constants';

interface ChartsProps {
  entries: StudyEntry[];
}

export const Charts: React.FC<ChartsProps> = ({ entries }) => {
  // Aggregate data for Pie Chart (Questions by Subject)
  const subjectData = Object.entries(
    entries.reduce((acc, entry) => {
      acc[entry.subject] = (acc[entry.subject] || 0) + entry.questionCount;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Aggregate data for Bar Chart (Last 7 Days Activity)
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Subject Distribution */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-gray-800 font-semibold mb-4">Derslere Göre Soru Dağılımı</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={subjectData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {subjectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={SUBJECT_COLORS[entry.name as keyof typeof SUBJECT_COLORS] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => [`${value} Soru`, 'Toplam']} />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Progress */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-gray-800 font-semibold mb-4">Son 7 Gün Soru Performansı</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="questions" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

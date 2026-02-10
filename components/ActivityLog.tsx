import React from 'react';
import { StudyEntry } from '../types';
import { SUBJECT_COLORS } from '../constants';
import { Clock, Check, X, Trash2, BookOpen } from 'lucide-react';

interface ActivityLogProps {
  entries: StudyEntry[];
  onDelete: (id: string) => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ entries, onDelete }) => {
  const calculateNet = (correct: number, incorrect: number) => {
    return (correct - (incorrect / 4));
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 glass gradient-border">
        <div className="text-gray-500 mb-3">
          <BookOpen className="w-12 h-12 mx-auto opacity-40" />
        </div>
        <p className="text-gray-400">Henüz kayıt bulunmuyor. Bugün çalışmaya başla!</p>
      </div>
    );
  }

  return (
    <div className="glass gradient-border overflow-hidden animate-fade-in-up">
      <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
        <h3 className="font-semibold text-white">Son Çalışmalar</h3>
        <span className="text-xs text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">{entries.length} Kayıt</span>
      </div>
      <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
        {entries.map((entry, index) => {
          const correct = entry.correctCount !== undefined ? entry.correctCount : entry.questionCount;
          const incorrect = entry.incorrectCount !== undefined ? entry.incorrectCount : 0;
          const net = calculateNet(correct, incorrect);

          return (
            <div
              key={entry.id}
              className="p-4 hover:bg-white/[0.03] transition-all duration-200 group flex flex-col sm:flex-row justify-between sm:items-center gap-4"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start space-x-4">
                <div
                  className="w-1.5 h-12 rounded-full shrink-0 shadow-lg"
                  style={{
                    backgroundColor: SUBJECT_COLORS[entry.subject],
                    boxShadow: `0 0 12px ${SUBJECT_COLORS[entry.subject]}40`
                  }}
                ></div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-white">{entry.subject}</span>
                    <span className="text-xs text-gray-600">•</span>
                    <span className="text-sm text-gray-400">{entry.topic}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2 text-xs">
                    <div className="flex items-center space-x-1 text-emerald-400 font-medium">
                      <Check className="w-3 h-3" />
                      <span>{correct} D</span>
                    </div>
                    <div className="flex items-center space-x-1 text-rose-400 font-medium">
                      <X className="w-3 h-3" />
                      <span>{incorrect} Y</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-md font-bold border border-indigo-500/20">
                      <span>{Number.isInteger(net) ? net : net.toFixed(2)} Net</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{entry.durationMinutes} dk</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto pl-6 sm:pl-0">
                <span className="text-xs text-gray-500 sm:mr-4">
                  {new Date(entry.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="text-gray-600 hover:text-rose-400 p-2 rounded-full hover:bg-rose-500/10 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-200"
                  title="Kaydı Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
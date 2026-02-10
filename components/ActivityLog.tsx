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
      <div className="text-center py-10 bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="text-gray-400 mb-2">
          <BookOpen className="w-12 h-12 mx-auto opacity-50" />
        </div>
        <p className="text-gray-500">Henüz kayıt bulunmuyor. Bugün çalışmaya başla!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800">Son Çalışmalar</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{entries.length} Kayıt</span>
      </div>
      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {entries.map((entry) => {
          // Handle backwards compatibility for entries without explicit correct/incorrect counts
          const correct = entry.correctCount !== undefined ? entry.correctCount : entry.questionCount;
          const incorrect = entry.incorrectCount !== undefined ? entry.incorrectCount : 0;
          const net = calculateNet(correct, incorrect);

          return (
            <div key={entry.id} className="p-4 hover:bg-gray-50 transition duration-150 group flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div className="flex items-start space-x-4">
                <div 
                  className="w-2 h-12 rounded-full shrink-0" 
                  style={{ backgroundColor: SUBJECT_COLORS[entry.subject] }}
                ></div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-800">{entry.subject}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-sm text-gray-600">{entry.topic}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-xs text-gray-500">
                    <div className="flex items-center space-x-1 text-green-600 font-medium">
                      <Check className="w-3 h-3" />
                      <span>{correct} D</span>
                    </div>
                    <div className="flex items-center space-x-1 text-red-600 font-medium">
                      <X className="w-3 h-3" />
                      <span>{incorrect} Y</span>
                    </div>
                    <div className="flex items-center space-x-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-bold border border-indigo-100">
                      <span>{Number.isInteger(net) ? net : net.toFixed(2)} Net</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{entry.durationMinutes} dk</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto pl-6 sm:pl-0">
                <span className="text-xs text-gray-400 sm:mr-4">
                  {new Date(entry.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                <button 
                  onClick={() => onDelete(entry.id)}
                  className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 opacity-100 sm:opacity-0 group-hover:opacity-100 transition duration-200"
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
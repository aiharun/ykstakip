import React, { useState } from 'react';
import { StudyEntry } from '../types';
import { getStudyAdvice } from '../services/geminiService';
import { Brain, Sparkles, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AICoachProps {
  entries: StudyEntry[];
}

export const AICoach: React.FC<AICoachProps> = ({ entries }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGetAdvice = async () => {
    setLoading(true);
    const result = await getStudyAdvice(entries);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl shadow-lg text-white p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-32 h-32 bg-purple-500 opacity-20 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold">YKS Koçum (AI)</h3>
              <p className="text-indigo-100 text-xs opacity-80">Gemini Destekli Analiz</p>
            </div>
          </div>
          
          <button 
            onClick={handleGetAdvice}
            disabled={loading}
            className={`flex items-center space-x-2 px-4 py-2 bg-white text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-50 transition-all shadow-md ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{loading ? 'Analiz Ediliyor...' : 'Tavsiye Al'}</span>
          </button>
        </div>

        {advice && (
          <div className="mt-4 bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20 animate-fade-in">
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{advice}</ReactMarkdown>
            </div>
          </div>
        )}

        {!advice && (
          <p className="text-sm text-indigo-100 mt-2 opacity-90">
            Son çalışmalarını analiz etmem ve sana özel çalışma stratejileri oluşturmam için yukarıdaki butona tıkla.
          </p>
        )}
      </div>
    </div>
  );
};

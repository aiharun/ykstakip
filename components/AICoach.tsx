import React, { useState } from 'react';
import { StudyEntry } from '../types';
import { getStudyAdvice, getWeeklyPlan, getPerformanceAnalysis } from '../services/geminiService';
import { Brain, Sparkles, RefreshCw, CalendarDays, BarChart3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AICoachProps {
  entries: StudyEntry[];
}

type AITab = 'advice' | 'weekly' | 'analysis';

export const AICoach: React.FC<AICoachProps> = ({ entries }) => {
  const [activeTab, setActiveTab] = useState<AITab>('advice');
  const [advice, setAdvice] = useState<string | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAction = async () => {
    setLoading(true);
    try {
      if (activeTab === 'advice') {
        const result = await getStudyAdvice(entries);
        setAdvice(result);
      } else if (activeTab === 'weekly') {
        const result = await getWeeklyPlan(entries);
        setWeeklyPlan(result);
      } else {
        const result = await getPerformanceAnalysis(entries);
        setAnalysis(result);
      }
    } finally {
      setLoading(false);
    }
  };

  const currentContent = activeTab === 'advice' ? advice : activeTab === 'weekly' ? weeklyPlan : analysis;
  const tabs: { id: AITab; label: string; icon: React.ReactNode }[] = [
    { id: 'advice', label: 'Tavsiye', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'weekly', label: 'Haftalık Plan', icon: <CalendarDays className="w-3.5 h-3.5" /> },
    { id: 'analysis', label: 'Analiz', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  ];

  const buttonLabels: Record<AITab, { loading: string; idle: string }> = {
    advice: { loading: 'Analiz Ediliyor...', idle: 'Tavsiye Al' },
    weekly: { loading: 'Plan Oluşturuluyor...', idle: 'Plan Oluştur' },
    analysis: { loading: 'Analiz Ediliyor...', idle: 'Analiz Et' },
  };

  return (
    <div className="relative overflow-hidden rounded-2xl animate-fade-in-up">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 via-violet-600/80 to-purple-700/80"></div>
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-40 h-40 bg-white opacity-[0.06] rounded-full blur-3xl animate-pulse-glow pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-40 h-40 bg-purple-400 opacity-[0.08] rounded-full blur-3xl animate-pulse-glow pointer-events-none" style={{ animationDelay: '1.5s' }}></div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-sm border border-white/10">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">YKS Koçum (AI)</h3>
              <p className="text-indigo-200/70 text-xs">Gemini Destekli Analiz</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-white/20 text-white border border-white/20 shadow-lg'
                  : 'text-white/60 hover:text-white/90 hover:bg-white/10 border border-transparent'
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={handleAction}
          disabled={loading}
          className={`w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-white/15 hover:bg-white/20 backdrop-blur-sm text-white rounded-xl text-sm font-semibold transition-all duration-200 border border-white/10 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {loading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          <span>{loading ? buttonLabels[activeTab].loading : buttonLabels[activeTab].idle}</span>
        </button>

        {/* Content */}
        {currentContent && (
          <div className="mt-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 animate-fade-in">
            <div className="prose prose-invert prose-sm max-w-none [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_p]:text-indigo-100/90 [&_li]:text-indigo-100/90 [&_strong]:text-white">
              <ReactMarkdown>{currentContent}</ReactMarkdown>
            </div>
          </div>
        )}

        {!currentContent && (
          <p className="text-sm text-indigo-200/60 mt-3">
            {activeTab === 'advice' && 'Son çalışmalarını analiz edip sana özel stratejiler oluşturayım.'}
            {activeTab === 'weekly' && 'Verilerine göre kişiselleştirilmiş 7 günlük çalışma planı oluşturayım.'}
            {activeTab === 'analysis' && 'Güçlü ve zayıf yönlerini analiz edip detaylı rapor hazırlayayım.'}
          </p>
        )}
      </div>
    </div>
  );
};

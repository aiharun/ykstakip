import React, { useState, useEffect } from 'react';
import { Subject, StudyEntry } from '../types';
import { PlusCircle, Save, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

interface AddEntryFormProps {
  onAdd: (entry: Omit<StudyEntry, 'id' | 'date'>) => void;
}

export const AddEntryForm: React.FC<AddEntryFormProps> = ({ onAdd }) => {
  const [subject, setSubject] = useState<Subject>(Subject.MATEMATIK);
  const [topic, setTopic] = useState('');
  const [correctCount, setCorrectCount] = useState<number | ''>('');
  const [incorrectCount, setIncorrectCount] = useState<number | ''>('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>('');
  const [calculatedNet, setCalculatedNet] = useState<number>(0);
  const [isExpanded, setIsExpanded] = useState(true);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    const c = Number(correctCount) || 0;
    const i = Number(incorrectCount) || 0;
    setCalculatedNet(c - (i / 4));
  }, [correctCount, incorrectCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic || correctCount === '' || incorrectCount === '' || durationMinutes === '') return;

    const c = Number(correctCount);
    const i = Number(incorrectCount);

    onAdd({
      subject,
      topic,
      correctCount: c,
      incorrectCount: i,
      questionCount: c + i,
      durationMinutes: Number(durationMinutes),
    });

    setTopic('');
    setCorrectCount('');
    setIncorrectCount('');
    setDurationMinutes('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  return (
    <div className="glass gradient-border animate-fade-in-up">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500/15 rounded-xl">
            <PlusCircle className="w-5 h-5 text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Yeni Çalışma Ekle</h2>
        </div>
        <div className="flex items-center gap-3">
          {(correctCount !== '' || incorrectCount !== '') && (
            <div className="text-sm font-medium px-3 py-1 bg-indigo-500/15 text-indigo-300 rounded-full border border-indigo-500/20">
              <span className="font-bold">{calculatedNet.toFixed(2)} Net</span>
            </div>
          )}
          {justSaved && (
            <div className="text-sm font-medium px-3 py-1 bg-emerald-500/15 text-emerald-300 rounded-full border border-emerald-500/20 animate-fade-in">
              ✓ Kaydedildi
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Form */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 animate-slide-down">

          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Ders</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as Subject)}
              className="w-full px-3 py-2.5 dark-input"
            >
              {Object.values(Subject).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Konu</label>
            <input
              type="text"
              placeholder="Örn: Fonksiyonlar"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-3 py-2.5 dark-input"
              required
            />
          </div>

          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-emerald-400 mb-1.5 flex items-center gap-1">
              <Check className="w-3 h-3" /> Doğru
            </label>
            <input
              type="number"
              placeholder="0"
              min="0"
              value={correctCount}
              onChange={(e) => setCorrectCount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2.5 dark-input focus:border-emerald-500 focus:shadow-[0_0_0_3px_rgba(52,211,153,0.15)]"
              required
            />
          </div>

          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-rose-400 mb-1.5 flex items-center gap-1">
              <X className="w-3 h-3" /> Yanlış
            </label>
            <input
              type="number"
              placeholder="0"
              min="0"
              value={incorrectCount}
              onChange={(e) => setIncorrectCount(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2.5 dark-input focus:border-rose-500 focus:shadow-[0_0_0_3px_rgba(251,113,133,0.15)]"
              required
            />
          </div>

          <div className="lg:col-span-1">
            <label className="block text-sm font-medium text-gray-400 mb-1.5">Süre (dk)</label>
            <input
              type="number"
              placeholder="0"
              min="0"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full px-3 py-2.5 dark-input"
              required
            />
          </div>

          <div className="lg:col-span-6 flex justify-end mt-2">
            <button
              type="submit"
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-2.5 px-8 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:scale-[1.02] btn-shine"
            >
              <Save className="w-4 h-4" />
              <span>Kaydet</span>
            </button>
          </div>

        </form>
      )}
    </div>
  );
};
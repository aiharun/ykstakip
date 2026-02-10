import React, { useState, useEffect } from 'react';
import { Subject, StudyEntry } from '../types';
import { PlusCircle, Save, Check, X } from 'lucide-react';

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

  // Auto calculate Net for preview
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
      questionCount: c + i, // Total solved
      durationMinutes: Number(durationMinutes),
    });

    // Reset form
    setTopic('');
    setCorrectCount('');
    setIncorrectCount('');
    setDurationMinutes('');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <PlusCircle className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-semibold text-gray-800">Yeni Çalışma Ekle</h2>
        </div>
        {(correctCount !== '' || incorrectCount !== '') && (
          <div className="text-sm font-medium px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
            Hesaplanan: <span className="font-bold">{calculatedNet.toFixed(2)} Net</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        
        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Ders</label>
          <select 
            value={subject} 
            onChange={(e) => setSubject(e.target.value as Subject)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {Object.values(Subject).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Konu</label>
          <input 
            type="text" 
            placeholder="Örn: Fonksiyonlar"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 text-green-700">
            <Check className="w-3 h-3" /> Doğru
          </label>
          <input 
            type="number" 
            placeholder="0"
            min="0"
            value={correctCount}
            onChange={(e) => setCorrectCount(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-green-50/30"
            required
          />
        </div>

        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1 text-red-700">
             <X className="w-3 h-3" /> Yanlış
          </label>
          <input 
            type="number" 
            placeholder="0"
            min="0"
            value={incorrectCount}
            onChange={(e) => setIncorrectCount(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-red-50/30"
            required
          />
        </div>

        <div className="lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Süre (dk)</label>
          <input 
            type="number" 
            placeholder="0"
            min="0"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <div className="lg:col-span-6 flex justify-end mt-2">
          <button 
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-8 rounded-lg transition duration-200 flex items-center justify-center space-x-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Kaydet</span>
          </button>
        </div>

      </form>
    </div>
  );
};
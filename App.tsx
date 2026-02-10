import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StudyEntry } from './types';
import { AddEntryForm } from './components/AddEntryForm';
import { ActivityLog } from './components/ActivityLog';
import { StatsCard } from './components/StatsCard';
import { Charts } from './components/Charts';
import { AICoach } from './components/AICoach';
import { BookOpen, CheckCircle, Clock, GraduationCap, Target, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, TABLE_NAME } from './services/supabase';

const App: React.FC = () => {
  const [entries, setEntries] = useState<StudyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from Supabase
  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
        // Map Supabase (snake_case) columns back to App (camelCase) types
        const mappedEntries: StudyEntry[] = data.map((item: any) => ({
          id: item.id,
          date: item.date,
          subject: item.subject,
          topic: item.topic,
          questionCount: item.question_count,
          correctCount: item.correct_count,
          incorrectCount: item.incorrect_count,
          durationMinutes: item.duration_minutes
        }));
        setEntries(mappedEntries);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError("Veriler yüklenirken bir hata oluştu. Lütfen Supabase ayarlarını kontrol et.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleAddEntry = async (newEntry: Omit<StudyEntry, 'id' | 'date'>) => {
    const id = uuidv4();
    const date = new Date().toISOString();
    
    // Optimistic UI update
    const entry: StudyEntry = { id, date, ...newEntry };
    setEntries(prev => [entry, ...prev]);

    try {
      // Map App (camelCase) types to Supabase (snake_case) columns
      const { error } = await supabase.from(TABLE_NAME).insert([{
        id: id,
        date: date,
        subject: newEntry.subject,
        topic: newEntry.topic,
        question_count: newEntry.questionCount,
        correct_count: newEntry.correctCount,
        incorrect_count: newEntry.incorrectCount,
        duration_minutes: newEntry.durationMinutes
      }]);

      if (error) throw error;
    } catch (err) {
      console.error("Error adding entry:", err);
      alert("Kayıt veritabanına eklenemedi.");
      // Rollback optimistic update
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm("Bu kaydı silmek istediğine emin misin?")) {
      // Optimistic UI update
      const previousEntries = [...entries];
      setEntries(prev => prev.filter(e => e.id !== id));

      try {
        const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error("Error deleting entry:", err);
        alert("Kayıt silinemedi.");
        // Rollback
        setEntries(previousEntries);
      }
    }
  };

  // Calculate stats
  const calculateNet = (entry: StudyEntry) => {
    const correct = entry.correctCount ?? entry.questionCount;
    const incorrect = entry.incorrectCount ?? 0;
    return correct - (incorrect / 4);
  };

  const today = new Date().toISOString().split('T')[0];
  const todaysEntries = entries.filter(e => e.date.startsWith(today));
  
  const dailyQuestions = todaysEntries.reduce((acc, curr) => acc + curr.questionCount, 0);
  const dailyNet = todaysEntries.reduce((acc, curr) => acc + calculateNet(curr), 0);
  const dailyMinutes = todaysEntries.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalNet = entries.reduce((acc, curr) => acc + calculateNet(curr), 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">YKS Pro</h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            Bugün: {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <p>Veriler Supabase üzerinden yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-700 flex flex-col items-center">
            <AlertCircle className="w-10 h-10 mb-2" />
            <p className="font-semibold">Bağlantı Hatası</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <>
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatsCard 
                title="Bugün Çözülen / Net" 
                value={`${dailyQuestions} Soru`} 
                icon={CheckCircle} 
                colorClass="text-emerald-600 bg-emerald-600"
                trend={`${dailyNet.toFixed(2)} Net`}
              />
              <StatsCard 
                title="Bugün Çalışılan Süre" 
                value={`${Math.floor(dailyMinutes / 60)}s ${dailyMinutes % 60}dk`} 
                icon={Clock} 
                colorClass="text-blue-600 bg-blue-600"
              />
              <StatsCard 
                title="Toplam Net" 
                value={totalNet.toFixed(2)} 
                icon={Target} 
                colorClass="text-violet-600 bg-violet-600"
                trend={`${entries.length} Kayıt`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content Area (Left 2/3) */}
              <div className="lg:col-span-2 space-y-8">
                 <AddEntryForm onAdd={handleAddEntry} />
                 <Charts entries={entries} />
                 <ActivityLog entries={entries} onDelete={handleDeleteEntry} />
              </div>

              {/* Sidebar Area (Right 1/3) */}
              <div className="lg:col-span-1 space-y-6">
                <AICoach entries={entries} />
                
                {/* Mini Motivation Card */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <h4 className="font-semibold text-gray-800 mb-2">Günün Sözü</h4>
                  <p className="text-gray-600 italic text-sm">
                    "Yanlışların, doğrulara giden yoldaki basamaklardır. Her hatadan bir ders çıkar."
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default App;
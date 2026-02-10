import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StudyEntry } from './types';
import { AddEntryForm } from './components/AddEntryForm';
import { ActivityLog } from './components/ActivityLog';
import { StatsCard } from './components/StatsCard';
import { Charts } from './components/Charts';
import { AICoach } from './components/AICoach';
import { ExamCountdown } from './components/ExamCountdown';
import { PomodoroTimer } from './components/PomodoroTimer';
import { DenemeTracker } from './components/DenemeTracker';
import { BookOpen, CheckCircle, Clock, GraduationCap, Target, AlertCircle, Loader2, LayoutDashboard, ClipboardList, Timer } from 'lucide-react';
import { supabase, TABLE_NAME } from './services/supabase';

type TabType = 'dashboard' | 'deneme' | 'pomodoro';

const App: React.FC = () => {
  const [entries, setEntries] = useState<StudyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from(TABLE_NAME)
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      if (data) {
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

    const entry: StudyEntry = { id, date, ...newEntry };
    setEntries(prev => [entry, ...prev]);

    try {
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
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (window.confirm("Bu kaydı silmek istediğine emin misin?")) {
      const previousEntries = [...entries];
      setEntries(prev => prev.filter(e => e.id !== id));

      try {
        const { error } = await supabase.from(TABLE_NAME).delete().eq('id', id);
        if (error) throw error;
      } catch (err) {
        console.error("Error deleting entry:", err);
        alert("Kayıt silinemedi.");
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

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'deneme', label: 'Deneme Takibi', icon: <ClipboardList className="w-4 h-4" /> },
    { id: 'pomodoro', label: 'Pomodoro', icon: <Timer className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="glass border-b border-white/5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text tracking-tight">YKS Pro</h1>
            </div>
          </div>

          {/* Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-btn flex items-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>

          <div className="text-sm text-gray-500 hidden sm:block">
            {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden px-4 pb-3 flex gap-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'active' : ''}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
            <p className="text-gray-400">Veriler Supabase üzerinden yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="glass gradient-border p-6 text-center text-rose-400 flex flex-col items-center">
            <AlertCircle className="w-10 h-10 mb-2" />
            <p className="font-semibold">Bağlantı Hatası</p>
            <p className="text-sm text-gray-400 mt-1">{error}</p>
          </div>
        ) : (
          <>
            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="animate-fade-in">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 stagger">
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
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-8">
                    <AddEntryForm onAdd={handleAddEntry} />
                    <Charts entries={entries} />
                    <ActivityLog entries={entries} onDelete={handleDeleteEntry} />
                  </div>

                  {/* Sidebar */}
                  <div className="lg:col-span-1 space-y-6">
                    <ExamCountdown />
                    <AICoach entries={entries} />

                    {/* Motivation Card */}
                    <div className="glass gradient-border p-5">
                      <h4 className="font-semibold text-white mb-2 text-sm">✨ Günün Sözü</h4>
                      <p className="text-gray-400 italic text-sm leading-relaxed">
                        "Yanlışların, doğrulara giden yoldaki basamaklardır. Her hatadan bir ders çıkar."
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Deneme Tab */}
            {activeTab === 'deneme' && (
              <div className="max-w-4xl mx-auto animate-fade-in">
                <DenemeTracker />
              </div>
            )}

            {/* Pomodoro Tab */}
            {activeTab === 'pomodoro' && (
              <div className="max-w-md mx-auto animate-fade-in">
                <PomodoroTimer />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;
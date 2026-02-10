import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Timer,
  GraduationCap,
  Target,
  Clock,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { AddEntryForm } from './components/AddEntryForm';
import { ActivityLog } from './components/ActivityLog';
import { Charts } from './components/Charts';
import { AICoach } from './components/AICoach';
import { ExamCountdown } from './components/ExamCountdown';
import { PomodoroTimer } from './components/PomodoroTimer';
import { DenemeTracker } from './components/DenemeTracker';
import { StudyEntry } from './types';
import { supabase, STUDY_TABLE_NAME } from './services/supabase';

type TabType = 'dashboard' | 'deneme' | 'pomodoro';

function GradientIcon({ icon: Icon, color }: { icon: any, color: string }) {
  const colors: Record<string, string> = {
    blue: 'from-blue-500 to-cyan-500',
    emerald: 'from-emerald-500 to-teal-500',
    violet: 'from-violet-500 to-purple-500',
    amber: 'from-amber-500 to-orange-500',
  };

  return (
    <div className={`p-2 rounded-lg bg-gradient-to-br ${colors[color]} bg-opacity-10`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [entries, setEntries] = useState<StudyEntry[]>([]);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    const { data, error } = await supabase
      .from(STUDY_TABLE_NAME)
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching entries:', error);
      return;
    }
    setEntries(data || []);
  }

  async function addEntry(newEntry: Omit<StudyEntry, 'id'>) {
    const { data, error } = await supabase
      .from(STUDY_TABLE_NAME)
      .insert([newEntry])
      .select();

    if (error) {
      console.error('Error adding entry:', error);
      return;
    }
    if (data) setEntries([data[0], ...entries]);
  }

  async function deleteEntry(id: string) {
    const { error } = await supabase
      .from(STUDY_TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting entry:', error);
      return;
    }
    setEntries(entries.filter(e => e.id !== id));
  }

  const handleStudySession = (minutes: number) => {
    // Optional: Auto-add entry or just notify
    console.log(`Study session completed: ${minutes} minutes`);
  };

  const calculateNet = (entry: StudyEntry) => entry.correct - (entry.incorrect / 4);

  const todaysEntries = entries.filter(e => {
    const today = new Date().toISOString().split('T')[0];
    return e.date === today;
  });

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
    <div className="min-h-screen pb-20 md:pb-0">
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

          {/* Desktop Tabs */}
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
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:pb-8 pb-20">
        {/* Exam Countdown Widget (Global) */}
        {activeTab !== 'pomodoro' && (
          <div className="mb-8">
            <ExamCountdown />
          </div>
        )}

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger">
                <StatsCard title="Günlük Soru" value={dailyQuestions} icon={<GradientIcon icon={HelpCircle} color="blue" />} trend={12} />
                <StatsCard title="Günlük Net" value={dailyNet.toFixed(2)} icon={<GradientIcon icon={Target} color="emerald" />} trend={5} />
                <StatsCard title="Çalışma Süresi" value={`${dailyMinutes} dk`} icon={<GradientIcon icon={Clock} color="violet" />} trend={8} />
                <StatsCard title="Toplam Net" value={totalNet.toFixed(2)} icon={<GradientIcon icon={TrendingUp} color="amber" />} trend={15} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <AddEntryForm onAdd={addEntry} />
                  <Charts entries={entries} />
                  <ActivityLog entries={entries} onDelete={deleteEntry} />
                </div>
                <div className="space-y-8">
                  <AICoach entries={entries} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deneme' && <DenemeTracker />}
          {activeTab === 'pomodoro' && <PomodoroTimer onSessionComplete={handleStudySession} />}
        </div>
      </main>

      {/* Mobile Fixed Bottom Navigation */}
      <div className="md:hidden fixed bottom-6 left-4 right-4 z-50 glass border border-white/10 px-6 py-4 flex justify-around items-center rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === tab.id
                ? 'text-indigo-400 scale-110'
                : 'text-gray-500'
              }`}
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${activeTab === tab.id ? 'bg-indigo-500/15 shadow-inner shadow-indigo-500/10' : ''
              }`}>
              {React.cloneElement(tab.icon as React.ReactElement, {
                className: `w-6 h-6 ${activeTab === tab.id ? 'text-indigo-400' : 'text-gray-500'}`
              })}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{tab.id === 'dashboard' ? 'Ana' : tab.label.split(' ')[0]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { DenemeEntry, SubjectScore } from '../types';
import { supabase, DENEME_TABLE_NAME } from '../services/supabase';
import { v4 as uuidv4 } from 'uuid';
import { ClipboardList, Save, TrendingUp, Check, X, Trash2, Loader2 } from 'lucide-react';

const TYT_SUBJECTS = [
    { key: 'turkce', label: 'Türkçe', max: 40, group: 'TYT' },
    { key: 'sosyal', label: 'Sosyal Bilimler', max: 20, group: 'TYT' },
    { key: 'matematik', label: 'Temel Matematik', max: 40, group: 'TYT' },
    { key: 'fen', label: 'Fen Bilimleri', max: 20, group: 'TYT' },
];

const AYT_SUBJECTS = [
    // Sayısal
    { key: 'matematik_ayt', label: 'Matematik', max: 40, group: 'Sayısal' },
    { key: 'fizik', label: 'Fizik', max: 14, group: 'Sayısal' },
    { key: 'kimya', label: 'Kimya', max: 13, group: 'Sayısal' },
    { key: 'biyoloji', label: 'Biyoloji', max: 13, group: 'Sayısal' },
    // Sözel / EA
    { key: 'edebiyat', label: 'Türk Dili ve Edebiyatı', max: 24, group: 'Sözel / EA' },
    { key: 'tarih1', label: 'Tarih-1', max: 10, group: 'Sözel / EA' },
    { key: 'cografya1', label: 'Coğrafya-1', max: 6, group: 'Sözel / EA' },
    // Sözel
    { key: 'tarih2', label: 'Tarih-2', max: 11, group: 'Sözel' },
    { key: 'cografya2', label: 'Coğrafya-2', max: 11, group: 'Sözel' },
    { key: 'felsefe', label: 'Felsefe Grubu', max: 12, group: 'Sözel' },
];

type ExamType = 'TYT' | 'AYT';

export const DenemeTracker: React.FC = () => {
    const [examType, setExamType] = useState<ExamType>('TYT');
    const [scores, setScores] = useState<Record<string, SubjectScore>>({});
    const [savedExams, setSavedExams] = useState<DenemeEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const subjects = examType === 'TYT' ? TYT_SUBJECTS : AYT_SUBJECTS;

    // Fetch from Supabase
    const fetchExams = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from(DENEME_TABLE_NAME)
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const mapped: DenemeEntry[] = data.map((item: any) => ({
                    id: item.id,
                    exam_type: item.exam_type,
                    scores: typeof item.scores === 'string' ? JSON.parse(item.scores) : item.scores,
                    total_net: item.total_net,
                    created_at: item.created_at,
                }));
                setSavedExams(mapped);
            }
        } catch (err) {
            console.error('Error fetching deneme results:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExams();
    }, []);

    const getScore = (key: string): SubjectScore => scores[key] || { correct: 0, incorrect: 0 };
    const calcNet = (s: SubjectScore) => s.correct - (s.incorrect / 4);

    const updateScore = (key: string, field: 'correct' | 'incorrect', value: number) => {
        setScores(prev => ({
            ...prev,
            [key]: { ...getScore(key), [field]: Math.max(0, value) }
        }));
    };

    const totalNet = subjects.reduce((sum, s) => sum + calcNet(getScore(s.key)), 0);

    const handleSave = async () => {
        if (Object.keys(scores).length === 0) return;

        const id = uuidv4();
        const created_at = new Date().toISOString();
        const entry: DenemeEntry = {
            id,
            exam_type: examType,
            scores: { ...scores },
            total_net: totalNet,
            created_at,
        };

        setSavedExams(prev => [entry, ...prev]);
        setScores({});
        setSaving(true);

        try {
            const { error } = await supabase.from(DENEME_TABLE_NAME).insert([{
                id,
                exam_type: examType,
                scores: scores,
                total_net: totalNet,
                created_at,
            }]);

            if (error) throw error;
        } catch (err) {
            console.error('Error saving deneme:', err);
            alert('Deneme kaydedilemedi.');
            setSavedExams(prev => prev.filter(e => e.id !== id));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Bu denemeyi silmek istediğine emin misin?')) return;

        const previousExams = [...savedExams];
        setSavedExams(prev => prev.filter(e => e.id !== id));

        try {
            const { error } = await supabase.from(DENEME_TABLE_NAME).delete().eq('id', id);
            if (error) throw error;
        } catch (err) {
            console.error('Error deleting deneme:', err);
            alert('Deneme silinemedi.');
            setSavedExams(previousExams);
        }
    };

    const getGroupColor = (group: string) => {
        switch (group) {
            case 'TYT': return 'indigo';
            case 'Sayısal': return 'blue';
            case 'Sözel / EA': return 'amber';
            case 'Sözel': return 'rose';
            default: return 'gray';
        }
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Header & Mode Switcher */}
            <div className="glass gradient-border p-6 animate-fade-in-up">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-violet-500/15 rounded-2xl">
                            <ClipboardList className="w-6 h-6 text-violet-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Deneme Takibi</h2>
                            <p className="text-sm text-gray-400">Netlerini takip et, gelişimini izle.</p>
                        </div>
                    </div>

                    <div className="flex p-1 bg-white/5 rounded-2xl border border-white/5">
                        {(['TYT', 'AYT'] as ExamType[]).map(type => (
                            <button
                                key={type}
                                onClick={() => { setExamType(type); setScores({}); }}
                                className={`px-8 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${examType === type
                                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Individual Subject Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 stagger">
                {subjects.map((subject, idx) => {
                    const score = getScore(subject.key);
                    const net = calcNet(score);
                    const groupColor = getGroupColor(subject.group || '');

                    return (
                        <div key={subject.key} className="glass gradient-border flex flex-col animate-fade-in-up"
                            style={{ animationDelay: `${idx * 50}ms` }}>
                            <div className={`px-4 py-2 border-b border-white/5 bg-${groupColor}-500/5 flex justify-between items-center`}>
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${groupColor === 'indigo' ? 'text-indigo-400' :
                                    groupColor === 'blue' ? 'text-blue-400' :
                                        groupColor === 'amber' ? 'text-amber-400' :
                                            groupColor === 'rose' ? 'text-rose-400' : 'text-gray-400'
                                    }`}>
                                    {subject.group}
                                </span>
                                <span className="text-[10px] text-white/30 font-medium">Max {subject.max} Soru</span>
                            </div>

                            <div className="p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-white/90 truncate mr-2" title={subject.label}>
                                        {subject.label}
                                    </h3>
                                    <div className={`px-2 py-0.5 rounded-lg text-xs font-black ${net > 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-gray-500'
                                        }`}>
                                        {net.toFixed(2)}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="relative">
                                        <Check className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500/50" />
                                        <input
                                            type="number"
                                            min="0"
                                            max={subject.max}
                                            value={score.correct || ''}
                                            placeholder="D"
                                            onChange={(e) => updateScore(subject.key, 'correct', parseInt(e.target.value) || 0)}
                                            className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:border-emerald-500/50 focus:bg-white/10 transition-all outline-none"
                                        />
                                    </div>
                                    <div className="relative">
                                        <X className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rose-500/50" />
                                        <input
                                            type="number"
                                            min="0"
                                            max={subject.max}
                                            value={score.incorrect || ''}
                                            placeholder="Y"
                                            onChange={(e) => updateScore(subject.key, 'incorrect', parseInt(e.target.value) || 0)}
                                            className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder:text-gray-600 focus:border-rose-500/50 focus:bg-white/10 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Action Footer */}
            <div className="glass gradient-border p-6 flex flex-col sm:flex-row items-center justify-between gap-6 animate-fade-in-up">
                <div className="flex items-center gap-6">
                    <div className="text-center sm:text-left">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Toplam Net</p>
                        <p className={`text-4xl font-extrabold tracking-tight ${totalNet > 0 ? 'text-emerald-400' : 'text-white'
                            }`}>
                            {totalNet.toFixed(2)}
                        </p>
                    </div>
                    <div className="h-10 w-px bg-white/10 hidden sm:block" />
                    <div className="hidden sm:block">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Sınav Türü</p>
                        <p className="text-xl font-bold text-indigo-400">{examType}</p>
                    </div>
                    <div className="h-10 w-px bg-white/10 hidden lg:block" />
                    <div className="hidden lg:block">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Aktif Dersler</p>
                        <p className="text-xl font-bold text-white/80">
                            {Object.keys(scores).length} / {subjects.length}
                        </p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving || Object.keys(scores).length === 0}
                    className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed btn-shine"
                >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    <span>Denemeyi Kaydet</span>
                </button>
            </div>

            {/* History Section */}
            <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                <div className="flex items-center gap-2 mb-6 px-2">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-bold text-white">Deneme Geçmişi</h3>
                    <span className="ml-auto text-xs font-medium text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        {savedExams.length} Kayıtlı Sınav
                    </span>
                </div>

                {loading ? (
                    <div className="glass p-12 flex flex-col items-center justify-center gap-4 text-gray-500">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-400" />
                        <p className="text-sm font-medium">Veriler yükleniyor...</p>
                    </div>
                ) : savedExams.length === 0 ? (
                    <div className="glass p-12 flex flex-col items-center justify-center text-center space-y-3">
                        <div className="p-4 bg-white/5 rounded-full">
                            <ClipboardList className="w-10 h-10 text-gray-600" />
                        </div>
                        <p className="text-gray-400 font-medium">Henüz kayıtlı deneme bulunmuyor.</p>
                        <p className="text-xs text-gray-600">İlk denemeni yukarıdan eklemeye başlayabilirsin.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {savedExams.map((exam) => (
                            <div key={exam.id} className="glass p-5 hover:bg-white/[0.04] transition-all group border border-white/5 hover:border-white/10 rounded-2xl">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider ${exam.exam_type === 'TYT'
                                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                                            : 'bg-violet-500/20 text-violet-300 border border-violet-500/20'
                                            }`}>
                                            {exam.exam_type}
                                        </span>
                                        <span className="text-xs text-gray-500 font-medium">
                                            {new Date(exam.created_at).toLocaleDateString('tr-TR', {
                                                day: 'numeric', month: 'long', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`text-xl font-black ${exam.total_net > 0 ? 'text-emerald-400' : 'text-white'
                                            }`}>
                                            {exam.total_net.toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => handleDelete(exam.id)}
                                            className="p-2 text-gray-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(exam.scores).map(([key, sc]) => {
                                        const net = sc.correct - (sc.incorrect / 4);
                                        if (net === 0 && sc.correct === 0 && sc.incorrect === 0) return null;

                                        // Find label
                                        const label = [...TYT_SUBJECTS, ...AYT_SUBJECTS].find(s => s.key === key)?.label || key;

                                        return (
                                            <div key={key} className="flex flex-col px-3 py-1.5 bg-white/[0.03] rounded-xl border border-white/5">
                                                <span className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter mb-0.5">{label}</span>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10px] text-emerald-500 font-bold">{sc.correct}D</span>
                                                        <span className="text-[10px] text-rose-500 font-bold">{sc.incorrect}Y</span>
                                                    </div>
                                                    <div className="w-px h-2.5 bg-white/10" />
                                                    <span className={`text-[11px] font-black ${net > 0 ? 'text-white' : 'text-gray-500'}`}>
                                                        {net.toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

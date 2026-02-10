import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen, Settings, Maximize2, Minimize2, X } from 'lucide-react';

interface PomodoroTimerProps {
    onSessionComplete?: (minutes: number) => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onSessionComplete }) => {
    const [focusMinutes, setFocusMinutes] = useState(25);
    const [breakMinutes, setBreakMinutes] = useState(5);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [sessions, setSessions] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const totalSeconds = isBreak ? breakMinutes * 60 : focusMinutes * 60;
    const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const circumference = 2 * Math.PI * 90;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    // Fullscreen ring values (larger)
    const fsRadius = 140;
    const fsCircumference = 2 * Math.PI * fsRadius;
    const fsStrokeDashoffset = fsCircumference - (progress / 100) * fsCircumference;

    const playNotification = useCallback(() => {
        try {
            const ctx = new AudioContext();
            const oscillator = ctx.createOscillator();
            const gain = ctx.createGain();
            oscillator.connect(gain);
            gain.connect(ctx.destination);
            oscillator.frequency.value = isBreak ? 523 : 440;
            oscillator.type = 'sine';
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1);
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 1);
        } catch { }
    }, [isBreak]);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            playNotification();
            if (isBreak) {
                setIsBreak(false);
                setTimeLeft(focusMinutes * 60);
            } else {
                setSessions(prev => prev + 1);
                if (onSessionComplete) onSessionComplete(focusMinutes);
                setIsBreak(true);
                setTimeLeft(breakMinutes * 60);
            }
            setIsRunning(false);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, timeLeft, isBreak, focusMinutes, breakMinutes, onSessionComplete, playNotification]);

    // Native browser fullscreen API helpers
    const enterFullscreen = () => {
        setIsFullscreen(true);
        document.documentElement.requestFullscreen?.().catch(() => { });
    };

    const exitFullscreen = () => {
        setIsFullscreen(false);
        if (document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => { });
        }
    };

    // Sync state when browser exits fullscreen (e.g. user presses F11 or browser ESC)
    useEffect(() => {
        const onFsChange = () => {
            if (!document.fullscreenElement) setIsFullscreen(false);
        };
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    // Keyboard shortcuts in fullscreen
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === ' ' && isFullscreen) { e.preventDefault(); setIsRunning(r => !r); }
        };
        window.addEventListener('keydown', handleKey);
        return () => window.removeEventListener('keydown', handleKey);
    }, [isFullscreen]);

    const reset = () => {
        setIsRunning(false);
        setIsBreak(false);
        setTimeLeft(focusMinutes * 60);
        if (intervalRef.current) clearInterval(intervalRef.current);
    };

    const applySettings = (focus: number, brk: number) => {
        setFocusMinutes(focus);
        setBreakMinutes(brk);
        setTimeLeft(focus * 60);
        setIsRunning(false);
        setIsBreak(false);
        setShowSettings(false);
    };

    // Motivational messages for fullscreen
    const motivationalMessage = () => {
        if (isBreak) return "Dinlen, enerjini topla. Kısa bir mola her şeyi değiştirir. ☕";
        if (!isRunning && timeLeft === focusMinutes * 60) return "Hazır olduğunda başla. Her dakika seni hedefe yaklaştırır.";
        if (isRunning && progress < 25) return "İyi başladın, odaklan! 🎯";
        if (isRunning && progress < 50) return "Devam et, harika gidiyorsun! 💪";
        if (isRunning && progress < 75) return "Yarıyı geçtin, son sprint! 🔥";
        if (isRunning) return "Neredeyse bitti, biraz daha dayanabilirsin! ⚡";
        return "Odaklanmaya hazır mısın?";
    };

    // ── FULLSCREEN MODE ──
    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{
                background: isBreak
                    ? 'radial-gradient(ellipse at center, #0a2520 0%, #040f0d 50%, #000000 100%)'
                    : 'radial-gradient(ellipse at center, #0f0a2a 0%, #060415 50%, #000000 100%)',
            }}>
                {/* Ambient glow */}
                <div
                    className="absolute rounded-full blur-[120px] animate-pulse-glow pointer-events-none"
                    style={{
                        width: '400px', height: '400px',
                        background: isBreak
                            ? 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)'
                            : 'radial-gradient(circle, rgba(129,140,248,0.12) 0%, transparent 70%)',
                    }}
                />
                {/* Secondary smaller glow */}
                <div
                    className="absolute rounded-full blur-[80px] animate-pulse-glow pointer-events-none"
                    style={{
                        width: '250px', height: '250px',
                        animationDelay: '2s',
                        background: isBreak
                            ? 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)'
                            : 'radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)',
                    }}
                />

                {/* Close button */}
                <button
                    onClick={exitFullscreen}
                    className="absolute top-6 right-6 p-3 rounded-xl text-white/20 hover:text-white/60 hover:bg-white/5 transition-all duration-300"
                    title="Tam ekrandan çık (ESC)"
                >
                    <Minimize2 className="w-5 h-5" />
                </button>

                {/* Session counter top */}
                <div className="absolute top-6 left-6 flex items-center gap-2">
                    {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
                        <div key={i} className={`w-2.5 h-2.5 rounded-full ${isBreak ? 'bg-emerald-500/40' : 'bg-indigo-500/40'}`} />
                    ))}
                    {sessions > 0 && (
                        <span className="text-xs text-white/20 ml-1">{sessions} oturum</span>
                    )}
                </div>

                {/* Main content */}
                <div className="relative z-10 flex flex-col items-center animate-fade-in">
                    {/* Mode label */}
                    <div className={`flex items-center gap-2 mb-8 px-4 py-2 rounded-full border ${isBreak
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400'
                        : 'border-indigo-500/20 bg-indigo-500/5 text-indigo-400'
                        }`}>
                        {isBreak ? <Coffee className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
                        <span className="text-sm font-medium">{isBreak ? 'Mola' : 'Odaklanma'}</span>
                    </div>

                    {/* Giant timer ring */}
                    <div className="relative mb-10">
                        <svg width="320" height="320" className="pomodoro-ring">
                            {/* Background ring */}
                            <circle
                                cx="160" cy="160" r={fsRadius}
                                fill="none"
                                stroke="rgba(255,255,255,0.03)"
                                strokeWidth="4"
                            />
                            {/* Subtle tick marks */}
                            {Array.from({ length: 60 }).map((_, i) => {
                                const angle = (i * 6 - 90) * (Math.PI / 180);
                                const isMajor = i % 5 === 0;
                                const innerR = isMajor ? fsRadius - 12 : fsRadius - 6;
                                const outerR = fsRadius - 2;
                                return (
                                    <line
                                        key={i}
                                        x1={160 + innerR * Math.cos(angle)}
                                        y1={160 + innerR * Math.sin(angle)}
                                        x2={160 + outerR * Math.cos(angle)}
                                        y2={160 + outerR * Math.sin(angle)}
                                        stroke={isMajor ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)'}
                                        strokeWidth={isMajor ? 1.5 : 0.5}
                                    />
                                );
                            })}
                            {/* Progress ring */}
                            <circle
                                cx="160" cy="160" r={fsRadius}
                                fill="none"
                                stroke={isBreak ? '#34d399' : '#818cf8'}
                                strokeWidth="4"
                                strokeLinecap="round"
                                strokeDasharray={fsCircumference}
                                strokeDashoffset={fsStrokeDashoffset}
                                style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 12px ${isBreak ? 'rgba(52,211,153,0.3)' : 'rgba(129,140,248,0.3)'})` }}
                            />
                        </svg>
                        {/* Time display */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: 'rotate(0deg)' }}>
                            <span className="text-7xl font-extralight text-white tabular-nums tracking-[0.15em] select-none">
                                {String(minutes).padStart(2, '0')}
                            </span>
                            <span className={`text-lg font-light tracking-[0.3em] -mt-1 ${isBreak ? 'text-emerald-500/40' : 'text-indigo-500/40'}`}>
                                ─────
                            </span>
                            <span className="text-7xl font-extralight text-white tabular-nums tracking-[0.15em] select-none -mt-1">
                                {String(seconds).padStart(2, '0')}
                            </span>
                        </div>
                    </div>

                    {/* Motivational text */}
                    <p className="text-sm text-white/25 mb-10 text-center max-w-xs leading-relaxed font-light animate-fade-in">
                        {motivationalMessage()}
                    </p>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={reset}
                            className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] text-white/30 hover:text-white/60 transition-all duration-300 border border-white/[0.04]"
                        >
                            <RotateCcw className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setIsRunning(!isRunning)}
                            className={`px-12 py-4 rounded-2xl font-medium text-white transition-all duration-500 flex items-center gap-3 ${isRunning
                                ? 'bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08]'
                                : `border ${isBreak
                                    ? 'bg-emerald-500/10 hover:bg-emerald-500/15 border-emerald-500/20 shadow-[0_0_40px_rgba(52,211,153,0.08)]'
                                    : 'bg-indigo-500/10 hover:bg-indigo-500/15 border-indigo-500/20 shadow-[0_0_40px_rgba(129,140,248,0.08)]'
                                }`
                                }`}
                        >
                            {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                            <span className="text-sm tracking-wider">{isRunning ? 'DURDUR' : 'BAŞLAT'}</span>
                        </button>
                    </div>

                    {/* Keyboard hint */}
                    <p className="text-[10px] text-white/10 mt-8 tracking-wider">
                        SPACE başlat/durdur · ESC çık
                    </p>
                </div>
            </div>
        );
    }

    // ── NORMAL MODE ──
    return (
        <div className="glass gradient-border p-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${isBreak ? 'bg-emerald-500/15' : 'bg-indigo-500/15'}`}>
                        {isBreak ? <Coffee className="w-4 h-4 text-emerald-400" /> : <BookOpen className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <div>
                        <h4 className="font-semibold text-white text-sm">
                            {isBreak ? 'Mola Zamanı' : 'Odaklanma Zamanı'}
                        </h4>
                        <p className="text-[10px] text-gray-500">{sessions} oturum tamamlandı</p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={enterFullscreen}
                        className="text-gray-500 hover:text-indigo-400 p-1.5 rounded-lg hover:bg-white/5 transition-all"
                        title="Tam Ekran"
                    >
                        <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="text-gray-500 hover:text-gray-300 p-1.5 rounded-lg hover:bg-white/5 transition-all"
                    >
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Settings */}
            {showSettings && (
                <div className="mb-5 animate-slide-down glass p-4 rounded-xl">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Odaklanma (dk)</label>
                            <input
                                type="number"
                                min="1"
                                max="120"
                                defaultValue={focusMinutes}
                                id="focus-input"
                                className="w-full px-3 py-1.5 dark-input text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1">Mola (dk)</label>
                            <input
                                type="number"
                                min="1"
                                max="30"
                                defaultValue={breakMinutes}
                                id="break-input"
                                className="w-full px-3 py-1.5 dark-input text-sm"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const f = parseInt((document.getElementById('focus-input') as HTMLInputElement).value) || 25;
                            const b = parseInt((document.getElementById('break-input') as HTMLInputElement).value) || 5;
                            applySettings(f, b);
                        }}
                        className="w-full text-xs py-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg hover:bg-indigo-500/30 transition-all border border-indigo-500/20"
                    >
                        Uygula
                    </button>
                </div>
            )}

            {/* Timer Ring */}
            <div className="flex justify-center mb-6">
                <div className="relative">
                    <svg width="200" height="200" className="pomodoro-ring">
                        <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
                        <circle
                            cx="100" cy="100" r="90"
                            fill="none"
                            stroke={isBreak ? '#34d399' : '#818cf8'}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ transform: 'rotate(0deg)' }}>
                        <span className="text-4xl font-bold text-white tabular-nums tracking-wider">
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </span>
                        <span className={`text-xs mt-1 font-medium ${isBreak ? 'text-emerald-400' : 'text-indigo-400'}`}>
                            {isBreak ? 'Mola' : 'Odaklan'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
                <button
                    onClick={reset}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-white/5"
                >
                    <RotateCcw className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setIsRunning(!isRunning)}
                    className={`px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 flex items-center gap-2 btn-shine ${isRunning
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600 shadow-lg shadow-rose-500/20'
                        : `bg-gradient-to-r ${isBreak ? 'from-emerald-600 to-teal-600 shadow-emerald-500/20' : 'from-indigo-600 to-violet-600 shadow-indigo-500/20'} shadow-lg`
                        }`}
                >
                    {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span>{isRunning ? 'Durdur' : 'Başlat'}</span>
                </button>
                <button
                    onClick={enterFullscreen}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-indigo-400 transition-all border border-white/5"
                    title="Tam Ekran"
                >
                    <Maximize2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

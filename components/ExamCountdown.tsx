import React, { useState, useEffect } from 'react';
import { Timer, Hourglass } from 'lucide-react';

// YKS 2026 tarihi (Haziran 2026 tahmini)
const YKS_DATE = new Date('2026-06-20T10:00:00+03:00');

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export const ExamCountdown: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        const calculate = () => {
            const now = new Date().getTime();
            const diff = YKS_DATE.getTime() - now;

            if (diff <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setTimeLeft({
                days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((diff / (1000 * 60)) % 60),
                seconds: Math.floor((diff / 1000) % 60),
            });
        };

        calculate();
        const interval = setInterval(calculate, 1000);
        return () => clearInterval(interval);
    }, []);

    const getMessage = () => {
        if (timeLeft.days > 180) return "Erken başlayan kazanır! 🎯";
        if (timeLeft.days > 90) return "Devamlılık her şeydir! 💪";
        if (timeLeft.days > 30) return "Son sprint'e hazır mısın? 🔥";
        if (timeLeft.days > 7) return "Her soru fark yaratır! ⚡";
        return "Sınav kapıda, sakin ol! 🧘";
    };

    const TimeBlock: React.FC<{ value: number; label: string }> = ({ value, label }) => (
        <div className="flex flex-col items-center">
            <div className="glass px-3 py-2 min-w-[52px] text-center border border-white/10">
                <span className="text-xl font-bold text-white tabular-nums">
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-medium">{label}</span>
        </div>
    );

    return (
        <div className="glass gradient-border p-5 animate-fade-in-up">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-amber-500/15 rounded-lg">
                    <Hourglass className="w-4 h-4 text-amber-400" />
                </div>
                <h4 className="font-semibold text-white text-sm">YKS 2026'ya Kalan Süre</h4>
            </div>

            <div className="flex items-center justify-center gap-2 mb-3">
                <TimeBlock value={timeLeft.days} label="Gün" />
                <span className="text-gray-500 text-lg font-light mt-[-16px]">:</span>
                <TimeBlock value={timeLeft.hours} label="Saat" />
                <span className="text-gray-500 text-lg font-light mt-[-16px]">:</span>
                <TimeBlock value={timeLeft.minutes} label="Dk" />
                <span className="text-gray-500 text-lg font-light mt-[-16px]">:</span>
                <TimeBlock value={timeLeft.seconds} label="Sn" />
            </div>

            <p className="text-center text-xs text-gray-400 italic">{getMessage()}</p>
        </div>
    );
};

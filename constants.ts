import { Subject } from './types';

export const SUBJECT_COLORS: Record<Subject, string> = {
  [Subject.TURKCE]: '#ef4444', // Red
  [Subject.MATEMATIK]: '#3b82f6', // Blue
  [Subject.GEOMETRI]: '#0ea5e9', // Sky
  [Subject.FIZIK]: '#8b5cf6', // Violet
  [Subject.KIMYA]: '#10b981', // Emerald
  [Subject.BIYOLOJI]: '#22c55e', // Green
  [Subject.TARIH]: '#f59e0b', // Amber
  [Subject.COGRAFYA]: '#d97706', // Amber-dark
  [Subject.FELSEFE]: '#ec4899', // Pink
  [Subject.DIN]: '#6366f1', // Indigo
  [Subject.DIL]: '#a855f7', // Purple
};

export const MOCK_ADVICE = `Henüz yeterli veri yok. Biraz soru çözmeye başla, sana özel tavsiyeler vereceğim!`;

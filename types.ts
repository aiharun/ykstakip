export enum Subject {
  TURKCE = 'Türkçe',
  MATEMATIK = 'Matematik',
  GEOMETRI = 'Geometri',
  FIZIK = 'Fizik',
  KIMYA = 'Kimya',
  BIYOLOJI = 'Biyoloji',
  TARIH = 'Tarih',
  COGRAFYA = 'Coğrafya',
  FELSEFE = 'Felsefe',
  DIN = 'Din Kültürü',
  DIL = 'Yabancı Dil'
}

export interface StudyEntry {
  id: string;
  date: string; // ISO string
  subject: Subject;
  topic: string;
  questionCount: number; // Total solved (Correct + Incorrect)
  correctCount: number;
  incorrectCount: number;
  durationMinutes: number;
  notes?: string;
}

export interface DailyStats {
  totalQuestions: number;
  totalDuration: number;
  subjectBreakdown: { name: string; value: number }[];
}

export interface SubjectScore {
  correct: number;
  incorrect: number;
}

export interface DenemeEntry {
  id: string;
  exam_type: 'TYT' | 'AYT';
  scores: Record<string, SubjectScore>;
  total_net: number;
  created_at: string;
}
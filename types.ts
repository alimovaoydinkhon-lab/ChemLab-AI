export type Role = 'student' | 'teacher';
export type Language = 'en' | 'ru' | 'kk';

export interface ExperimentData {
  title: string;
  objective: string;
  equipment: string[];
  reagents: string[];
  steps: string[];
  safety: string[];
  errors: string[];
  initialAssembly: { name: string; x: number; y: number }[];
}

export interface CanvasItem {
  id: string;
  name: string;
  x: number;
  y: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AssemblyAnalysis {
  isCorrect: boolean;
  feedback: string;
  hints: string[];
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  EXPERIMENT = 'EXPERIMENT',
  IMAGE_LAB = 'IMAGE_LAB',
  CHAT = 'CHAT'
}
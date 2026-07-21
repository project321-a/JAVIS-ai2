export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  category: string; // e.g., 'StreamAIV', 'Honey Business', 'Life'
  projectId?: string;
}

export interface Event {
  id: string;
  title: string;
  time: string;
  date: string;
  duration: string;
  type: 'deepwork' | 'rest' | 'family' | 'meeting' | 'learning';
  completed: boolean;
}

export interface Relationship {
  id: string;
  name: string;
  role: string; // e.g., Friend, Partner, Client, Investor
  communicationFrequency: string; // e.g., "Weekly"
  lastContactDate: string;
  boundaries: string[];
  topics: string[];
  anxietyScore: number; // 1-10, how anxious does user feel before/after
  peaceScore: number; // 1-10, how peaceful does this contact make user feel
  totalChatsCount: { user: number; contact: number };
  recentTrend: string;
  timeline: { date: string; note: string; mood: string }[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  progress: number; // 0-100
  tasksCount: { total: number; completed: number };
  revenue?: number;
  expenses?: number;
  ordersCount?: number;
  inventoryCount?: number;
  suppliers?: string[];
  githubRepo?: string;
  deploymentStatus?: 'success' | 'failed' | 'building' | 'none';
}

export interface Memory {
  id: string;
  content: string;
  timestamp: string;
  category: 'idea' | 'meeting' | 'screenshot' | 'voice' | 'link' | 'lesson';
  projectLink?: string;
  tags: string[];
  summary?: string;
  attachments?: string[];
}

export interface ValueRule {
  id: string;
  title: string;
  description: string;
  priority: number; // 1-5
  enabled: boolean;
}

export interface AgentMind {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  accentColor: string;
  systemInstruction: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  ramUsage: number;
  batteryLevel: number;
  batteryStatus: string;
  networkLatency: number;
  networkQuality: string;
  tempCelsius: number;
}

export interface DecisionLog {
  id: string;
  question: string;
  options: string[];
  outcomes: Record<string, string>;
  anxieties: string;
  valueAlignment: string;
  recommendation: string;
  timestamp: string;
  chosenOption?: string;
}

export interface Briefing {
  type: 'morning' | 'evening' | 'weekly';
  date: string;
  content: string;
  mission: string;
  burnoutRisk: number; // 0-100
  focusScore: number; // 0-100
  distractionLevel: number; // 0-100
  energyScore: number; // 0-100
  mood: string;
}

export interface InnerCompassLog {
  id: string;
  userId?: string | null;
  journalText: string;
  triggerType: 'excessive_app_switching' | 'doomscrolling' | 'multitasking_loop' | 'manual';
  timestamp: string;
  dominantEmotion: string;
  valueAlignmentScore: number;
  analysis: string;
  actionStep: string;
}

export interface ProactiveBriefing {
  id: string;
  userId?: string | null;
  type: 'github' | 'calendar' | 'deployment' | 'system';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'success';
  timestamp: string;
  acknowledged: boolean;
}



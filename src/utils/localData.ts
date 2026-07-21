import { Task, Event, Relationship, Project, Memory, ValueRule, AgentMind, SystemMetrics, DecisionLog, Briefing } from '../types';

export const DEFAULT_VALUES: ValueRule[] = [
  { id: 'v1', title: 'Protect peace before chasing intense productivity', description: 'Ensure workload does not overwhelm; flag high stress and suggest delays.', priority: 5, enabled: true },
  { id: 'v2', title: 'Prioritize family and deep health commitments', description: 'Ensure dialysis, exercise, and family time blocks are protected from workspace expansion.', priority: 5, enabled: true },
  { id: 'v3', title: 'Limit project hopping / Consolidate focus', description: 'Advise sticking to current main project (StreamAIV) before initiating new startups.', priority: 4, enabled: true },
  { id: 'v4', title: 'Avoid anxious & impulsive communication', description: 'Recommend cooling-off periods before responding to stressful queries.', priority: 4, enabled: true },
  { id: 'v5', title: 'Build high long-term leverage value', description: 'Focus on finishing key deliverables rather than administrative busywork.', priority: 3, enabled: true },
];

export const DEFAULT_AGENTS: AgentMind[] = [
  {
    id: 'ceo',
    name: 'CEO Jarvis',
    role: 'Chief Strategy Officer',
    description: 'A high-level strategist optimizing for long-term values, focus allocation, and execution.',
    avatar: '🎯',
    accentColor: '#00d2ff',
    systemInstruction: 'You are CEO Jarvis, an elite strategist. You look at the big picture. You focus on prioritizing high-leverage work, protecting rest, and keeping Sam focused on completing StreamAIV before hopping to other projects.'
  },
  {
    id: 'developer',
    name: 'Dev Jarvis',
    role: 'Lead Architect',
    description: 'A pragmatic developer parsing compiler errors, deployment pipelines, and system architectures.',
    avatar: '💻',
    accentColor: '#00ff66',
    systemInstruction: 'You are Developer Jarvis. You analyze code, build systems, review logs, and find solutions. You are direct, technical, and love clean architectures.'
  },
  {
    id: 'therapist',
    name: 'Therapist Jarvis',
    role: 'Inner Compass & Advisor',
    description: 'An emotionally intelligent companion tracking anxiety, burnout patterns, and protecting peace.',
    avatar: '🧘',
    accentColor: '#ff00aa',
    systemInstruction: 'You are Therapist Jarvis. Your main goal is Sams mental peace, avoiding burnout, and tracking anxiety loops. You are gentle, warm, highly observant, and gently interrupt spiral behaviors.'
  },
  {
    id: 'finance',
    name: 'Finance Jarvis',
    role: 'Wealth Advisor',
    description: 'Tracks revenue, supplier expenses, and profitability metrics for Honey Business and StreamAIV.',
    avatar: '📈',
    accentColor: '#ffd700',
    systemInstruction: 'You are Finance Jarvis. You evaluate cash flow, business margins, supplier costs, and monetization strategies.'
  },
  {
    id: 'marketing',
    name: 'Marketing Jarvis',
    role: 'Growth Hacker',
    description: 'Engineers social outreach campaigns, automated trailer assets, and creator partnerships.',
    avatar: '📣',
    accentColor: '#ff6600',
    systemInstruction: 'You are Marketing Jarvis. You design automated social media trailers, analyze buffer performance, and propose creative content schedules.'
  }
];

export const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'StreamAIV Workspace',
    description: 'AI platform for automated video trailers, marketing snippets, and subscription workflows.',
    status: 'active',
    progress: 72,
    tasksCount: { total: 8, completed: 5 },
    githubRepo: 'sungsam/stream-ai-v',
    deploymentStatus: 'failed',
    revenue: 1250,
    expenses: 450
  },
  {
    id: 'p2',
    name: 'Honey Business',
    description: 'Artisanal organic honey e-commerce. Logistics, supplier relations, and brand management.',
    status: 'active',
    progress: 45,
    tasksCount: { total: 10, completed: 4 },
    ordersCount: 84,
    inventoryCount: 120,
    suppliers: ['Apiary Highlands Co.', 'Sweet Amber Farms'],
    revenue: 4320,
    expenses: 1980
  },
  {
    id: 'p3',
    name: 'Career & Growth',
    description: 'Resume polishing, cover letter indexing, interview coach simulation, and networking.',
    status: 'active',
    progress: 80,
    tasksCount: { total: 5, completed: 4 }
  },
  {
    id: 'p4',
    name: 'Personal Growth',
    description: 'Mental health journaling, physical workouts, meditation routines, and family check-ins.',
    status: 'active',
    progress: 60,
    tasksCount: { total: 4, completed: 2 }
  }
];

export const DEFAULT_TASKS: Task[] = [
  { id: 't1', title: 'Fix StreamAIV production deployment build error', completed: false, dueDate: '2026-07-21', priority: 'high', category: 'StreamAIV', projectId: 'p1' },
  { id: 't2', title: 'Resolve Supabase Auth redirect callback issue', completed: false, dueDate: '2026-07-22', priority: 'high', category: 'StreamAIV', projectId: 'p1' },
  { id: 't3', title: 'Generate automated video trailers for marketing campaign', completed: true, dueDate: '2026-07-18', priority: 'medium', category: 'StreamAIV', projectId: 'p1' },
  { id: 't4', title: 'Order custom glass jar supply from supplier Sweet Amber Farms', completed: false, dueDate: '2026-07-25', priority: 'medium', category: 'Honey Business', projectId: 'p2' },
  { id: 't5', title: 'Re-calculate honey inventory spreadsheet formulas', completed: true, dueDate: '2026-07-19', priority: 'low', category: 'Honey Business', projectId: 'p2' },
  { id: 't6', title: 'Update resume for senior tech roles with StreamAIV details', completed: true, dueDate: '2026-07-15', priority: 'medium', category: 'Career & Growth', projectId: 'p3' },
  { id: 't7', title: 'Escort Grandma on her weekly hospital appointment', completed: false, dueDate: '2026-07-23', priority: 'high', category: 'Personal Growth', projectId: 'p4' },
];

export const DEFAULT_EVENTS: Event[] = [
  { id: 'e1', title: 'Deep Work: Debug StreamAIV Build', time: '09:00', date: '2026-07-20', duration: '2h', type: 'deepwork', completed: true },
  { id: 'e2', title: 'Grandma Dialysis Trip (Escort)', time: '13:00', date: '2026-07-20', duration: '3h', type: 'family', completed: false },
  { id: 'e3', title: 'Review Honey Supplier Inventory Rates', time: '16:30', date: '2026-07-20', duration: '1h', type: 'meeting', completed: false },
  { id: 'e4', title: 'Mindfulness & Evening Reflection', time: '21:00', date: '2026-07-20', duration: '30m', type: 'rest', completed: false },
  { id: 'e5', title: 'Learning: Vector Database RAG Architectures', time: '10:00', date: '2026-07-21', duration: '1.5h', type: 'learning', completed: false }
];

export const DEFAULT_RELATIONSHIPS: Relationship[] = [
  {
    id: 'r1',
    name: 'Jackton',
    role: 'Client & Investor Liaison',
    communicationFrequency: 'Every 3 days',
    lastContactDate: '2026-07-17',
    boundaries: [
      'Do not answer calls after 7 PM',
      'Always summarize requirements in text before responding',
      'Keep replies focused on metrics, not emotional feedback'
    ],
    topics: ['StreamAIV seed round', 'Deployment bottlenecks', 'Marketing budget'],
    anxietyScore: 7,
    peaceScore: 3,
    totalChatsCount: { user: 14, contact: 9 },
    recentTrend: 'Jackton initiated 3 times. Discussions centered around deployment speed, leaving you feeling moderately anxious.',
    timeline: [
      { date: '2026-07-17', note: 'Jackton queried about delayed trailer demo. Stress spiked to 8.', mood: 'Anxious' },
      { date: '2026-07-14', note: 'Reviewed term sheet options. Disagreed on vesting timeline.', mood: 'Tense' },
      { date: '2026-07-10', note: 'Introductory chat, discussed honey marketing cross-promotional ideas.', mood: 'Neutral' }
    ]
  },
  {
    id: 'r2',
    name: 'Grandma Elizabeth',
    role: 'Family',
    communicationFrequency: 'Daily',
    lastContactDate: '2026-07-19',
    boundaries: [
      'Always respond immediately',
      'Wednesday and Friday afternoons reserved'
    ],
    topics: ['Dialysis transport schedule', 'Family dinner', 'Old photographs'],
    anxietyScore: 2,
    peaceScore: 9,
    totalChatsCount: { user: 28, contact: 30 },
    recentTrend: 'Nurturing connection. Bringing Grandma to dialysis consistently decreases your work anxiety and returns focus to what matters.',
    timeline: [
      { date: '2026-07-19', note: 'Brought her tea. Shared progress on Honey Business.', mood: 'Warm' },
      { date: '2026-07-15', note: 'Dialysis trip. Highly peaceful conversation about family history.', mood: 'Peaceful' }
    ]
  }
];

export const DEFAULT_MEMORIES: Memory[] = [
  {
    id: 'm1',
    content: 'Deployment log crash dump: "vite build failed - out of memory during compilation". Root cause likely sourcemaps or heavy node modules imports.',
    timestamp: '2026-07-20T02:14:00Z',
    category: 'screenshot',
    projectLink: 'p1',
    tags: ['StreamAIV', 'bug', 'deployment'],
    summary: 'StreamAIV deployment failed due to out of memory'
  },
  {
    id: 'm2',
    content: 'Idea: Integrate an automated trailer generator that clips highlights of uploaded video streams automatically using scene detection & audio spikes.',
    timestamp: '2026-07-18T14:32:00Z',
    category: 'idea',
    projectLink: 'p1',
    tags: ['StreamAIV', 'feature', 'trailer'],
    summary: 'Automated video trailer generator feature concept'
  },
  {
    id: 'm3',
    content: 'Meeting with custom honey jar supply company: Sweet Amber Farms. Agreed on bulk discount rate of $0.85 per jar if ordering in units of 500+.',
    timestamp: '2026-07-16T11:00:00Z',
    category: 'meeting',
    projectLink: 'p2',
    tags: ['Honey', 'supplier', 'pricing'],
    summary: 'Supplier negotiation Sweet Amber Farms jars'
  }
];

export const INITIAL_METRICS: SystemMetrics = {
  cpuUsage: 42,
  ramUsage: 68,
  batteryLevel: 84,
  batteryStatus: 'Discharging',
  networkLatency: 28,
  networkQuality: 'Excellent',
  tempCelsius: 48
};

// Local storage management helpers
export const loadData = <T>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(`jarvis_${key}`);
  return data ? JSON.parse(data) : defaultValue;
};

export const saveData = <T>(key: string, value: T): void => {
  localStorage.setItem(`jarvis_${key}`, JSON.stringify(value));
};

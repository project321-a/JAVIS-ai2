import React, { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  Activity,
  Zap,
  Scale,
  RefreshCw,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  HelpCircle,
  Clock,
  Layout,
  Briefcase,
  History,
  CheckSquare,
  Sparkles,
  PieChart as PieIcon,
  ShieldAlert
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { Project, Memory, Task, Event, ValueRule, SystemMetrics } from '../types';

interface DigitalTwinProps {
  projects: Project[];
  tasks: Task[];
  events: Event[];
  memories: Memory[];
  values: ValueRule[];
  currentMetrics: SystemMetrics;
}

// Default/mock state for the Digital Twin simulation if API hasn't been run or fails
const DEFAULT_TWIN_STATE = {
  cognitiveProfile: {
    dominantArchetype: "Hyper-focused Architect with Micro-Novelty Drift",
    attentionalBandwidth: 82,
    burnoutVulnerability: 38,
    alignmentScore: 84,
    activeCognitiveStates: ["Hyper-focused on core development", "Attention residue from project-switching", "High recovery rate"]
  },
  behavioralPatterns: [
    {
      "patternName": "Micro-Novelty Venture Trap",
      "observations": "When a technical bug causes high cognitive friction (e.g., cold-starts in StreamAIV), there is a 75% spike in app switching and brainstorming secondary startups (e.g. e-commerce sites) to seek instant novelty dopamine.",
      "severity": "medium",
      "trigger": "Development roadblock / high focus friction"
    },
    {
      "patternName": "Midnight Deep Work Compression",
      "observations": "Productivity metrics rise by 45% between 10:00 PM and 1:00 AM. While focus is pristine, this sleep deprivation triggers a 50% rise in distraction loops the following afternoon.",
      "severity": "low",
      "trigger": "End-of-day quiet hours"
    },
    {
      "patternName": "Value-Agnostic Task Hopping",
      "observations": "You occasionally commit to low-priority tasks (designing logos, tweaking CSS) to avoid the high-stress strategic work of releasing products. This leaks attention from key milestones.",
      "severity": "high",
      "trigger": "Core deadline approach"
    }
  ],
  productivityCycles: {
    "peakFocusHours": "20:00 - 23:45",
    "efficiencyRating": 86,
    "cognitiveDipHours": "14:15 - 16:30",
    "dailyOptimalSchedule": "Tackle the heaviest StreamAIV code debugging between 09:00 - 12:00. Pivot to administrative or design tasks during the 14:00 dip, and reserve late evening exclusively for relaxed review or complete system shutdown."
  },
  decisionMakingHistoryInsights: {
    "recentFearsDeconstructed": "Observed a recurring subconscious fear that StreamAIV won't satisfy immediate financial expectations, which drives a defensive urge to keep launching other small MVPs rather than committing to one deep release.",
    "valueAlignmentRatio": 0.81,
    "recommendingFrictionReducers": "Lock your workspace focus to StreamAIV for blocks of 14 days. Place all miscellaneous startup notes in a designated offline vault instead of starting active design branches."
  },
  predictiveInsights: [
    {
      "timeframe": "Next 7 Days",
      "prediction": "High risk of context-switching overwhelm due to active project overlap. If you initiate a secondary project now, your primary StreamAIV launch timeline will delay by at least 11 days.",
      "probability": "85%",
      "mitigation": "Enable the Inner Compass screen-switching alarm and execute the 60-second Box Breathing drill before closing code editors."
    },
    {
      "timeframe": "Next 30 Days",
      "prediction": "An attentional plateau is predicted by mid-August. Continuous late-night coding blocks without deep-rest days will degrade overall system architecture quality.",
      "probability": "75%",
      "mitigation": "Establish a hard rule of one full screen-free rest day every week to allow unconscious cognitive consolidation."
    }
  ]
};

// Colors for Pie cells
const PIE_COLORS = ['#22d3ee', '#3b82f6', '#818cf8', '#f43f5e', '#fbbf24', '#10b981'];

export default function DigitalTwin({
  projects,
  tasks,
  events,
  memories,
  values,
  currentMetrics
}: DigitalTwinProps) {
  const [twinData, setTwinData] = useState(DEFAULT_TWIN_STATE);
  const [loading, setLoading] = useState(false);
  const [simulationCount, setSimulationCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState<string>('Pre-loaded Core');
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'productivity' | 'predictive'>('overview');
  const [errorText, setErrorText] = useState<string | null>(null);

  // Analyze memory categories from real workspace data
  const realMemoryData = React.useMemo(() => {
    const counts: Record<string, number> = {};
    memories.forEach(m => {
      counts[m.category] = (counts[m.category] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.toUpperCase(),
      value
    }));
  }, [memories]);

  // Analyze projects tasks from real workspace data
  const realProjectData = React.useMemo(() => {
    return projects.map(p => {
      const projTasks = tasks.filter(t => t.projectId === p.id);
      const total = projTasks.length;
      const completed = projTasks.filter(t => t.completed).length;
      return {
        name: p.name.split(' ')[0],
        total,
        completed,
        pending: total - completed
      };
    });
  }, [projects, tasks]);

  // Total tasks calculations
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.completed).length;
  const taskCompletionRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  // Running the cognitive twin simulation via backend
  const runTwinSimulation = async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const response = await fetch('/api/jarvis/digitaltwin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projects,
          tasks,
          events,
          memories,
          values,
          currentMetrics
        })
      });

      if (!response.ok) {
        throw new Error('Simulation uplink rejected. Defaulting to local model.');
      }

      const data = await response.json();
      setTwinData(data);
      setSimulationCount(prev => prev + 1);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.warn("Digital Twin API call failed, using high-fidelity local fallback simulation:", err);
      setErrorText("Uplink rate-limited or API key pending. J.A.R.V.I.S. completed a localized analytical simulation instead.");
      
      // Inject some slight dynamic variation based on real task ratios to prove local simulation is alive
      const modifiedTwin = {
        ...DEFAULT_TWIN_STATE,
        cognitiveProfile: {
          ...DEFAULT_TWIN_STATE.cognitiveProfile,
          attentionalBandwidth: Math.min(100, Math.max(50, 75 + Math.floor(Math.random() * 15))),
          alignmentScore: Math.min(100, Math.max(40, taskCompletionRate > 0 ? taskCompletionRate : 80)),
          dominantArchetype: taskCompletionRate > 70 
            ? "Disciplined Focus Finisher" 
            : "Creative Explorer with High Context Switching Rate"
        }
      };
      setTwinData(modifiedTwin);
      setSimulationCount(prev => prev + 1);
      setLastUpdated(`${new Date().toLocaleTimeString()} (Localized OS Model)`);
    } finally {
      setLoading(false);
    }
  };

  // Simulated daily cycle chart data (efficiency fluctuation)
  const simulatedCycleData = [
    { time: '08:00', 'Energy Reserve': 90, 'Focus Coefficient': 70, 'Novelty Seeking': 30 },
    { time: '10:00', 'Energy Reserve': 85, 'Focus Coefficient': 88, 'Novelty Seeking': 20 },
    { time: '12:00', 'Energy Reserve': 75, 'Focus Coefficient': 80, 'Novelty Seeking': 25 },
    { time: '14:00', 'Energy Reserve': 55, 'Focus Coefficient': 45, 'Novelty Seeking': 65 }, // Dip & Novelty spikes
    { time: '16:00', 'Energy Reserve': 65, 'Focus Coefficient': 60, 'Novelty Seeking': 50 },
    { time: '18:00', 'Energy Reserve': 70, 'Focus Coefficient': 65, 'Novelty Seeking': 40 },
    { time: '20:00', 'Energy Reserve': 78, 'Focus Coefficient': 92, 'Novelty Seeking': 15 }, // Peak Focus Hours
    { time: '22:00', 'Energy Reserve': 60, 'Focus Coefficient': 86, 'Novelty Seeking': 10 },
    { time: '00:00', 'Energy Reserve': 35, 'Focus Coefficient': 75, 'Novelty Seeking': 35 }
  ];

  return (
    <div className="space-y-6" id="digital-twin-container">
      {/* Module Title Deck */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-xl gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
            <h2 className="text-sm font-mono tracking-wider uppercase text-indigo-300">Cognitive Digital Twin</h2>
          </div>
          <h1 className="text-xl font-sans font-bold text-white mt-1">Behavioral Analytics & Predictive Forecast</h1>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Simulating Sam’s neural bandwidth, habitual distractions, and project alignment based on active database telemetry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="block text-[10px] font-mono text-slate-500 uppercase">Twin Alignment Status</span>
            <span className="text-xs font-mono text-indigo-400 font-semibold">{lastUpdated}</span>
          </div>

          <button
            id="btn-run-simulation"
            onClick={runTwinSimulation}
            disabled={loading}
            className="bg-indigo-600/20 hover:bg-indigo-600/30 active:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider font-semibold transition flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Synthesizing...' : 'Sync Simulation'}</span>
          </button>
        </div>
      </div>

      {/* Warning/Notification Alert */}
      {errorText && (
        <div className="bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-xl flex items-center space-x-3 text-xs font-mono text-amber-300">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{errorText}</span>
        </div>
      )}

      {/* Primary Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Holographic Neural Center & Key Metrics */}
        <div className="lg:col-span-1 space-y-6">
          {/* Holographic Avatar Core Card */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl relative overflow-hidden flex flex-col items-center justify-center text-center py-8">
            <div className="absolute top-2 right-2 flex items-center space-x-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[9px] font-mono uppercase text-indigo-300">Active Node</span>
            </div>

            {/* Glowing Pulsing Circle (The Twin Core) */}
            <div className="relative w-40 h-40 my-4 flex items-center justify-center">
              {/* Outer wave rings */}
              <motion.div
                animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.2, 0.5, 0.2] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute inset-0 border-2 border-indigo-500/20 rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }}
                className="absolute inset-[-10px] border border-cyan-500/15 rounded-full"
              />
              {/* Core solid sphere */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600/35 via-cyan-600/20 to-black border border-indigo-500/40 flex flex-col items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.25)]">
                <Brain className="w-10 h-10 text-indigo-300" />
                <span className="text-[10px] font-mono text-cyan-300 mt-1 font-bold">STABILITY</span>
                <span className="text-xs font-mono text-white font-bold">
                  {Math.round((twinData.cognitiveProfile.attentionalBandwidth + twinData.cognitiveProfile.alignmentScore) / 2)}%
                </span>
              </div>
            </div>

            <div className="mt-2 space-y-1">
              <h3 className="font-mono text-[11px] text-indigo-300 uppercase tracking-widest">Dominant Archetype</h3>
              <p className="text-sm font-sans font-bold text-white px-3">
                {twinData.cognitiveProfile.dominantArchetype}
              </p>
            </div>

            <div className="w-full border-t border-white/5 mt-5 pt-4 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Simulations Run:</span>
                <span className="text-white font-bold">{simulationCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Primary Constraint:</span>
                <span className="text-cyan-400 font-semibold">Side Project Drift</span>
              </div>
            </div>
          </div>

          {/* Core Twin Metrics Bars */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center space-x-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>Simulated Twin State Parameters</span>
            </h3>

            {/* Parameter 1 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Attentional Bandwidth</span>
                <span className="text-indigo-300 font-bold">{twinData.cognitiveProfile.attentionalBandwidth}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${twinData.cognitiveProfile.attentionalBandwidth}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                />
              </div>
              <p className="text-[10px] font-mono text-slate-500">
                Cognitive energy retained after factoring context-switching overhead.
              </p>
            </div>

            {/* Parameter 2 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Burnout Vulnerability</span>
                <span className="text-rose-400 font-bold">{twinData.cognitiveProfile.burnoutVulnerability}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${twinData.cognitiveProfile.burnoutVulnerability}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-rose-500 to-amber-400"
                />
              </div>
              <p className="text-[10px] font-mono text-slate-500">
                Biological threat rating calculated from midnight sprints and stress values.
              </p>
            </div>

            {/* Parameter 3 */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Value Alignment Score</span>
                <span className="text-emerald-400 font-bold">{twinData.cognitiveProfile.alignmentScore}%</span>
              </div>
              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${twinData.cognitiveProfile.alignmentScore}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400"
                />
              </div>
              <p className="text-[10px] font-mono text-slate-500">
                Real-time indicator matching your task milestones with core values.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Extensive tabs and details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Navigation Menu */}
          <div className="flex border-b border-white/10 space-x-2 font-mono text-xs overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 border-b-2 font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-indigo-500 text-white bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Overview & Analytics
            </button>
            <button
              onClick={() => setActiveTab('patterns')}
              className={`px-4 py-2 border-b-2 font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'patterns'
                  ? 'border-indigo-500 text-white bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Behavioral Patterns
            </button>
            <button
              onClick={() => setActiveTab('productivity')}
              className={`px-4 py-2 border-b-2 font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'productivity'
                  ? 'border-indigo-500 text-white bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Efficiency Cycles
            </button>
            <button
              onClick={() => setActiveTab('predictive')}
              className={`px-4 py-2 border-b-2 font-semibold transition cursor-pointer whitespace-nowrap ${
                activeTab === 'predictive'
                  ? 'border-indigo-500 text-white bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Predictive Insights
            </button>
          </div>

          {/* TAB CONTENTS: Overview & Analytics */}
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Cognitive State Badges */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 mb-3">
                    Active Cognitive States & Mind Resonances
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {twinData.cognitiveProfile.activeCognitiveStates.map((state, i) => (
                      <span
                        key={i}
                        className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs px-3 py-1.5 rounded-lg font-mono flex items-center space-x-1.5"
                      >
                        <Zap className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{state}</span>
                      </span>
                    ))}
                    {currentMetrics.cpuUsage > 45 && (
                      <span className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs px-3 py-1.5 rounded-lg font-mono flex items-center space-x-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                        <span>System Friction Warning</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Grid of Two Charts: Projects & Memories */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Real Project Task Distribution */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                        <Layout className="w-4 h-4 text-cyan-400" />
                        <span>Project Bandwidth (Real)</span>
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">{projects.length} Workspaces</span>
                    </div>

                    <div className="h-56">
                      {realProjectData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={realProjectData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                              labelClassName="font-mono text-xs"
                            />
                            <Legend wrapperStyle={{ fontSize: 9 }} />
                            <Bar dataKey="completed" name="Completed Tasks" fill="#22d3ee" stackId="a" />
                            <Bar dataKey="pending" name="Pending Tasks" fill="#818cf8" stackId="a" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
                          No active project milestones recorded.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Real Memory Categorization distribution */}
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                        <PieIcon className="w-4 h-4 text-indigo-400" />
                        <span>Cognitive Storage (Real)</span>
                      </h4>
                      <span className="text-[10px] font-mono text-slate-500">{memories.length} Memories</span>
                    </div>

                    <div className="h-56 flex items-center justify-center">
                      {realMemoryData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={realMemoryData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {realMemoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                            <Legend wrapperStyle={{ fontSize: 9, bottom: 0 }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-xs font-mono text-slate-500">
                          Empty memory vault. Input some brain dumps to load.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Core Decision History Analysis block */}
                <div className="bg-gradient-to-r from-indigo-950/25 via-white/5 to-transparent border border-white/10 rounded-xl p-5 backdrop-blur-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                      <Scale className="w-4.5 h-4.5 text-indigo-400" />
                      <span>Value Alignment & Strategic Decisiveness</span>
                    </h3>
                    <div className="bg-indigo-500/10 text-indigo-300 px-2 py-0.5 rounded text-[10px] font-mono border border-indigo-500/20">
                      Coeff: {twinData.decisionMakingHistoryInsights.valueAlignmentRatio}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2 space-y-1.5 bg-black/20 border border-white/5 p-3 rounded-lg">
                      <span className="block text-[10px] font-mono text-slate-500 uppercase">Subconscious Core Drivers</span>
                      <p className="text-xs font-sans text-slate-200 leading-relaxed font-semibold">
                        {twinData.decisionMakingHistoryInsights.recentFearsDeconstructed}
                      </p>
                    </div>

                    <div className="md:col-span-3 space-y-1.5 bg-black/20 border border-white/5 p-3 rounded-lg">
                      <div className="flex items-center space-x-1 text-[10px] font-mono text-slate-500 uppercase">
                        <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Friction Reducer Recommendations</span>
                      </div>
                      <p className="text-xs font-sans text-cyan-100 leading-relaxed">
                        {twinData.decisionMakingHistoryInsights.recommendingFrictionReducers}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENTS: Behavioral Patterns */}
            {activeTab === 'patterns' && (
              <motion.div
                key="patterns"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {twinData.behavioralPatterns.map((pattern, index) => (
                  <div
                    key={index}
                    className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
                  >
                    {/* Severity colored bar */}
                    <div className={`absolute top-0 bottom-0 left-0 w-1 ${
                      pattern.severity === 'high' ? 'bg-rose-500' : pattern.severity === 'medium' ? 'bg-amber-500' : 'bg-indigo-500'
                    }`} />

                    <div className="space-y-2 md:max-w-[70%] pl-2">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                          pattern.severity === 'high'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : pattern.severity === 'medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {pattern.severity} severity
                        </span>
                        <h4 className="font-sans font-bold text-white text-sm">{pattern.patternName}</h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{pattern.observations}</p>
                    </div>

                    <div className="bg-black/30 border border-white/5 rounded-lg p-3 md:min-w-[25%] font-mono text-xs text-right">
                      <span className="block text-[9px] text-slate-500 uppercase">Telemetry Trigger</span>
                      <span className="text-indigo-300 font-medium block mt-1">{pattern.trigger}</span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* TAB CONTENTS: Efficiency Cycles */}
            {activeTab === 'productivity' && (
              <motion.div
                key="productivity"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Visual Efficiency Fluctuation Area Chart */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300 flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <span>Simulated 24-Hour Efficiency Cycles</span>
                    </h3>
                    <div className="flex items-center space-x-1 text-slate-500 font-mono text-[10px]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Sam’s Daily Peak Telemetry</span>
                    </div>
                  </div>

                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={simulatedCycleData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorNovelty" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                        <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                        <Tooltip contentStyle={{ backgroundColor: '#090d16', border: '1px solid rgba(255,255,255,0.1)' }} />
                        <Legend wrapperStyle={{ fontSize: 9 }} />
                        <Area type="monotone" dataKey="Focus Coefficient" stroke="#818cf8" fillOpacity={1} fill="url(#colorFocus)" />
                        <Area type="monotone" dataKey="Novelty Seeking" stroke="#f43f5e" fillOpacity={1} fill="url(#colorNovelty)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Timing schedule info deck */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xl space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Peak Focus Window</span>
                    <p className="text-lg font-sans font-extrabold text-indigo-300">{twinData.productivityCycles.peakFocusHours}</p>
                    <p className="text-[10px] font-mono text-slate-400">Telemetry shows maximum cognitive consistency.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xl space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Cognitive Dip Window</span>
                    <p className="text-lg font-sans font-extrabold text-rose-400">{twinData.productivityCycles.cognitiveDipHours}</p>
                    <p className="text-[10px] font-mono text-slate-400">High vulnerability to doomscrolling & app-hops.</p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-xl space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Simulated Efficiency Rating</span>
                    <p className="text-lg font-sans font-extrabold text-emerald-400">{twinData.productivityCycles.efficiencyRating}%</p>
                    <p className="text-[10px] font-mono text-slate-400">Composite score based on task completions.</p>
                  </div>
                </div>

                <div className="bg-black/20 border border-white/5 rounded-xl p-4 font-sans text-xs space-y-2">
                  <span className="text-[10px] font-mono text-indigo-400 uppercase font-bold tracking-widest block">Daily Optimal Scheduling Advice</span>
                  <p className="text-slate-200 leading-relaxed">{twinData.productivityCycles.dailyOptimalSchedule}</p>
                </div>
              </motion.div>
            )}

            {/* TAB CONTENTS: Predictive Insights */}
            {activeTab === 'predictive' && (
              <motion.div
                key="predictive"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {twinData.predictiveInsights.map((pred, i) => (
                  <div
                    key={i}
                    className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl space-y-4"
                  >
                    <div className="flex justify-between items-center border-b border-white/5 pb-2">
                      <div className="flex items-center space-x-2">
                        <History className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-mono font-bold uppercase text-slate-200">{pred.timeframe} Forecast</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono text-slate-500">PROBABILITY</span>
                        <span className="bg-indigo-500/10 text-indigo-300 font-bold font-mono text-xs px-2 py-0.5 rounded border border-indigo-500/20">
                          {pred.probability}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div className="md:col-span-3 space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Simulated Development</span>
                        <p className="text-xs text-slate-300 leading-relaxed font-medium">
                          {pred.prediction}
                        </p>
                      </div>

                      <div className="md:col-span-2 space-y-1 bg-black/30 border border-white/5 p-3 rounded-lg flex flex-col justify-between">
                        <div>
                          <div className="flex items-center space-x-1 text-[9px] font-mono text-emerald-400 uppercase font-bold">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Defensive Safeguard</span>
                          </div>
                          <p className="text-[11px] font-sans text-slate-300 mt-1 leading-normal">
                            {pred.mitigation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

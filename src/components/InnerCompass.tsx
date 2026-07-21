import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  ShieldAlert,
  Brain,
  Timer,
  Activity,
  Sparkles,
  Heart,
  List,
  Calendar,
  TrendingUp,
  CheckCircle,
  RefreshCw,
  AlertTriangle,
  ChevronRight,
  ArrowLeft,
  Award,
  Info,
  Shield,
  Zap,
  BookOpen
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
  Legend
} from 'recharts';
import { collection, query, where, getDocs, addDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { InnerCompassLog, ValueRule } from '../types';

interface InnerCompassProps {
  userId: string | null;
  values: ValueRule[];
  triggerSignal?: { type: string; timestamp: number } | null;
  onClearSignal?: () => void;
}

const DEFAULT_COMPASS_LOGS: InnerCompassLog[] = [
  {
    id: 'c1',
    journalText: 'Feeling highly anxious about the StreamAIV production release. Kept cycling between YouTube, Slack, and metrics dashboard every 2 minutes instead of debugging the cold-start issue.',
    triggerType: 'excessive_app_switching',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    dominantEmotion: 'Avoidance & Overwhelm',
    valueAlignmentScore: 45,
    analysis: 'J.A.R.V.I.S. DIAGNOSIS: Sam, you are hiding in micro-cycles of shallow novelty to avoid the cognitive strain of the server cold-start bug. Your distraction is a defense mechanism against potential failure. This directly conflicts with your stated value of "Quality Engineering" and "Attention Sovereignty". Reclaiming control requires holding space for the frustration.',
    actionStep: 'Perform 60 seconds of Box Breathing, then open exactly one browser tab containing the cold-start trace and work on it for 15 minutes without any external notifications.'
  },
  {
    id: 'c2',
    journalText: 'Feeling deeply exhausted but trying to force progress on the Honey Business landing page. Mind is sluggish, keeps loading Twitter and refreshing analytics repeatedly.',
    triggerType: 'doomscrolling',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    dominantEmotion: 'Cognitive Fatigue',
    valueAlignmentScore: 58,
    analysis: 'J.A.R.V.I.S. DIAGNOSIS: Your dopamine seeking is a biological response to depleted willpower. Trying to brute-force focus during severe exhaustion is an exercise in futility and undermines your value of "Sustainable Vitality". You are mistaking physical presence for productive output.',
    actionStep: 'Shut down the system monitors, step away from the deck, and drink a tall glass of water. Rest for 10 full minutes without looking at any screen.'
  }
];

export default function InnerCompass({ userId, values, triggerSignal, onClearSignal }: InnerCompassProps) {
  const [logs, setLogs] = useState<InnerCompassLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calibration Active wizard states
  const [activeCalibration, setActiveCalibration] = useState<boolean>(false);
  const [selectedTrigger, setSelectedTrigger] = useState<'excessive_app_switching' | 'doomscrolling' | 'multitasking_loop' | 'manual'>('manual');
  const [journalText, setJournalText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    analysis: string;
    dominantEmotion: string;
    valueAlignmentScore: number;
    actionStep: string;
  } | null>(null);

  // Focus mode / breathing timer states
  const [showBreathingTimer, setShowBreathingTimer] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [timerSeconds, setTimerSeconds] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  // Notification notification system
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simulated metrics
  const [entropyScore, setEntropyScore] = useState(18); // out of 100
  const [currentFocusLevel, setCurrentFocusLevel] = useState(88); // out of 100

  // Load logs
  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      if (userId) {
        try {
          const q = query(
            collection(db, 'innerCompassLogs'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const fetched: InnerCompassLog[] = [];
            snap.forEach((doc) => {
              const data = doc.data();
              fetched.push({
                id: doc.id,
                userId: data.userId,
                journalText: data.journalText || '',
                triggerType: data.triggerType || 'manual',
                timestamp: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
                dominantEmotion: data.dominantEmotion || '',
                valueAlignmentScore: data.valueAlignmentScore || 50,
                analysis: data.analysis || '',
                actionStep: data.actionStep || ''
              });
            });
            setLogs(fetched);
          } else {
            setLogs(DEFAULT_COMPASS_LOGS);
          }
        } catch (err) {
          console.error("Failed to load compass logs:", err);
          setLogs(DEFAULT_COMPASS_LOGS);
        }
      } else {
        const cached = localStorage.getItem('jarvis_compass_logs');
        if (cached) {
          setLogs(JSON.parse(cached));
        } else {
          setLogs(DEFAULT_COMPASS_LOGS);
        }
      }
      setLoading(false);
    }
    loadLogs();
  }, [userId]);

  // Handle outside signals (triggers passed by root App)
  useEffect(() => {
    if (triggerSignal) {
      setSelectedTrigger(triggerSignal.type as any);
      setActiveCalibration(true);
      setEntropyScore(74);
      setCurrentFocusLevel(42);
      if (onClearSignal) onClearSignal();
    }
  }, [triggerSignal, onClearSignal]);

  // Breathing countdown logic
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          const next = prev - 1;
          
          // Breathing cycle rhythm: 4s inhale, 4s hold, 4s exhale
          const cycleSec = (60 - next) % 12;
          if (cycleSec < 4) {
            setBreathingPhase('Inhale');
          } else if (cycleSec < 8) {
            setBreathingPhase('Hold');
          } else {
            setBreathingPhase('Exhale');
          }
          
          return next;
        });
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
      triggerToast("Mind Stabilized. Stated values anchored successfully.");
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const simulatePattern = (pattern: 'excessive_app_switching' | 'doomscrolling' | 'multitasking_loop') => {
    setSelectedTrigger(pattern);
    setActiveCalibration(true);
    setJournalText('');
    setAnalysisResult(null);
    setEntropyScore(pattern === 'excessive_app_switching' ? 82 : pattern === 'doomscrolling' ? 68 : 79);
    setCurrentFocusLevel(pattern === 'excessive_app_switching' ? 39 : pattern === 'doomscrolling' ? 48 : 41);
    triggerToast(`Alert! High-entropy "${pattern.replace(/_/g, ' ')}" signature simulated.`);
  };

  const handleAnalyze = async () => {
    if (!journalText.trim()) return;
    setAnalyzing(true);
    try {
      const response = await fetch('/api/jarvis/compass-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journalText,
          triggerType: selectedTrigger,
          statedValues: values.filter(v => v.enabled).map(v => ({ name: v.title, desc: v.description }))
        })
      });

      if (!response.ok) throw new Error("Recalibration analysis failed");

      const result = await response.json();
      setAnalysisResult({
        analysis: result.analysis,
        dominantEmotion: result.dominantEmotion,
        valueAlignmentScore: result.valueAlignmentScore,
        actionStep: result.actionStep
      });
    } catch (err) {
      console.error(err);
      // Fallback
      setAnalysisResult({
        analysis: "J.A.R.V.I.S. CORE NOTE: My uplink to the central NLP core is currently experiences high jitter, Sam. However, analyzing your journal entry locally, it is obvious you are feeling the weight of the tasks ahead. You are substituting deep execution with superficial novelty. Focus on your primary value anchors.",
        dominantEmotion: "Focus Dispersion",
        valueAlignmentScore: 50,
        actionStep: "Close all unnecessary workspaces and run the 60-second breathing core now."
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveCalibration = async () => {
    if (!analysisResult) return;
    
    const newLog: InnerCompassLog = {
      id: `compass_${Date.now()}`,
      userId,
      journalText,
      triggerType: selectedTrigger,
      timestamp: new Date().toISOString(),
      dominantEmotion: analysisResult.dominantEmotion,
      valueAlignmentScore: analysisResult.valueAlignmentScore,
      analysis: analysisResult.analysis,
      actionStep: analysisResult.actionStep
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    if (userId) {
      try {
        await addDoc(collection(db, 'innerCompassLogs'), {
          userId,
          journalText: newLog.journalText,
          triggerType: newLog.triggerType,
          dominantEmotion: newLog.dominantEmotion,
          valueAlignmentScore: newLog.valueAlignmentScore,
          analysis: newLog.analysis,
          actionStep: newLog.actionStep,
          createdAt: new Date()
        });
      } catch (err) {
        console.error("Failed to persist compass log in Firestore:", err);
      }
    } else {
      localStorage.setItem('jarvis_compass_logs', JSON.stringify(updatedLogs));
    }

    // Reset simulator scores
    setEntropyScore(12);
    setCurrentFocusLevel(94);
    
    // Reset states
    setActiveCalibration(false);
    setAnalysisResult(null);
    setJournalText('');
    setShowBreathingTimer(false);
    setTimerActive(false);

    triggerToast("Calibrated. Calibration record logged into your neural index.");
  };

  const startBreathing = () => {
    setTimerSeconds(60);
    setTimerActive(true);
    setShowBreathingTimer(true);
  };

  // Stats calculations
  const avgAlignment = logs.length > 0 
    ? Math.round(logs.reduce((sum, l) => sum + l.valueAlignmentScore, 0) / logs.length)
    : 100;

  const triggerStats = logs.reduce((acc, log) => {
    const type = log.triggerType.replace(/_/g, ' ');
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const triggerChartData = Object.entries(triggerStats).map(([name, count]) => ({
    name: name.toUpperCase(),
    Count: count
  }));

  const chartData = [...logs].reverse().map((l, idx) => ({
    session: `Calibration ${idx + 1}`,
    Alignment: l.valueAlignmentScore,
    date: new Date(l.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
  }));

  return (
    <div className="space-y-6 h-full pb-12 relative" id="inner-compass-container">
      {/* Toast Alert HUD */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-6 z-50 bg-[#0c1a2e]/90 border border-cyan-500/30 text-cyan-400 font-mono text-[10px] uppercase tracking-wider px-4 py-3 rounded shadow-[0_0_20px_rgba(6,182,212,0.2)] flex items-center space-x-2"
          >
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid View */}
      {!activeCalibration ? (
        <div className="space-y-6">
          {/* Header Dashboard Status Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4" id="compass-status-hud-deck">
            {/* Main Compass HUD Module */}
            <div className="md:col-span-2 bg-gradient-to-br from-[#040814] to-[#0a122c] border border-cyan-500/10 rounded-xl p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute right-[-15px] bottom-[-15px] opacity-5 pointer-events-none">
                <Compass className="w-48 h-48 text-cyan-400" />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-mono text-cyan-500 uppercase tracking-wider block mb-1">Attention Directive</span>
                  <h2 className="text-lg font-bold font-mono tracking-widest text-slate-100 uppercase">INNER COMPASS CORE</h2>
                  <p className="text-xs text-slate-400 mt-1">Align active attentional signatures with stated values anchors.</p>
                </div>
                <div className="bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded text-[9px] font-mono text-cyan-400 uppercase tracking-widest">
                  INTELLIGENCE ACTIVE
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  id="btn-calibrate-focus"
                  onClick={() => {
                    setSelectedTrigger('manual');
                    setActiveCalibration(true);
                  }}
                  className="bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 text-xs font-mono tracking-wider px-5 py-2.5 rounded-lg transition uppercase flex items-center space-x-2 cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span>Calibrate Attention</span>
                </button>

                <div className="text-right">
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">System Entropy</span>
                  <span className="text-xs font-mono font-bold text-emerald-400">STABLE (12-20Hz)</span>
                </div>
              </div>
            </div>

            {/* Metric Card 2: Alignment Index */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Alignment Score</span>
                <span className="text-3xl font-mono font-extrabold text-cyan-400">{avgAlignment}%</span>
              </div>
              <div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-cyan-400 transition-all duration-500" 
                    style={{ width: `${avgAlignment}%` }}
                  />
                </div>
                <p className="text-[9px] font-mono text-slate-400 mt-2 uppercase">INDEX OF ACTIVE ATTENTIONAL HARMONY</p>
              </div>
            </div>

            {/* Metric Card 3: Entropy Meter */}
            <div className="bg-white/5 border border-white/5 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Active Entropy</span>
                <span className="text-3xl font-mono font-extrabold text-emerald-400">{entropyScore}%</span>
              </div>
              <div>
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-500" 
                    style={{ width: `${entropyScore}%` }}
                  />
                </div>
                <p className="text-[9px] font-mono text-emerald-400 mt-2 uppercase tracking-wide">
                  {entropyScore > 40 ? '⚠️ AT RISK: SCATTER SIGNATURE' : '✓ MINIMAL DISTRACTION LOG'}
                </p>
              </div>
            </div>
          </div>

          {/* Pattern Simulator rig */}
          <div className="bg-white/5 border border-white/5 rounded-xl p-6" id="compass-pattern-simulator">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-cyan-500" />
              <span>Attentional Anomaly & Cognitive Pattern Simulator</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              In a native sandboxed environment, JARVIS tracks behavioral indicators. Simulate attentional anomalies or excessive app-switching triggers to prompt immediate journaling recalibration.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                id="btn-simulate-app-switching"
                onClick={() => simulatePattern('excessive_app_switching')}
                className="bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 text-left p-4 rounded-lg transition group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-red-400 tracking-wider uppercase">HYPERACTIVE APP SWITCHING</span>
                  <Zap className="w-3.5 h-3.5 text-red-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 group-hover:text-slate-300">
                  Simulate jumping hyperactively between Slack, code, and browser to trigger an escape-loop check-in.
                </p>
              </button>

              <button
                id="btn-simulate-doomscrolling"
                onClick={() => simulatePattern('doomscrolling')}
                className="bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/30 text-left p-4 rounded-lg transition group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-amber-400 tracking-wider uppercase">DOPAMINE DOOMSCROLLING</span>
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 group-hover:text-slate-300">
                  Simulate persistent scroll signatures on social media feeds to initiate alignment calibration.
                </p>
              </button>

              <button
                id="btn-simulate-multitasking"
                onClick={() => simulatePattern('multitasking_loop')}
                className="bg-purple-500/5 hover:bg-purple-500/10 border border-purple-500/10 hover:border-purple-500/30 text-left p-4 rounded-lg transition group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-purple-400 tracking-wider uppercase">MULTITASKING THREAD SPREAD</span>
                  <Brain className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <p className="text-[10px] text-slate-400 mt-2 group-hover:text-slate-300">
                  Simulate launching multiple half-completed threads simultaneously to prompt cognitive anchoring.
                </p>
              </button>
            </div>
          </div>

          {/* Historical Logs and Analytics Chart split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="compass-analytics-deck">
            {/* Recharts Value Alignment Line Chart */}
            <div className="bg-[#040814] border border-white/5 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Timeline Index</span>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-4">Values Alignment Over Time</h4>
              </div>

              <div className="h-64 w-full">
                {logs.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorAlignment" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b2d2" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#06b2d2" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                      <XAxis dataKey="date" stroke="#ffffff40" fontSize={9} />
                      <YAxis stroke="#ffffff40" fontSize={9} domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0c1a2e', borderColor: '#06b2d230' }}
                        labelStyle={{ color: '#06b2d2', fontSize: '10px', fontFamily: 'monospace' }}
                        itemStyle={{ color: '#fff', fontSize: '10px' }}
                      />
                      <Area type="monotone" dataKey="Alignment" stroke="#06b2d2" fillOpacity={1} fill="url(#colorAlignment)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500 uppercase font-mono">
                    No historical logs yet.
                  </div>
                )}
              </div>
            </div>

            {/* Trigger Distribution Chart */}
            <div className="bg-[#040814] border border-white/5 rounded-xl p-5 flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Anomaly Frequency</span>
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-4">Triggers Distribution Breakdown</h4>
              </div>

              <div className="h-64 w-full">
                {triggerChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={triggerChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                      <XAxis dataKey="name" stroke="#ffffff40" fontSize={8} />
                      <YAxis stroke="#ffffff40" fontSize={9} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0c1a2e', borderColor: '#06b2d230' }}
                        itemStyle={{ color: '#fff', fontSize: '10px' }}
                      />
                      <Bar dataKey="Count" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500 uppercase font-mono">
                    No logs found.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Historical Log list */}
          <div className="bg-white/5 border border-white/5 rounded-xl p-6" id="compass-history-records">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-cyan-500" />
              <span>Compass Recalibration Log History</span>
            </h4>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500 font-mono flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-500" />
                <span>INDEXING LOG RECORDS...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 font-mono uppercase">
                Zero system anomalies detected. Fully stabilized.
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="bg-white/[0.02] border border-white/5 rounded-lg p-4 font-mono text-[11px] leading-relaxed relative">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-white/5 mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-cyan-400 font-bold uppercase bg-cyan-500/10 px-2 py-0.5 rounded text-[9px] tracking-widest">
                          {log.triggerType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[9px] text-slate-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1 sm:mt-0 flex items-center space-x-1">
                        <span className="text-slate-500 text-[9px]">ALIGNMENT INDEX:</span>
                        <span className={`font-bold ${log.valueAlignmentScore > 75 ? 'text-emerald-400' : log.valueAlignmentScore > 50 ? 'text-amber-400' : 'text-red-400'}`}>
                          {log.valueAlignmentScore}%
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <span className="text-slate-400 font-bold block mb-1 uppercase text-[9px]">SAM'S RAW JOURNAL:</span>
                        <p className="text-slate-300 italic">"{log.journalText}"</p>
                      </div>
                      <div className="bg-cyan-950/10 border border-cyan-500/10 rounded p-3">
                        <span className="text-cyan-400 font-bold block mb-1 uppercase text-[9px]">J.A.R.V.I.S. ANALYSIS & CORRECTION:</span>
                        <p className="text-slate-300 mb-2 leading-relaxed">{log.analysis}</p>
                        <div className="flex items-center space-x-1.5 pt-2 border-t border-cyan-500/10 mt-2 text-[10px] text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span><strong>TACTILE REDIRECTION:</strong> {log.actionStep}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ACTIVE CALIBRATION FLUX WIZARD */
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-b from-[#060c1d] to-[#020408] border border-cyan-500/20 rounded-xl p-6 relative overflow-hidden"
          id="active-calibration-flow"
        >
          {/* Back button */}
          <button
            onClick={() => setActiveCalibration(false)}
            className="mb-6 flex items-center space-x-1.5 text-xs font-mono text-slate-400 hover:text-white transition uppercase cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Cancel Recalibration</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Value Anchors and Context */}
            <div className="space-y-4">
              <div className="bg-white/5 border border-white/5 rounded-lg p-5 font-mono">
                <span className="text-[9px] text-cyan-400 uppercase tracking-widest block mb-1">Calibration Phase</span>
                <h3 className="text-sm font-bold text-slate-100 uppercase mb-3 flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-cyan-500 animate-pulse" />
                  <span>Stated Value Anchors</span>
                </h3>
                <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                  To align actions with intention, your J.A.R.V.I.S. core compares active mental states with your declared priorities:
                </p>

                <div className="space-y-2.5">
                  {values.filter(v => v.enabled).map((val) => (
                    <div key={val.id} className="bg-white/[0.03] border border-white/5 rounded p-3 relative group">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-[11px] font-bold text-slate-200 uppercase">{val.title}</h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{val.description}</p>
                        </div>
                        <Award className="w-4 h-4 text-cyan-500 shrink-0 ml-2" />
                      </div>
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 rounded-l" />
                    </div>
                  ))}
                  {values.filter(v => v.enabled).length === 0 && (
                    <p className="text-[11px] text-amber-400 italic">No value priorities configured. Standard alignment rules will default.</p>
                  )}
                </div>
              </div>

              {/* Cognitive State Meter */}
              <div className="bg-white/5 border border-white/5 rounded-lg p-5 font-mono">
                <h4 className="text-xs font-bold uppercase text-slate-300 mb-3">Attentional Indicators</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-400">SYSTEM COGNITIVE ENTROPY:</span>
                      <span className="text-amber-400 font-bold">{entropyScore}%</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: `${entropyScore}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="text-slate-400">FOCUS COHERENCE:</span>
                      <span className="text-cyan-400 font-bold">{currentFocusLevel}%</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400" style={{ width: `${currentFocusLevel}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Journaling Input / Active Calibrator */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-lg p-5 relative">
                <span className="absolute top-4 right-4 text-[9px] font-mono text-red-400 uppercase tracking-widest animate-pulse">
                  Anomaly: {selectedTrigger.replace(/_/g, ' ').toUpperCase()}
                </span>
                
                <h3 className="text-sm font-bold font-mono text-slate-200 uppercase mb-2 flex items-center space-x-2">
                  <Compass className="w-4.5 h-4.5 text-cyan-400 animate-spin" />
                  <span>Calibration Prompt & Reflex journaling</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono mb-4">
                  Sam, what was the exact trigger, internal friction, or emotional resistance that drove you to distract yourself? Write honestly. J.A.R.V.I.S. is listening in deep confidence.
                </p>

                <textarea
                  id="journal-input-textarea"
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  placeholder="e.g. Feeling overwhelmed with the database sync refactoring. I feel a bit tired and anxious that I will write buggy code, so I switched to reading Hacker News to feel like I am still working, but really I am procrastinating..."
                  className="w-full h-44 bg-[#010206] border border-white/10 rounded-lg p-4 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500/50 resize-none leading-relaxed transition"
                  disabled={analyzing || !!analysisResult}
                />

                <div className="mt-4 flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase">Trigger Event:</span>
                    <select
                      id="select-trigger-type"
                      value={selectedTrigger}
                      onChange={(e) => setSelectedTrigger(e.target.value as any)}
                      className="bg-slate-900 border border-white/10 rounded px-2 py-1 text-[10px] font-mono text-cyan-400 uppercase focus:outline-none"
                      disabled={analyzing || !!analysisResult}
                    >
                      <option value="manual">Manual Values Alignment Check-in</option>
                      <option value="excessive_app_switching">Excessive App Switching Anomaly</option>
                      <option value="doomscrolling">Dopamine seeking / Doomscrolling</option>
                      <option value="multitasking_loop">Hyperactive Multitasking Loop</option>
                    </select>
                  </div>

                  {!analysisResult && (
                    <button
                      id="btn-realign-analysis"
                      onClick={handleAnalyze}
                      disabled={analyzing || !journalText.trim()}
                      className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-mono uppercase tracking-wider transition cursor-pointer ${
                        analyzing || !journalText.trim()
                          ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                          : 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/30'
                      }`}
                    >
                      {analyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                          <span>Analyzing Intention Core...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                          <span>Analyze & Realign Attention</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* J.A.R.V.I.S. analysis output & circular tactile countdown */}
              <AnimatePresence>
                {analysisResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#030918] border border-cyan-500/20 rounded-lg p-5 font-mono space-y-4 relative overflow-hidden"
                    id="analysis-result-box"
                  >
                    <div className="flex items-center justify-between border-b border-white/5 pb-3">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">J.A.R.V.I.S. COGNITIVE CALIBRATION ASSESS</h4>
                      </div>
                      <div className="flex items-center space-x-3 text-[10px]">
                        <span className="text-slate-500">DOMINANT DRIVER:</span>
                        <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded font-bold uppercase">
                          {analysisResult.dominantEmotion}
                        </span>
                        <span className="text-slate-500">ALIGNMENT:</span>
                        <span className={`font-bold ${analysisResult.valueAlignmentScore > 75 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {analysisResult.valueAlignmentScore}%
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      {analysisResult.analysis}
                    </p>

                    <div className="bg-cyan-950/20 border border-cyan-500/10 rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-emerald-400 font-bold uppercase block tracking-wider">RECOMMENDED REFOCUS TASK:</span>
                        <p className="text-xs text-slate-200 font-bold">{analysisResult.actionStep}</p>
                      </div>

                      {!showBreathingTimer ? (
                        <button
                          id="btn-start-breathing"
                          onClick={startBreathing}
                          className="bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-mono tracking-wider px-4 py-2.5 rounded transition uppercase whitespace-nowrap cursor-pointer shrink-0"
                        >
                          Start Grounding Core (60s)
                        </button>
                      ) : (
                        <div className="flex items-center space-x-4 shrink-0">
                          {/* Animated circle Breathing timer */}
                          <div className="relative w-14 h-14 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border border-cyan-500/10" />
                            {/* Animated expanding ring representing breathing phase */}
                            <motion.div
                              animate={{
                                scale: breathingPhase === 'Inhale' ? [1, 1.4] : breathingPhase === 'Hold' ? 1.4 : [1.4, 1],
                              }}
                              transition={{
                                duration: breathingPhase === 'Hold' ? 4 : 4,
                                ease: "easeInOut",
                                repeat: Infinity,
                              }}
                              className={`absolute inset-0 rounded-full border ${
                                breathingPhase === 'Inhale' ? 'border-cyan-400/40 bg-cyan-400/5' : breathingPhase === 'Hold' ? 'border-emerald-400/40 bg-emerald-400/5' : 'border-amber-400/40 bg-amber-400/5'
                              }`}
                            />
                            <span className="text-[10px] font-bold text-slate-100 z-10">{timerSeconds}s</span>
                          </div>

                          <div className="font-mono text-left">
                            <span className="text-[9px] text-slate-500 block uppercase">Breathing Coach</span>
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${
                              breathingPhase === 'Inhale' ? 'text-cyan-400 animate-pulse' : breathingPhase === 'Hold' ? 'text-emerald-400' : 'text-amber-400'
                            }`}>
                              {breathingPhase}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/5">
                      <button
                        id="btn-rejournal"
                        onClick={() => setAnalysisResult(null)}
                        className="bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-[10px] font-mono px-4 py-2 rounded transition uppercase cursor-pointer"
                        disabled={timerActive}
                      >
                        Adjust Entry
                      </button>
                      <button
                        id="btn-finalize-calibration"
                        onClick={handleSaveCalibration}
                        className="bg-cyan-500/20 border border-cyan-500/40 hover:bg-cyan-500/30 text-cyan-400 text-[10px] font-mono px-5 py-2 rounded transition font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Anchor Calibration Log
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

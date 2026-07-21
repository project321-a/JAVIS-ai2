import React, { useState, useEffect } from 'react';
import { ShieldAlert, Zap, Compass, Activity, BrainCircuit, Bell, Clock, Sun, RefreshCw, AlertTriangle, Play, GitBranch, Server, CheckCircle2, BellRing, Sparkles, Eye, Trash } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, Event, Memory, SystemMetrics, ProactiveBriefing } from '../types';

interface DashboardProps {
  tasks: Task[];
  events: Event[];
  memories: Memory[];
  metrics: SystemMetrics;
  mood: string;
  stressLevel: number;
  onTriggerFocusMode: () => void;
  onToggleTask: (id: string) => void;
  onTriggerViewChange: (view: string) => void;
  proactiveBriefings?: ProactiveBriefing[];
  onAcknowledgeBriefing?: (id: string) => void;
  onTriggerSystemScan?: () => void;
}

export default function Dashboard({
  tasks,
  events,
  memories,
  metrics,
  mood,
  stressLevel,
  onTriggerFocusMode,
  onToggleTask,
  onTriggerViewChange,
  proactiveBriefings = [],
  onAcknowledgeBriefing,
  onTriggerSystemScan,
}: DashboardProps) {
  const [time, setTime] = useState(new Date());

  // Keep clock running
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  // Compute stats
  const activeTasks = tasks.filter((t) => !t.completed);
  const todaysMission = activeTasks.find((t) => t.priority === 'high') || activeTasks[0];
  const upcomingEvents = events.filter((e) => !e.completed).slice(0, 3);

  // Computed cognitive stats
  const burnoutRisk = stressLevel > 7 ? 'HIGH' : stressLevel > 4 ? 'MODERATE' : 'OPTIMAL';
  const energyScore = mood === 'Tense' ? 38 : mood === 'Anxious' ? 45 : 82;
  const focusLevel = stressLevel > 6 ? 52 : 88;

  return (
    <div className="space-y-6">
      {/* HUD spaceship top info header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Time, Weather and Location */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl flex items-center justify-between font-mono text-xs relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
          <div className="space-y-1 pl-2">
            <span className="text-[10px] text-white/40 uppercase tracking-widest block">Stark Uplink Clock</span>
            <p className="text-2xl font-semibold text-white tracking-wider font-mono">{formattedTime}</p>
            <span className="text-[10px] text-white/50 block">{formattedDate} (UTC-07:00)</span>
          </div>

          <div className="text-right space-y-1">
            <span className="text-[10px] text-white/40 uppercase tracking-widest block">Silicon Valley Climate</span>
            <p className="text-lg font-semibold text-cyan-400 flex items-center justify-end">
              <Sun className="w-4 h-4 mr-1 text-cyan-400 animate-spin" style={{ animationDuration: '20s' }} />
              <span>72°F</span>
            </p>
            <span className="text-[10px] text-white/50 block">Clear sky • Calm winds</span>
          </div>
        </div>

        {/* AI Greeting Message */}
        <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl flex flex-col justify-center font-mono text-xs relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
          <div className="pl-2">
            <div className="flex items-center space-x-2 text-cyan-400 text-[10px] uppercase tracking-wider font-bold mb-1.5">
              <BrainCircuit className="w-4.5 h-4.5 animate-pulse" />
              <span>JARVIS SYSTEM GREETING</span>
            </div>
            <p className="text-white/90 leading-relaxed font-sans text-xs">
              "Welcome back, Sam. All critical microservices are synchronized. Your active projects show 1 compile bottleneck. Stated values compliance sits at 94%. Let me know when you're ready to initiate lockout focus."
            </p>
          </div>
        </div>

      </div>

      {/* Autonomous Intelligence & Proactive Briefing Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" id="proactive-briefings-panel">
        
        {/* Left Side: Autonomous service status & scan button */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl flex flex-col justify-between font-mono text-xs relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-white/40 uppercase tracking-widest block">Core Daemon Thread</span>
              <div className="flex items-center space-x-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[8px] text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                <span>DAEMON ACTIVE</span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-sans font-bold text-white flex items-center space-x-1.5">
                <span>Autonomous Intelligence</span>
              </h3>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Monitoring background telemetry across GitHub commits, calendar changes, and Vercel/Cloud Run deployments to guard your deep focus loops.
              </p>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="text-[9px] text-slate-500">
              Uplink sync frequency: <span className="text-cyan-400">45s</span>
            </div>
            <button
              id="btn-trigger-proactive-scan"
              onClick={onTriggerSystemScan}
              className="px-3.5 py-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 active:bg-cyan-600/40 border border-cyan-500/40 text-cyan-300 rounded text-[10px] font-bold uppercase tracking-wider transition flex items-center space-x-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Scan Telemetry Channels</span>
            </button>
          </div>
        </div>

        {/* Right Side: Proactive Alerts Feed */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)] flex flex-col justify-between max-h-[220px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-2 mb-3">
            <div className="flex items-center space-x-2">
              <BellRing className="w-4 h-4 text-cyan-400" />
              <span className="font-mono text-xs uppercase tracking-wider text-white/80">Proactive Briefing Feed</span>
            </div>
            <span className="font-mono text-[9px] text-white/30">
              {proactiveBriefings.filter(b => !b.acknowledged).length} unread briefings
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            <AnimatePresence initial={false}>
              {proactiveBriefings.filter(b => !b.acknowledged).length > 0 ? (
                proactiveBriefings
                  .filter(b => !b.acknowledged)
                  .map((briefing) => {
                    const typeColors = {
                      github: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
                      calendar: 'bg-amber-500/15 border-amber-500/30 text-amber-300',
                      deployment: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
                      system: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    };
                    const typeIcons = {
                      github: <GitBranch className="w-3.5 h-3.5 text-purple-400" />,
                      calendar: <Clock className="w-3.5 h-3.5 text-amber-400" />,
                      deployment: <Server className="w-3.5 h-3.5 text-cyan-400" />,
                      system: <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    };

                    return (
                      <motion.div
                        key={briefing.id}
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`flex items-start justify-between p-3 rounded-lg border ${typeColors[briefing.type] || 'bg-white/5 border-white/5 text-white/90'}`}
                      >
                        <div className="flex items-start space-x-3 pr-2 min-w-0">
                          <div className="p-1.5 rounded-md bg-black/25 shrink-0 mt-0.5">
                            {typeIcons[briefing.type] || <Bell className="w-3.5 h-3.5 text-white" />}
                          </div>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold font-sans truncate block text-white">
                                {briefing.title}
                              </span>
                              <span className="text-[8px] font-mono opacity-50 shrink-0">
                                {new Date(briefing.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-[11px] font-sans text-slate-300 leading-relaxed font-normal">
                              {briefing.description}
                            </p>
                          </div>
                        </div>

                        <button
                          id={`btn-ack-briefing-${briefing.id}`}
                          onClick={() => onAcknowledgeBriefing && onAcknowledgeBriefing(briefing.id)}
                          className="p-1.5 hover:bg-white/10 active:bg-white/20 rounded-md transition text-slate-400 hover:text-white shrink-0 cursor-pointer"
                          title="Acknowledge Briefing"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    );
                  })
              ) : (
                <div className="h-full py-10 flex flex-col items-center justify-center text-center space-y-1.5 text-white/30">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500/60" />
                  <p className="text-[11px] font-mono uppercase tracking-widest text-emerald-400/80 font-bold">Uplink channels perfectly silent</p>
                  <p className="text-[10px] font-sans text-slate-500 max-w-sm">
                    Continuous background telemetry scanning completed. No focus anomalies or uncommitted code repositories detected in the active cockpit.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* Main Stats Grid HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Cognitive and physical health meters */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Activity className="w-4.5 h-4.5 text-cyan-400" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-white/80">Cognitive Indices</h3>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Energy Score */}
            <div>
              <div className="flex justify-between items-center text-white/50 mb-1">
                <span>Energy Index</span>
                <span className="text-yellow-400 font-bold">{energyScore}%</span>
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div className="bg-yellow-400 h-full" style={{ width: `${energyScore}%` }} />
              </div>
            </div>

            {/* Stress Level */}
            <div>
              <div className="flex justify-between items-center text-white/50 mb-1">
                <span>Stress Threshold</span>
                <span className={`font-bold ${stressLevel > 6 ? 'text-red-400' : 'text-cyan-400'}`}>{stressLevel}/10</span>
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div className={`h-full ${stressLevel > 6 ? 'bg-red-400' : 'bg-cyan-400'}`} style={{ width: `${stressLevel * 10}%` }} />
              </div>
            </div>

            {/* Focus level */}
            <div>
              <div className="flex justify-between items-center text-white/50 mb-1">
                <span>Focus Coherence</span>
                <span className="text-emerald-400 font-bold">{focusLevel}%</span>
              </div>
              <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                <div className="bg-emerald-400 h-full" style={{ width: `${focusLevel}%` }} />
              </div>
            </div>

            {/* Burnout risk */}
            <div>
              <div className="flex justify-between items-center text-white/50 mb-1">
                <span>Burnout Risk</span>
                <span className={`font-bold ${burnoutRisk === 'HIGH' ? 'text-red-500' : 'text-white/75'}`}>{burnoutRisk}</span>
              </div>
            </div>
          </div>

          {/* Quick Trigger Focus mode button */}
          <button
            onClick={onTriggerFocusMode}
            className="w-full py-2.5 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold uppercase rounded-lg tracking-wider transition flex items-center justify-center space-x-1.5 shadow-[0_0_15px_-5px_rgba(34,211,238,0.3)]"
          >
            <Zap className="w-4 h-4 animate-bounce" />
            <span>Initiate AI Focus Mode</span>
          </button>
        </div>

        {/* Center 2 blocks: Mission Control and Upcoming Calendars */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Mission & top priorities */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl space-y-3 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-white/80 flex items-center">
                <Compass className="w-4.5 h-4.5 text-cyan-400 mr-2" />
                Active Missions List
              </span>
              <button
                onClick={() => onTriggerViewChange('workspaces')}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition"
              >
                View Workspace
              </button>
            </div>

            {/* Highlighted core mission */}
            {todaysMission ? (
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded p-3 flex items-start justify-between font-mono text-xs">
                <div className="space-y-1 flex-1 min-w-0 pr-3">
                  <span className="text-[8px] text-cyan-400 uppercase font-bold block">Singular Goal Directive</span>
                  <p className="font-sans text-white/90 text-xs font-bold truncate">{todaysMission.title}</p>
                  <span className="text-[9px] text-white/40 uppercase">Target Project: {todaysMission.category}</span>
                </div>
                <button
                  onClick={() => onToggleTask(todaysMission.id)}
                  className="px-2.5 py-1.5 bg-white/5 border border-white/10 hover:border-white/25 rounded text-[9px] text-white/90 uppercase tracking-wider transition"
                >
                  Complete
                </button>
              </div>
            ) : (
              <p className="text-xs text-white/40 font-mono italic">All high leverage missions completed.</p>
            )}

            {/* Other list subset */}
            <div className="space-y-2 pt-1 font-mono text-xs">
              <span className="text-[9px] text-white/40 uppercase tracking-wider block">Priority Queue</span>
              {activeTasks.slice(1, 4).map((task) => (
                <div key={task.id} className="flex justify-between items-center p-2.5 rounded bg-white/5 border border-white/5 text-xs">
                  <span className="truncate pr-2 font-sans text-white/80 text-[11px]">{task.title}</span>
                  <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded ${
                    task.priority === 'high' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-white/5 border border-white/5 text-white/50'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming locked calendar schedules */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl space-y-3 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
            <span className="font-mono text-xs uppercase tracking-wider text-white/80 flex items-center border-b border-white/5 pb-3">
              <Clock className="w-4.5 h-4.5 text-cyan-400 mr-2" />
              Locked Calendar Blocks
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              {upcomingEvents.map((evt) => (
                <div key={evt.id} className="bg-white/5 p-3 rounded border border-white/5 space-y-1">
                  <span className={`text-[8px] uppercase tracking-wider font-bold block ${
                    evt.type === 'deepwork' ? 'text-cyan-400' : evt.type === 'family' ? 'text-purple-400' : 'text-emerald-400'
                  }`}>
                    {evt.type}
                  </span>
                  <p className="font-sans text-white/90 text-[11px] font-bold truncate">{evt.title}</p>
                  <span className="text-[9px] text-white/40 block">{evt.time} ({evt.duration})</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right side: Hardware metrics simulation & recent thoughts */}
        <div className="space-y-6">
          
          {/* Hardware logs */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl space-y-3 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
            <span className="font-mono text-xs uppercase tracking-wider text-white/80 flex items-center border-b border-white/5 pb-3">
              <RefreshCw className="w-4.5 h-4.5 text-cyan-400 mr-2 animate-spin" style={{ animationDuration: '8s' }} />
              Telemetry Health Logs
            </span>

            <div className="grid grid-cols-2 gap-3 font-mono text-[10px] text-white/50">
              <div className="bg-white/5 p-2 rounded border border-white/5 text-center">
                <span>CPU Load</span>
                <p className="text-xs font-bold text-cyan-400 mt-1">{metrics.cpuUsage}%</p>
              </div>
              <div className="bg-white/5 p-2 rounded border border-white/5 text-center">
                <span>RAM Cache</span>
                <p className="text-xs font-bold text-cyan-400 mt-1">{metrics.ramUsage}%</p>
              </div>
              <div className="bg-white/5 p-2 rounded border border-white/5 text-center">
                <span>Battery Status</span>
                <p className="text-xs font-bold text-cyan-400 mt-1">{metrics.batteryLevel}%</p>
              </div>
              <div className="bg-white/5 p-2 rounded border border-white/5 text-center">
                <span>Uplink Delay</span>
                <p className="text-xs font-bold text-cyan-400 mt-1">{metrics.networkLatency}ms</p>
              </div>
            </div>
          </div>

          {/* Continuous active thoughts from J.A.R.V.I.S. (Spiral detector) */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl space-y-3 font-mono text-xs shadow-[0_4px_30px_rgba(0,0,0,0.4)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
            <div className="pl-2">
              <div className="flex items-center space-x-1.5 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                <AlertTriangle className="w-4.5 h-4.5 animate-pulse" />
                <span>Coherence Spiral Warning</span>
              </div>

              <p className="text-white/80 text-[11px] font-sans leading-relaxed italic bg-black/20 p-3 rounded border border-red-500/20 mt-1.5">
                "Sam, telemetry analysis confirms you've checked WhatsApp and deployment statuses multiple times. Your stress indexes are elevated. Before we jump into another startup idea, let’s capture the thought and finalize StreamAIV’s Supabase redirect bug."
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

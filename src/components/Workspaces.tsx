import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Sparkles, Terminal, FileText, CheckCircle2, Circle, AlertCircle, ShoppingCart, Archive, DollarSign, Briefcase, ArrowUpDown } from 'lucide-react';
import { Project, Task } from '../types';

interface WorkspacesProps {
  projects: Project[];
  tasks: Task[];
  onToggleTask: (id: string) => void;
  onAddTask: (task: Task) => void;
}

export default function Workspaces({
  projects,
  tasks,
  onToggleTask,
  onAddTask,
}: WorkspacesProps) {
  const [activeProjId, setActiveProjId] = useState<string>(projects[0]?.id || 'p1');
  const [deployLogs, setDeployLogs] = useState<string[]>([
    'Initializing deployment pipeline: sungsam/stream-ai-v',
    'Checking environment secrets: GEMINI_API_KEY detected.',
    'Bundling assets using esbuild...',
    'Error: Out of memory during Vite compilation. Build failed.'
  ]);
  const [isDeploying, setIsDeploying] = useState(false);
  const [interviewCoachQ, setInterviewCoachQ] = useState('');
  const [coachResponse, setCoachResponse] = useState('');
  const [newHoneyStock, setNewHoneyStock] = useState(120);

  const activeProject = projects.find((p) => p.id === activeProjId);
  const [sortByPriority, setSortByPriority] = useState(false);

  // Helper to determine Project's urgency level
  const getProjectUrgency = (pId: string | undefined): number => {
    if (!pId) return 0;
    if (pId === 'p1') return 3.0; // StreamAIV / personal-os (High complexity, build fails)
    if (pId === 'p2') return 2.5; // Sweet Amber Farms Honey Business (orders pending)
    if (pId === 'p3') return 2.0; // Interview Prep
    if (pId === 'p4') return 4.0; // Grandma/Family (Direct values-aligned, highest priority)
    return 1.0;
  };

  // Helper to compute a composite score for a task
  const getTaskScore = (task: Task) => {
    // 1. Task Priority Weight
    let taskPriorityWeight = 0;
    if (task.priority === 'high') taskPriorityWeight = 30;
    else if (task.priority === 'medium') taskPriorityWeight = 20;
    else if (task.priority === 'low') taskPriorityWeight = 10;

    // 2. Project Urgency Weight
    const projectUrgency = getProjectUrgency(task.projectId);
    const projectUrgencyWeight = projectUrgency * 10; // Up to 40 points

    // 3. Deadline Proximity Weight
    let deadlineProximityWeight = 0;
    if (task.dueDate) {
      const today = new Date('2026-07-21');
      const due = new Date(task.dueDate);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        // Overdue gets maximum proximity weight
        deadlineProximityWeight = 50;
      } else if (diffDays === 0) {
        // Due today
        deadlineProximityWeight = 45;
      } else if (diffDays <= 2) {
        // Extremely close (next 2 days)
        deadlineProximityWeight = 35;
      } else if (diffDays <= 7) {
        // Within a week
        deadlineProximityWeight = 20;
      } else {
        // More than a week
        deadlineProximityWeight = 5;
      }
    }

    // Active/uncompleted tasks always rank higher than completed tasks
    const statusMultiplier = task.completed ? 0.01 : 1.0;

    return (taskPriorityWeight + projectUrgencyWeight + deadlineProximityWeight) * statusMultiplier;
  };

  // Filter & sort active project tasks
  const filteredAndSortedTasks = useMemo(() => {
    if (!activeProject) return [];
    const projectTasks = tasks.filter((t) => t.projectId === activeProject.id);
    if (!sortByPriority) return projectTasks;

    return [...projectTasks].sort((a, b) => {
      // Sort in descending order of priority score
      const scoreA = getTaskScore(a);
      const scoreB = getTaskScore(b);
      return scoreB - scoreA;
    });
  }, [tasks, activeProject?.id, sortByPriority]);

  // Recharts fake financial data
  const revenueData = [
    { name: 'May', revenue: 1100, expenses: 350 },
    { name: 'Jun', revenue: 1950, expenses: 800 },
    { name: 'Jul', revenue: activeProject?.revenue || 2200, expenses: activeProject?.expenses || 750 },
  ];

  const triggerDeploySimulation = () => {
    setIsDeploying(true);
    setDeployLogs((prev) => [...prev, 'Restarting clean container rebuild...']);
    
    setTimeout(() => {
      setDeployLogs((prev) => [
        ...prev,
        'Compiling TSX modules...',
        'Compiling backend server.ts bundle...',
        'Testing Supabase database connection: SUCCESS.',
        'Injecting frame permissions: CAMERA, MICROPHONE.',
        'Deployment complete. J.A.R.V.I.S. Uplink status: ONLINE. Host: Port 3000.'
      ]);
      setIsDeploying(false);
    }, 2000);
  };

  const triggerInterviewSimulation = () => {
    setCoachResponse('Analyzing role: "Senior Full Stack AI Developer". Generating question...');
    setTimeout(() => {
      setCoachResponse(
        `J.A.R.V.I.S. Coach: "Sam, in your StreamAIV architecture, you lazy-initialize the GoogleGenAI client on the backend to prevent crashes when keys are missing. How would you scale this to handle rate-limiting and token quotas across multi-agent calls?"`
      );
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Workspace Selector Left Side */}
      <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center space-x-2">
          <Briefcase className="w-4.5 h-4.5 text-cyan-400" />
          <h3 className="font-mono text-xs uppercase tracking-wider text-white/80">Intelligent Workspaces</h3>
        </div>

        <div className="space-y-2 font-mono">
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveProjId(p.id)}
              className={`w-full text-left p-3 rounded-lg border transition ${
                activeProjId === p.id
                  ? 'bg-white/10 border-white/20 text-cyan-400 shadow-[0_0_15px_-5px_rgba(34,211,238,0.3)]'
                  : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold truncate">{p.name}</span>
                <span className="text-[9px] uppercase text-white/40">{p.progress}%</span>
              </div>
              <div className="w-full bg-black/40 h-1 rounded-full mt-2 overflow-hidden">
                <div className="bg-cyan-500 h-full" style={{ width: `${p.progress}%` }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Workspace Stage Right Side */}
      <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl flex flex-col justify-between min-h-[480px] shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        {activeProject ? (
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div>
                <h4 className="text-sm font-semibold text-slate-100 font-mono">{activeProject.name}</h4>
                <p className="text-xs text-white/50 mt-1 font-sans">{activeProject.description}</p>
              </div>
              {activeProject.id === 'p1' && (
                <span className={`px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider ${
                  activeProject.deploymentStatus === 'failed' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                }`}>
                  GitHub Deploy: {activeProject.deploymentStatus}
                </span>
              )}
            </div>

            {/* Grid modules inside */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Task board subset */}
              <div className="space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider">Workspace Tasks</span>
                  <button
                    onClick={() => setSortByPriority(!sortByPriority)}
                    className={`px-2 py-0.5 rounded border text-[8px] font-mono uppercase tracking-wider transition flex items-center space-x-1 cursor-pointer ${
                      sortByPriority
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.25)]'
                        : 'bg-transparent border-white/10 text-slate-400 hover:text-white'
                    }`}
                    title="Automatically reorders tasks based on deadline proximity and project urgency levels"
                  >
                    <ArrowUpDown className="w-2.5 h-2.5" />
                    <span>{sortByPriority ? 'Priority Sorted' : 'Sort by Priority'}</span>
                  </button>
                </div>
                <div className="space-y-2 max-h-[220px] overflow-y-auto custom-scrollbar">
                  {filteredAndSortedTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => onToggleTask(task.id)}
                      className="w-full flex items-center justify-between p-2.5 rounded bg-white/5 border border-white/5 hover:border-white/10 text-left transition animate-fadeIn"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        {task.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-white/20 shrink-0" />
                        )}
                        <span className={`truncate font-sans text-white/80 text-[11px] ${task.completed ? 'line-through text-white/40' : ''}`}>
                          {task.title}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        {task.dueDate && (
                          <span className="text-[8px] text-white/40 font-mono">
                            {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                        <span className={`text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded font-mono ${
                          task.priority === 'high' ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-white/5 border border-white/5 text-white/50'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </button>
                  ))}
                  {filteredAndSortedTasks.length === 0 && (
                    <p className="text-[10px] text-white/40">No active tasks in this workspace.</p>
                  )}
                </div>
              </div>

              {/* Dynamic Sub-tab views per workspace */}
              <div className="space-y-3 font-mono text-xs">
                {activeProject.id === 'p1' && (
                  <>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider block">GitHub CI Console</span>
                    <div className="bg-black/30 p-3 rounded-lg border border-white/5 h-[180px] overflow-y-auto custom-scrollbar flex flex-col justify-between font-mono text-[10px]">
                      <div className="space-y-1">
                        {deployLogs.map((log, idx) => (
                          <p key={idx} className={`${log.includes('Error') ? 'text-red-400' : log.includes('ONLINE') ? 'text-emerald-400' : 'text-white/60'}`}>
                            &gt; {log}
                          </p>
                        ))}
                      </div>
                      <button
                        onClick={triggerDeploySimulation}
                        disabled={isDeploying}
                        className="mt-3 w-full py-1.5 bg-white/5 border border-white/10 hover:border-white/20 rounded text-center text-cyan-400 uppercase tracking-wider transition"
                      >
                        {isDeploying ? 'Deploying...' : 'Deploy latest main'}
                      </button>
                    </div>
                  </>
                )}

                {activeProject.id === 'p2' && (
                  <>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider block">Logistics & Supply Desk</span>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5 space-y-3">
                      <div className="flex justify-between items-center text-[11px] text-white/60">
                        <span className="flex items-center"><ShoppingCart className="w-3.5 h-3.5 text-cyan-500 mr-1" /> Active Orders</span>
                        <span className="font-bold text-white/90">{activeProject.ordersCount} units</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-white/60">
                        <span className="flex items-center"><Archive className="w-3.5 h-3.5 text-cyan-500 mr-1" /> Jar Inventory</span>
                        <span className="font-bold text-white/90">{newHoneyStock} units</span>
                      </div>
                      <div className="pt-2 border-t border-white/5 flex space-x-1">
                        <button
                          onClick={() => setNewHoneyStock(newHoneyStock + 100)}
                          className="flex-1 py-1.5 bg-white/5 rounded border border-white/10 text-[9px] hover:border-white/20 uppercase tracking-wider transition text-center text-white/80"
                        >
                          Restock jars (+100)
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {activeProject.id === 'p3' && (
                  <>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider block">Interview AI Coach Simulator</span>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5 space-y-3 min-h-[180px] flex flex-col justify-between">
                      <p className="text-[10px] text-white/60 leading-relaxed italic">
                        {coachResponse || "Awaiting coaching trigger. Prepare strategic interview questions."}
                      </p>
                      <button
                        onClick={triggerInterviewSimulation}
                        className="w-full py-1.5 bg-white/5 border border-white/10 hover:border-white/20 rounded text-center text-cyan-400 uppercase tracking-wider transition"
                      >
                        Fetch Interview Question
                      </button>
                    </div>
                  </>
                )}

                {activeProject.id === 'p4' && (
                  <>
                    <span className="text-[10px] text-white/40 uppercase tracking-wider block">Weekly Habits Tracker</span>
                    <div className="bg-white/5 p-3 rounded-lg border border-white/5 space-y-2">
                      <div className="flex justify-between items-center text-[11px] text-white/60">
                        <span>Water hydration metric</span>
                        <span className="text-emerald-400 font-bold">2.5L / 3L</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-white/60">
                        <span>Escorted Grandma</span>
                        <span className="text-cyan-400 font-bold">Compliant</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-white/60">
                        <span>Mental health reflection</span>
                        <span className="text-purple-400 font-bold">Completed</span>
                      </div>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Financial Revenue Charts */}
            {activeProject.revenue && (
              <div className="bg-white/5 border border-white/5 rounded-lg p-4">
                <span className="text-[10px] text-white/40 uppercase tracking-wider font-mono block mb-3">Workspace Profit & Financial Index</span>
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#555" fontSize={9} fontClassName="font-mono" />
                      <YAxis stroke="#555" fontSize={9} fontClassName="font-mono" />
                      <Tooltip contentStyle={{ background: '#020408', border: '1px solid #222', fontSize: 10, fontFamily: 'monospace' }} />
                      <Area type="monotone" dataKey="revenue" stroke="#06b6d4" fillOpacity={1} fill="url(#colorRev)" strokeWidth={1.5} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Dynamic AI advice box */}
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded flex items-start space-x-2.5 text-[10.5px] font-mono text-cyan-300">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400 animate-pulse" />
              <p>
                {activeProject.id === 'p1' && 'Sam, build logs confirm memory compilation crashes. I recommend postponing non-critical marketing until deployment reaches 90% stability.'}
                {activeProject.id === 'p2' && 'Supplier jar costs can be optimized by 12% if ordering units of 1,000+ from Sweet Amber Farms. Cash flow supports this transaction next Sunday.'}
                {activeProject.id === 'p3' && 'Recommended study focus: polish resume highlighting StreamAIV deployment and full-stack Express microservices.'}
                {activeProject.id === 'p4' && 'Your values engine shows perfect compliance this week. Prioritizing Grandma’s transport Dialysis protects your peace score.'}
              </p>
            </div>

          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-white/40 py-16 space-y-2">
            <AlertCircle className="w-8 h-8 text-white/20" />
            <p className="text-[10px] font-mono uppercase tracking-wider">No Active Project Workspace</p>
          </div>
        )}
      </div>
    </div>
  );
}

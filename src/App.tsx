import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Terminal,
  Compass,
  Briefcase,
  BookOpen,
  Calendar,
  Scale,
  User,
  Zap,
  Sparkles,
  Command,
  Search,
  Network,
  LogIn,
  LogOut,
  Heart,
  Brain
} from 'lucide-react';

import {
  loadData,
  saveData,
  DEFAULT_VALUES,
  DEFAULT_AGENTS,
  DEFAULT_PROJECTS,
  DEFAULT_TASKS,
  DEFAULT_EVENTS,
  DEFAULT_RELATIONSHIPS,
  DEFAULT_MEMORIES,
  INITIAL_METRICS
} from './utils/localData';

import { Task, Event, Relationship, Project, Memory, ValueRule, AgentMind, SystemMetrics, ProactiveBriefing } from './types';

// Component Imports
import Dashboard from './components/Dashboard';
import Workspaces from './components/Workspaces';
import BrainDump from './components/BrainDump';
import ExecutiveAI from './components/ExecutiveAI';
import RelationshipIntelligence from './components/RelationshipIntelligence';
import DecisionEngine from './components/DecisionEngine';
import KnowledgeGraph from './components/KnowledgeGraph';
import VoiceAssistant from './components/VoiceAssistant';
import CommandPalette from './components/CommandPalette';
import FocusMode from './components/FocusMode';
import AILabs from './components/AILabs';
import InnerCompass from './components/InnerCompass';
import DigitalTwin from './components/DigitalTwin';

import { db, auth, googleProvider, signInWithPopup, signOut } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, writeBatch, doc, addDoc, updateDoc } from 'firebase/firestore';

export default function App() {
  // --- Persistent State hooks ---
  const [tasks, setTasks] = useState<Task[]>(() => loadData<Task[]>('tasks', DEFAULT_TASKS));
  const [events, setEvents] = useState<Event[]>(() => loadData<Event[]>('events', DEFAULT_EVENTS));
  const [relationships, setRelationships] = useState<Relationship[]>(() => loadData<Relationship[]>('relationships', DEFAULT_RELATIONSHIPS));
  const [projects, setProjects] = useState<Project[]>(() => loadData<Project[]>('projects', DEFAULT_PROJECTS));
  const [memories, setMemories] = useState<Memory[]>(() => loadData<Memory[]>('memories', DEFAULT_MEMORIES));
  const [values, setValues] = useState<ValueRule[]>(() => loadData<ValueRule[]>('values', DEFAULT_VALUES));
  const [agents] = useState<AgentMind[]>(DEFAULT_AGENTS);
  
  // App views & modes
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [activeAgent, setActiveAgent] = useState<AgentMind>(DEFAULT_AGENTS[0]);
  const [focusModeActive, setFocusModeActive] = useState<boolean>(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [viewSwitchHistory, setViewSwitchHistory] = useState<number[]>([]);
  const [showScatterAlert, setShowScatterAlert] = useState<boolean>(false);
  const [pendingTriggerSignal, setPendingTriggerSignal] = useState<{ type: string; timestamp: number } | null>(null);
  
  // Hardware metrics simulator state
  const [metrics, setMetrics] = useState<SystemMetrics>(INITIAL_METRICS);

  // Proactive Briefings Autonomous Service State
  const [proactiveBriefings, setProactiveBriefings] = useState<ProactiveBriefing[]>([]);

  // Auth & Cloud database sync state
  const [user, setUser] = useState<any>(null);

  // Sync data from Firestore for signed-in user
  const syncDataFromFirestore = async (uid: string) => {
    try {
      const taskSnap = await getDocs(query(collection(db, 'tasks'), where('userId', '==', uid)));
      if (taskSnap.empty) {
        // Seeding database with default user records
        const batch = writeBatch(db);
        DEFAULT_TASKS.forEach((t) => {
          const ref = doc(collection(db, 'tasks'));
          batch.set(ref, { ...t, userId: uid });
        });
        DEFAULT_EVENTS.forEach((e) => {
          const ref = doc(collection(db, 'events'));
          batch.set(ref, { ...e, userId: uid });
        });
        DEFAULT_RELATIONSHIPS.forEach((r) => {
          const ref = doc(collection(db, 'relationships'));
          batch.set(ref, { ...r, userId: uid });
        });
        DEFAULT_PROJECTS.forEach((p) => {
          const ref = doc(collection(db, 'projects'));
          batch.set(ref, { ...p, userId: uid });
        });
        DEFAULT_MEMORIES.forEach((m) => {
          const ref = doc(collection(db, 'memories'));
          batch.set(ref, { ...m, userId: uid });
        });
        DEFAULT_VALUES.forEach((v) => {
          const ref = doc(collection(db, 'values'));
          batch.set(ref, { ...v, userId: uid });
        });
        await batch.commit();

        setTasks(DEFAULT_TASKS);
        setEvents(DEFAULT_EVENTS);
        setRelationships(DEFAULT_RELATIONSHIPS);
        setProjects(DEFAULT_PROJECTS);
        setMemories(DEFAULT_MEMORIES);
        setValues(DEFAULT_VALUES);
      } else {
        const tasksList: Task[] = [];
        taskSnap.forEach((doc) => tasksList.push(doc.data() as Task));
        setTasks(tasksList);

        const eventSnap = await getDocs(query(collection(db, 'events'), where('userId', '==', uid)));
        const eventsList: Event[] = [];
        eventSnap.forEach((doc) => eventsList.push(doc.data() as Event));
        setEvents(eventsList);

        const relSnap = await getDocs(query(collection(db, 'relationships'), where('userId', '==', uid)));
        const relsList: Relationship[] = [];
        relSnap.forEach((doc) => relsList.push(doc.data() as Relationship));
        setRelationships(relsList);

        const projSnap = await getDocs(query(collection(db, 'projects'), where('userId', '==', uid)));
        const projsList: Project[] = [];
        projSnap.forEach((doc) => projsList.push(doc.data() as Project));
        setProjects(projsList);

        const memSnap = await getDocs(query(collection(db, 'memories'), where('userId', '==', uid)));
        const memsList: Memory[] = [];
        memSnap.forEach((doc) => memsList.push(doc.data() as Memory));
        setMemories(memsList);

        const valSnap = await getDocs(query(collection(db, 'values'), where('userId', '==', uid)));
        const valsList: ValueRule[] = [];
        valSnap.forEach((doc) => valsList.push(doc.data() as ValueRule));
        setValues(valsList);
      }
    } catch (err) {
      console.error("Firestore sync failed:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await syncDataFromFirestore(currentUser.uid);
      } else {
        setTasks(loadData<Task[]>('tasks', DEFAULT_TASKS));
        setEvents(loadData<Event[]>('events', DEFAULT_EVENTS));
        setRelationships(loadData<Relationship[]>('relationships', DEFAULT_RELATIONSHIPS));
        setProjects(loadData<Project[]>('projects', DEFAULT_PROJECTS));
        setMemories(loadData<Memory[]>('memories', DEFAULT_MEMORIES));
        setValues(loadData<ValueRule[]>('values', DEFAULT_VALUES));
      }
    });
    return () => unsubscribe();
  }, []);
  
  // --- Auto-Save Sync to local storage for local guest ---
  useEffect(() => { if (!user) saveData('tasks', tasks); }, [tasks, user]);
  useEffect(() => { if (!user) saveData('events', events); }, [events, user]);
  useEffect(() => { if (!user) saveData('relationships', relationships); }, [relationships, user]);
  useEffect(() => { if (!user) saveData('projects', projects); }, [projects, user]);
  useEffect(() => { if (!user) saveData('memories', memories); }, [memories, user]);
  useEffect(() => { if (!user) saveData('values', values); }, [values, user]);

  // --- Autonomous Proactive Briefings Intelligence Service ---
  const DEFAULT_PROACTIVE_BRIEFINGS: ProactiveBriefing[] = [
    {
      id: 'pb_init_1',
      type: 'github',
      title: 'GitHub Commit Registered',
      description: 'Commit [feat: cognitive model integration] pushed to StreamAIV main branch by sungsam0987654332.',
      severity: 'success',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      acknowledged: false
    },
    {
      id: 'pb_init_2',
      type: 'deployment',
      title: 'Production Deployment Successful',
      description: 'Production container deploy completed successfully on Cloud Run (Port 3000 mapped). All telemetry ports healthy.',
      severity: 'info',
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      acknowledged: false
    },
    {
      id: 'pb_init_3',
      type: 'calendar',
      title: 'Calendar Modification Detected',
      description: 'New deep focus block compiled into evening slot. J.A.R.V.I.S. recommends setting focus guards active.',
      severity: 'warning',
      timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
      acknowledged: false
    }
  ];

  // Load and cache briefings
  useEffect(() => {
    const cached = localStorage.getItem('jarvis_proactive_briefings');
    if (cached) {
      setProactiveBriefings(JSON.parse(cached));
    } else {
      setProactiveBriefings(DEFAULT_PROACTIVE_BRIEFINGS);
    }
  }, []);

  useEffect(() => {
    if (proactiveBriefings.length > 0) {
      localStorage.setItem('jarvis_proactive_briefings', JSON.stringify(proactiveBriefings));
    }
  }, [proactiveBriefings]);

  // Dynamic Trigger to fetch J.A.R.V.I.S. synthesized briefing item
  const triggerProactiveBriefing = async (
    type: 'github' | 'calendar' | 'deployment' | 'system',
    details: any
  ) => {
    try {
      const response = await fetch('/api/jarvis/proactive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: type,
          eventDetails: details,
          tasks: tasks.slice(0, 5),
          events: events.slice(0, 5)
        })
      });

      if (!response.ok) {
        throw new Error('Briefing model node rate-limited');
      }

      const result = await response.json();
      
      const newBriefing: ProactiveBriefing = {
        id: `pb_${Date.now()}`,
        type,
        title: result.title || 'Telemetry Update Synthesized',
        description: result.description || 'Continuous monitoring registered an event change.',
        severity: result.severity || 'info',
        timestamp: new Date().toISOString(),
        acknowledged: false
      };

      setProactiveBriefings(prev => [newBriefing, ...prev]);
    } catch (err) {
      console.warn("API Briefing rate-limited, executing fallback:", err);
      const fallbackTitles = {
        github: 'GitHub Push Registered',
        calendar: 'Calendar Event Modified',
        deployment: 'Cloud Run Build Completed',
        system: 'Task State Shifted'
      };

      const newBriefing: ProactiveBriefing = {
        id: `pb_${Date.now()}`,
        type,
        title: fallbackTitles[type] || 'Telemetry Event Captured',
        description: details.msg || 'Autonomous Intelligence registered and categorized a state change in the OS cockpit.',
        severity: type === 'github' ? 'success' : type === 'calendar' ? 'warning' : 'info',
        timestamp: new Date().toISOString(),
        acknowledged: false
      };

      setProactiveBriefings(prev => [newBriefing, ...prev]);
    }
  };

  // State Change Monitoring (Real calendar & task mutations)
  const [prevEventsCount, setPrevEventsCount] = useState<number>(events.length);
  const [prevCompletedEventsCount, setPrevCompletedEventsCount] = useState<number>(
    events.filter(e => e.completed).length
  );

  useEffect(() => {
    const activeCompletedCount = events.filter(e => e.completed).length;
    if (events.length !== prevEventsCount) {
      setPrevEventsCount(events.length);
      triggerProactiveBriefing('calendar', {
        action: 'length_changed',
        count: events.length,
        msg: `A new schedule or block has been registered on the Stark Calendar list. Current count: ${events.length} events.`
      });
    } else if (activeCompletedCount !== prevCompletedEventsCount) {
      setPrevCompletedEventsCount(activeCompletedCount);
      triggerProactiveBriefing('calendar', {
        action: 'completed_changed',
        count: activeCompletedCount,
        msg: `Calendar event completion status updated. focus hours recalculated.`
      });
    }
  }, [events]);

  const [prevTasksCount, setPrevTasksCount] = useState<number>(tasks.length);
  const [prevCompletedTasksCount, setPrevCompletedTasksCount] = useState<number>(
    tasks.filter(t => t.completed).length
  );

  useEffect(() => {
    const activeCompletedCount = tasks.filter(t => t.completed).length;
    if (tasks.length !== prevTasksCount) {
      setPrevTasksCount(tasks.length);
      triggerProactiveBriefing('system', {
        action: 'task_count_changed',
        msg: `The tactical backlog shifted to ${tasks.length} total tasks.`
      });
    } else if (activeCompletedCount !== prevCompletedTasksCount) {
      setPrevCompletedTasksCount(activeCompletedCount);
      triggerProactiveBriefing('system', {
        action: 'task_completed',
        msg: `Backlog event cleared. High leverage completion registered on task backlog.`
      });
    }
  }, [tasks]);

  // Background simulation for random GitHub & Deployment occurrences
  useEffect(() => {
    const interval = setInterval(() => {
      const roll = Math.random();
      if (roll < 0.35) {
        // GitHub Push Simulation
        const randomProject = projects[Math.floor(Math.random() * projects.length)] || { name: 'personal-os' };
        const commits = [
          'refactored redis session logic to handle cache leakage',
          'feat: integrated deep mind safety model constraints',
          'bugfix: resolve race conditions on firestore transaction updates',
          'docs: finalized system architecture diagrams for board review'
        ];
        const randomCommit = commits[Math.floor(Math.random() * commits.length)];
        
        triggerProactiveBriefing('github', {
          repo: randomProject.name,
          commit: randomCommit,
          author: 'sungsam0987654332',
          msg: `Commit pushed to ${randomProject.name}/main: "${randomCommit}"`
        });
      } else if (roll < 0.70) {
        // Deployment Status simulation
        const randomProject = projects[Math.floor(Math.random() * projects.length)] || { name: 'StreamAIV' };
        const deployStatuses = ['success', 'building', 'failed'];
        const randomStatus = deployStatuses[Math.floor(Math.random() * deployStatuses.length)];
        
        triggerProactiveBriefing('deployment', {
          project: randomProject.name,
          status: randomStatus,
          msg: `Cloud Run build status for ${randomProject.name}: ${randomStatus.toUpperCase()}`
        });
      }
    }, 45000); // Evaluates every 45 seconds

    return () => clearInterval(interval);
  }, [projects]);

  // Simulate hardware metrics fluctuating over time
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        ...prev,
        cpuUsage: Math.floor(35 + Math.random() * 15),
        ramUsage: Math.floor(62 + Math.random() * 8),
        networkLatency: Math.floor(22 + Math.random() * 10),
        tempCelsius: Math.floor(45 + Math.random() * 5),
      }));
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Track high-frequency view switching to detect attentional scatter
  useEffect(() => {
    const now = Date.now();
    setViewSwitchHistory((prev) => {
      const updated = [...prev, now].filter((t) => now - t < 20000); // look back 20 seconds
      if (updated.length >= 4 && currentView !== 'compass') {
        setShowScatterAlert(true);
      }
      return updated;
    });
  }, [currentView]);

  // Keyboard hooks for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // State handlers passed to modules
  const handleToggleTask = async (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
    if (user) {
      try {
        const q = query(collection(db, 'tasks'), where('userId', '==', user.uid), where('id', '==', id));
        const snap = await getDocs(q);
        snap.forEach(async (d) => {
          await updateDoc(doc(db, 'tasks', d.id), { completed: !d.data().completed });
        });
      } catch (err) {
        console.error("Failed to update task in firestore:", err);
      }
    }
  };

  const handleAddTask = async (newTask: Task) => {
    setTasks((prev) => [newTask, ...prev]);
    if (user) {
      try {
        await addDoc(collection(db, 'tasks'), { ...newTask, userId: user.uid });
      } catch (err) {
        console.error("Failed to add task to firestore:", err);
      }
    }
  };

  const handleAddMemory = async (newMemory: Memory) => {
    setMemories((prev) => [newMemory, ...prev]);
    if (user) {
      try {
        await addDoc(collection(db, 'memories'), { ...newMemory, userId: user.uid });
      } catch (err) {
        console.error("Failed to add memory to firestore:", err);
      }
    }
  };

  const handleAddRelationship = async (r: Relationship) => {
    setRelationships((prev) => [...prev, r]);
    if (user) {
      try {
        await addDoc(collection(db, 'relationships'), { ...r, userId: user.uid });
      } catch (err) {
        console.error("Failed to add relationship to firestore:", err);
      }
    }
  };

  const handleSelectAgent = (agent: AgentMind) => {
    setActiveAgent(agent);
  };

  // Render sub-views dynamically based on selection
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            tasks={tasks}
            events={events}
            memories={memories}
            metrics={metrics}
            mood="Neutral"
            stressLevel={5}
            onTriggerFocusMode={() => setFocusModeActive(true)}
            onToggleTask={handleToggleTask}
            onTriggerViewChange={setCurrentView}
            proactiveBriefings={proactiveBriefings}
            onAcknowledgeBriefing={(id) => {
              setProactiveBriefings(prev =>
                prev.map(b => b.id === id ? { ...b, acknowledged: true } : b)
              );
            }}
            onTriggerSystemScan={() => {
              const scans = [
                { type: 'github' as const, details: { msg: 'Manual repository scan: 0 uncommitted alterations found in personal-os.', repo: 'personal-os' } },
                { type: 'deployment' as const, details: { msg: 'Cloud Run health ping successful. Container latency response is 24ms.', status: 'success' } },
                { type: 'calendar' as const, details: { msg: 'Stark calendar scan: all deep focus block timings verified for structural boundaries.' } }
              ];
              const randomScan = scans[Math.floor(Math.random() * scans.length)];
              triggerProactiveBriefing(randomScan.type, randomScan.details);
            }}
          />
        );
      case 'workspaces':
        return (
          <Workspaces
            projects={projects}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
          />
        );
      case 'braindump':
        return (
          <BrainDump
            projects={projects}
            onAddMemory={handleAddMemory}
            onAddTask={handleAddTask}
          />
        );
      case 'executive':
        return (
          <ExecutiveAI
            userId={user?.uid || null}
            projects={projects}
            tasks={tasks}
            events={events}
            values={values}
            mood="Optimized"
            stressLevel={4}
          />
        );
      case 'relationships':
        return (
          <RelationshipIntelligence
            relationships={relationships}
            onAddRelationship={handleAddRelationship}
          />
        );
      case 'decision':
        return <DecisionEngine values={values} />;
      case 'graph':
        return (
          <KnowledgeGraph
            projects={projects}
            relationships={relationships}
            memories={memories}
            values={values}
          />
        );
      case 'ailabs':
        return (
          <AILabs
            userId={user?.uid || null}
            projects={projects}
            onAddGeneratedMedia={(media) => {
              handleAddMemory({
                id: media.id,
                content: `Synthesized AI ${media.type}: "${media.prompt}" (${media.size || media.aspectRatio || ''})`,
                timestamp: media.createdAt,
                category: 'idea',
                tags: ['AI-Lab', media.type],
                summary: `New high quality ${media.type} generated`
              });
            }}
          />
        );
      case 'assistant':
        return (
          <VoiceAssistant
            agents={agents}
            activeAgent={activeAgent}
            onSelectAgent={handleSelectAgent}
            onAddMemory={(c, cat) => handleAddMemory({
              id: `vmem_${Date.now()}`,
              content: c,
              timestamp: new Date().toISOString(),
              category: cat,
              tags: ['Voice', 'Spontaneous'],
              summary: 'Fleeting voice note captured'
            })}
            unfinishedTasksCount={tasks.filter((t) => !t.completed).length}
            stressLevel={4}
          />
        );
      case 'compass':
        return (
          <InnerCompass
            userId={user?.uid || null}
            values={values}
            triggerSignal={pendingTriggerSignal}
            onClearSignal={() => setPendingTriggerSignal(null)}
          />
        );
      case 'twin':
        return (
          <DigitalTwin
            projects={projects}
            tasks={tasks}
            events={events}
            memories={memories}
            values={values}
            currentMetrics={metrics}
          />
        );
      default:
        return <div>Cockpit view undefined.</div>;
    }
  };

  // Nav definitions
  const navItems = [
    { view: 'dashboard', label: 'Main Cockpit', icon: Compass },
    { view: 'workspaces', label: 'Workspaces', icon: Briefcase },
    { view: 'braindump', label: 'Brain Dump', icon: BookOpen },
    { view: 'executive', label: 'Executive AI', icon: Calendar },
    { view: 'relationships', label: 'Relationships', icon: User },
    { view: 'decision', label: 'Decision Engine', icon: Scale },
    { view: 'graph', label: 'Knowledge Graph', icon: Network },
    { view: 'compass', label: 'Inner Compass', icon: Heart },
    { view: 'twin', label: 'Digital Twin', icon: Brain },
    { view: 'ailabs', label: 'AI Labs Studio', icon: Sparkles },
    { view: 'assistant', label: 'Voice Assistant', icon: Zap },
  ];

  if (focusModeActive) {
    return (
      <FocusMode
        tasks={tasks}
        onToggleFocusMode={() => setFocusModeActive(false)}
        onAddTask={handleAddTask}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#020408] text-white flex flex-col font-sans select-none overflow-x-hidden relative">
      {/* Background Holographic Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Primary Floating Header HUD */}
      <header className="sticky top-0 z-40 bg-[#020408]/80 border-b border-white/5 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 font-mono">
          <div className="w-9 h-9 rounded-lg border border-cyan-500/30 flex items-center justify-center bg-cyan-950/20 shadow-[0_0_15px_-5px_rgba(6,182,212,0.4)] animate-pulse">
            <Terminal className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-widest text-slate-100 uppercase">J.A.R.V.I.S. Personal OS</h1>
            <span className="text-[9px] text-cyan-500 uppercase tracking-wider block">System Intelligence Core v4.2</span>
          </div>
        </div>

        {/* Action center buttons */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-lg text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
              <span>{user.displayName || 'SECURE SAM'}</span>
              <button
                onClick={() => signOut(auth)}
                className="ml-2 hover:text-white transition cursor-pointer flex items-center"
                title="Secure Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => signInWithPopup(auth, googleProvider)}
              className="flex items-center space-x-1.5 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 px-3.5 py-1.5 rounded-lg text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition"
            >
              <LogIn className="w-3.5 h-3.5 mr-0.5" />
              <span>SECURE UPLINK LOGIN</span>
            </button>
          )}

          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center space-x-2 bg-white/5 border border-white/10 hover:border-white/20 px-3.5 py-1.5 rounded-lg text-[10px] font-mono text-white/80 hover:text-white transition"
          >
            <Command className="w-3.5 h-3.5 text-cyan-500" />
            <span>Search System</span>
            <span className="bg-white/10 text-[8px] text-white/40 px-1 py-0.5 rounded ml-1">⌘K</span>
          </button>

          <button
            onClick={() => setFocusModeActive(true)}
            className="flex items-center space-x-1.5 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 px-3.5 py-1.5 rounded-lg text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition uppercase tracking-wider shadow-[0_0_15px_-5px_rgba(34,211,238,0.3)]"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
            <span>AI Focus Mode</span>
          </button>
        </div>
      </header>

      {/* Floating Anomaly Alarm Banner */}
      <AnimatePresence>
        {showScatterAlert && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500/10 border-b border-white/5 px-6 py-3 flex items-center justify-between text-xs font-mono"
            id="attention-scatter-alarm-banner"
          >
            <div className="flex items-center space-x-2.5 text-red-400">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse mr-1" />
              <span>⚠️ <strong>[ATTENTION SCATTER DEVIATION]</strong> Sam, you are switching between modules rapidly ({viewSwitchHistory.length} times in 20s). Cognitive entropy is rising.</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                id="btn-trigger-scatter-calibration"
                onClick={() => {
                  setPendingTriggerSignal({ type: 'excessive_app_switching', timestamp: Date.now() });
                  setCurrentView('compass');
                  setShowScatterAlert(false);
                }}
                className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition cursor-pointer"
              >
                Initiate Inner Compass Recalibration
              </button>
              <button
                id="btn-dismiss-scatter-alert"
                onClick={() => setShowScatterAlert(false)}
                className="text-slate-400 hover:text-white px-2 py-1 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid Viewport */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-6 grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Floating Sidebar HUD Navigation */}
        <aside className="lg:col-span-1 space-y-3 font-mono text-xs">
          <span className="text-[9px] text-white/40 uppercase tracking-widest px-2.5 block mb-1">Cockpit Deck Modules</span>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isSelected = currentView === item.view;
              return (
                <button
                  key={item.view}
                  onClick={() => setCurrentView(item.view)}
                  className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-lg border text-left transition ${
                    isSelected
                      ? 'bg-white/10 border-white/20 text-cyan-400 shadow-[0_0_15px_-5px_rgba(34,211,238,0.3)]'
                      : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-white/40'}`} />
                  <span className="text-[11px] font-bold uppercase tracking-wider">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Center Canvas View Stage */}
        <main className="lg:col-span-4 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Command Palette search Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        memories={memories}
        relationships={relationships}
        projects={projects}
        onTriggerFocusMode={() => setFocusModeActive(true)}
        onTriggerAgentChange={(id) => {
          const matchedAg = agents.find((a) => a.id === id);
          if (matchedAg) setActiveAgent(matchedAg);
        }}
        onTriggerViewChange={setCurrentView}
      />
    </div>
  );
}

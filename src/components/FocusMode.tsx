import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Save, Sparkles, LogOut, CheckCircle, BrainCircuit } from 'lucide-react';
import { motion } from 'motion/react';
import { Task } from '../types';

interface FocusModeProps {
  tasks: Task[];
  onToggleFocusMode: () => void;
  onAddTask: (task: Task) => void;
}

export default function FocusMode({ tasks, onToggleFocusMode, onAddTask }: FocusModeProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(tasks.find(t => !t.completed)?.id || '');
  const [timeLeft, setTimeLeft] = useState(1500); // 25 mins default
  const [timerActive, setTimerActive] = useState(false);
  const [notes, setNotes] = useState('');
  const [breathingStage, setBreathingStage] = useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
  const [breathingCircleScale, setBreathingCircleScale] = useState(1);
  const [activeAmbient, setActiveAmbient] = useState<string>('workshop');
  const [volume, setVolume] = useState(50);
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  // Active task details
  const activeTask = tasks.find((t) => t.id === selectedTaskId);

  // Breathing simulation loop
  useEffect(() => {
    let interval: any;
    let counter = 0;
    
    interval = setInterval(() => {
      counter = (counter + 1) % 12; // 4s inhale, 4s hold, 4s exhale
      if (counter < 4) {
        setBreathingStage('Inhale');
        setBreathingCircleScale(1.4);
      } else if (counter < 8) {
        setBreathingStage('Hold');
        setBreathingCircleScale(1.4);
      } else {
        setBreathingStage('Exhale');
        setBreathingCircleScale(1.0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Timer loop
  useEffect(() => {
    let interval: any;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft]);

  // Audio simulation (Web Audio API lo-fi synth workshop hum)
  const toggleAmbientSound = () => {
    if (oscRef.current) {
      // Stop
      oscRef.current.stop();
      oscRef.current.disconnect();
      oscRef.current = null;
      return;
    }

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const gain = ctx.createGain();
      gain.gain.value = volume / 200; // soft volume
      gainNodeRef.current = gain;

      // Low frequency hum for Tony Stark workshop vibe
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.value = activeAmbient === 'workshop' ? 55 : activeAmbient === 'cosmic' ? 72 : 44;
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      oscRef.current = osc;
    } catch (e) {
      console.warn("Ambient Audio not initialized under browser constraints.");
    }
  };

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume / 200;
    }
  }, [volume]);

  // Cleanup audio
  useEffect(() => {
    return () => {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current.disconnect();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="fixed inset-0 z-55 bg-[#020408] flex flex-col justify-between p-6 overflow-hidden text-slate-100">
      {/* HUD Ambient Scan lines */}
      <div className="absolute inset-0 bg-scanlines opacity-5 pointer-events-none" />

      {/* Header Info */}
      <div className="flex justify-between items-center z-10 font-mono text-xs text-white/40">
        <div className="flex items-center space-x-2">
          <BrainCircuit className="w-5 h-5 text-cyan-400 animate-pulse" />
          <span className="uppercase tracking-widest text-white/60">JARVIS OS Focus Sphere</span>
        </div>
        <div className="text-right text-[10px]">
          <span className="block text-cyan-400">ACTIVE DIRECTIVE: MINIMAL NOISE</span>
          <span>EST. COGNITIVE CAPACITY RECOVERY: +35%</span>
        </div>
      </div>

      {/* Main Focus Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center max-w-6xl mx-auto w-full flex-1 my-6 z-10">
        
        {/* Left Side: Breathing Guide & Ambient */}
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 w-full text-center space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block">Inner Compass breath</span>
            
            {/* Pulsing visual element */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <motion.div
                animate={{ scale: breathingCircleScale }}
                transition={{ duration: 4, ease: 'easeInOut' }}
                className={`absolute inset-0 rounded-full border border-cyan-500/20 bg-cyan-500/5`}
              />
              <motion.div
                animate={{ scale: breathingCircleScale * 0.7 }}
                transition={{ duration: 4, ease: 'easeInOut' }}
                className={`absolute w-24 h-24 rounded-full border border-cyan-400/40 bg-cyan-500/10 flex flex-col items-center justify-center shadow-[0_0_20px_-5px_rgba(34,211,238,0.3)]`}
              >
                <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">{breathingStage}</span>
              </motion.div>
            </div>
            <p className="text-[10px] font-mono text-white/50 mt-2">Harmonize breathing: 4s Inhale, 4s Hold, 4s Exhale</p>
          </div>

          {/* Ambient Player */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 w-full space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest block text-center">Ambient Workshopizer</span>
            
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {[
                { id: 'workshop', label: 'Stark Workshop' },
                { id: 'cosmic', label: 'Cosmic Noise' },
              ].map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => { setActiveAmbient(sound.id); if (oscRef.current) toggleAmbientSound(); }}
                  className={`py-2 px-3 rounded border text-center transition ${
                    activeAmbient === sound.id
                      ? 'bg-white/10 border-white/20 text-cyan-400 shadow-[0_0_15px_-5px_rgba(34,211,238,0.3)]'
                      : 'bg-white/5 border border-white/5 text-white/50 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  {sound.label}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-3 text-xs font-mono">
              <button
                onClick={toggleAmbientSound}
                className={`flex-1 py-2 rounded font-bold uppercase tracking-wider text-center border transition ${
                  oscRef.current
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-white/5 border border-white/5 text-white/70 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                {oscRef.current ? 'Mute Workspace Hum' : 'Play Workspace Hum'}
              </button>

              <div className="flex items-center space-x-1">
                <Volume2 className="w-3.5 h-3.5 text-white/40" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-16 h-1 bg-white/5 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center Side: Pulsing Timer & Task selector */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Main Focus task display */}
          <div className="text-center space-y-2">
            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Singular Objective Locked</span>
            
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="bg-transparent text-white font-sans text-lg font-bold border-0 text-center focus:ring-0 outline-none max-w-md mx-auto block cursor-pointer"
            >
              {tasks.filter((t) => !t.completed).map((task) => (
                <option key={task.id} value={task.id} className="bg-[#020408] text-white/85 text-xs">
                  {task.title}
                </option>
              ))}
            </select>
            <p className="text-[11px] font-mono text-white/40 uppercase">
              Project: {activeTask ? activeTask.category : 'General'}
            </p>
          </div>

          {/* Glowing Timer */}
          <div className="relative flex flex-col items-center justify-center">
            {/* outer radial halo */}
            <div className="absolute w-64 h-64 border border-cyan-500/10 rounded-full animate-pulse shadow-[0_0_30px_rgba(34,211,238,0.1)]" />
            <div className="text-6xl font-mono tracking-tight font-semibold text-white">
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3 text-xs font-mono">
            <button
              onClick={() => setTimerActive(!timerActive)}
              className="px-6 py-2.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 rounded-full font-bold uppercase tracking-wider transition shadow-[0_0_15px_-5px_rgba(34,211,238,0.3)]"
            >
              {timerActive ? 'Pause Session' : 'Initiate Lockout'}
            </button>
            <button
              onClick={() => { setTimerActive(false); setTimeLeft(1500); }}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-white/50 hover:text-white transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Scratchpad & Progress */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 h-[340px] flex flex-col justify-between font-mono text-xs shadow-[0_4px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl">
          <div className="flex flex-col space-y-3 flex-1">
            <div className="flex items-center space-x-1 text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Deep workspace Scratchpad</span>
            </div>
            <textarea
              placeholder="Scribble down ephemeral thoughts or bugs encountered instantly. Thoughts recorded here are indexable when focus deactivates..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full flex-1 bg-black/20 border border-white/10 rounded p-3 text-xs text-white placeholder-white/20 outline-none focus:border-cyan-500/20 font-sans resize-none"
            />
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-3">
            <span className="text-[10px] text-white/40">Auto-saved in focus local memory cache</span>
            <button
              onClick={() => {
                if (notes.trim()) {
                  onAddTask({
                    id: `focus_task_${Date.now()}`,
                    title: `Scribbled focus note: ${notes.slice(0, 40)}...`,
                    completed: false,
                    dueDate: new Date().toISOString().split('T')[0],
                    priority: 'medium',
                    category: activeTask?.category || 'Life',
                  });
                  setNotes('');
                  alert('Scribble index task queued.');
                }
              }}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 transition uppercase tracking-wider flex items-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Queue scribble</span>
            </button>
          </div>
        </div>

      </div>

      {/* Footer controls: Deactivate Focus */}
      <div className="flex justify-between items-center z-10 font-mono text-xs text-white/40 border-t border-white/5 pt-4 font-mono">
        <span>JARVIS OFF-GRID SAFE LOCK ACTIVE</span>
        <button
          onClick={() => {
            if (oscRef.current) toggleAmbientSound();
            onToggleFocusMode();
          }}
          className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-500/40 text-[10px] text-white/50 hover:text-red-400 rounded uppercase tracking-wider transition flex items-center space-x-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Deactivate Focus Sphere</span>
        </button>
      </div>
    </div>
  );
}

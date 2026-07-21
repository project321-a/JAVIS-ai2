import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Cpu,
  Layers,
  Radio,
  Wifi,
  ChevronRight,
  Shield,
  Activity,
  Zap,
  Terminal as TermIcon
} from 'lucide-react';
import { AgentMind } from '../types';

interface JarvisHudCoreProps {
  onAddMemory?: (content: string, category: 'voice' | 'idea') => void;
  unfinishedTasksCount?: number;
  stressLevel?: number;
  onTriggerVoiceAssistant?: () => void;
}

export default function JarvisHudCore({
  onAddMemory,
  unfinishedTasksCount = 4,
  stressLevel = 4,
  onTriggerVoiceAssistant
}: JarvisHudCoreProps) {
  const [chatInput, setChatInput] = useState('');
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [speechActive, setSpeechActive] = useState(true);
  const [activeMind, setActiveMind] = useState<'architect' | 'compass' | 'growth'>('architect');
  const [voiceActivationEnabled, setVoiceActivationEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('jarvis_voice_activation') === 'true';
    }
    return false;
  });
  const [telemetry, setTelemetry] = useState({
    coherence: 98.4,
    attention: 92,
    entropy: 12,
    quantumPing: 18,
    activeSubsystems: 8
  });
  
  // Chat Log with typewriter subtitle support
  const [currentSubtitle, setCurrentSubtitle] = useState("Awaiting voice command or cognitive query, Sam. Golden Core is fully synchronized.");
  const [subtitleQueue, setSubtitleQueue] = useState<string[]>([]);
  const [displayedSubtitle, setDisplayedSubtitle] = useState("");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const subtitleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Subtitle typewriter effect
  useEffect(() => {
    if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
    
    let i = 0;
    setDisplayedSubtitle("");
    
    if (!currentSubtitle) return;

    subtitleIntervalRef.current = setInterval(() => {
      setDisplayedSubtitle((prev) => prev + currentSubtitle.charAt(i));
      i++;
      if (i >= currentSubtitle.length) {
        if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
      }
    }, 15); // Fast, high-tech typing

    return () => {
      if (subtitleIntervalRef.current) clearInterval(subtitleIntervalRef.current);
    };
  }, [currentSubtitle]);

  // Telemetry fluctuation simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry((prev) => ({
        coherence: parseFloat((98 + Math.sin(Date.now() / 5000) * 1.5).toFixed(2)),
        attention: Math.floor(90 + Math.sin(Date.now() / 8000) * 6),
        entropy: Math.floor(10 + Math.random() * 5),
        quantumPing: Math.floor(15 + Math.random() * 6),
        activeSubsystems: 7 + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Sync Voice Activation with localStorage
  useEffect(() => {
    localStorage.setItem('jarvis_voice_activation', String(voiceActivationEnabled));
  }, [voiceActivationEnabled]);

  // Continuous background keyword detection
  useEffect(() => {
    if (!voiceActivationEnabled) return;

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      console.warn("Speech recognition not supported in this environment.");
      return;
    }

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    let recognition: any = null;
    let shouldRestart = true;

    const startRecognition = () => {
      try {
        recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript.toLowerCase();
            if (
              transcript.includes('jarvis') ||
              transcript.includes('assistant') ||
              transcript.includes('hey jarvis') ||
              transcript.includes('open assistant')
            ) {
              shouldRestart = false;
              recognition.stop();
              
              if (speechActive && 'speechSynthesis' in window) {
                const confUtterance = new SpeechSynthesisUtterance("Vocal match confirmed. Launching voice assistant view, Sam.");
                window.speechSynthesis.speak(confUtterance);
              }
              
              if (onTriggerVoiceAssistant) {
                onTriggerVoiceAssistant();
              }
              break;
            }
          }
        };

        recognition.onerror = (err: any) => {
          if (err.error !== 'no-speech') {
            console.warn("Background keyword listener error:", err.error);
          }
        };

        recognition.onend = () => {
          if (shouldRestart && voiceActivationEnabled) {
            setTimeout(() => {
              if (shouldRestart && voiceActivationEnabled) {
                startRecognition();
              }
            }, 1000);
          }
        };

        recognition.start();
      } catch (err) {
        console.error("Background continuous listener failed:", err);
      }
    };

    startRecognition();

    return () => {
      shouldRestart = false;
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) {}
      }
    };
  }, [voiceActivationEnabled, onTriggerVoiceAssistant, speechActive]);

  // Hologram Circular Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let rotationAngle = 0;
    let waveOffset = 0;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const cx = rect.width / 2;
    const cy = rect.height / 2;

    const render = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      
      rotationAngle += 0.005;
      waveOffset += 0.08;

      // Color Theme constants - Warm Amber/Gold
      const primaryColor = 'rgba(255, 157, 0, ';
      const accentColor = 'rgba(255, 85, 0, ';
      const glowColor = 'rgba(255, 200, 100, ';

      // 1. Core Background Grid Rings
      ctx.strokeStyle = primaryColor + '0.08)';
      ctx.lineWidth = 1;
      for (let r = 40; r <= 160; r += 40) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Crosshairs
      ctx.beginPath();
      ctx.moveTo(cx - 180, cy); ctx.lineTo(cx + 180, cy);
      ctx.moveTo(cx, cy - 180); ctx.lineTo(cx, cy + 180);
      ctx.stroke();

      // 2. Animated Outer Concentric Arc Tracks
      ctx.strokeStyle = primaryColor + '0.35)';
      ctx.lineWidth = 1.5;
      
      // Arc 1 (Clockwise)
      ctx.beginPath();
      ctx.arc(cx, cy, 140, rotationAngle, rotationAngle + Math.PI * 0.45);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 140, rotationAngle + Math.PI, rotationAngle + Math.PI * 1.45);
      ctx.stroke();

      // Arc 2 (Counter-Clockwise)
      ctx.strokeStyle = accentColor + '0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 125, -rotationAngle * 1.5, -rotationAngle * 1.5 + Math.PI * 0.3);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 125, -rotationAngle * 1.5 + Math.PI, -rotationAngle * 1.5 + Math.PI * 1.3);
      ctx.stroke();

      // Arc 3: Dashed gauge track
      ctx.strokeStyle = primaryColor + '0.15)';
      ctx.lineWidth = 4;
      ctx.setLineDash([4, 12]);
      ctx.beginPath();
      ctx.arc(cx, cy, 105, rotationAngle * 0.5, rotationAngle * 0.5 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      // 3. Digital Ticks on outer ring
      ctx.strokeStyle = primaryColor + '0.4)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 60; i += 5) {
        const angle = (i * Math.PI * 2) / 60 + rotationAngle * 0.2;
        const startR = 145;
        const endR = 152;
        const x1 = cx + Math.cos(angle) * startR;
        const y1 = cy + Math.sin(angle) * startR;
        const x2 = cx + Math.cos(angle) * endR;
        const y2 = cy + Math.sin(angle) * endR;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // 4. Centrifugal Particle Field (Glow Nodes)
      const particleCount = status === 'thinking' ? 30 : status === 'speaking' ? 24 : 12;
      const speedMultiplier = status === 'thinking' ? 2 : status === 'speaking' ? 1.4 : 1;
      for (let p = 0; p < particleCount; p++) {
        const indexAngle = (p * Math.PI * 2) / particleCount + rotationAngle * speedMultiplier;
        const distance = 80 + Math.sin(waveOffset + p) * 15;
        const px = cx + Math.cos(indexAngle) * distance;
        const py = cy + Math.sin(indexAngle) * distance;

        ctx.fillStyle = primaryColor + '0.7)';
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Connector line
        ctx.strokeStyle = primaryColor + '0.04)';
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.stroke();
      }

      // 5. Sound Wave / Speech Core Visualizer
      let coreGlowIntensity = 0.15;
      let waveAmp = 4;

      if (status === 'thinking') {
        coreGlowIntensity = 0.35 + Math.sin(waveOffset * 1.5) * 0.1;
        waveAmp = 12 + Math.sin(waveOffset) * 6;
      } else if (status === 'speaking') {
        coreGlowIntensity = 0.45 + Math.sin(waveOffset * 2.5) * 0.25;
        waveAmp = 25 + Math.cos(waveOffset * 3) * 18;
      } else if (status === 'listening') {
        coreGlowIntensity = 0.3 + Math.sin(waveOffset * 4) * 0.15;
        waveAmp = 16 + Math.abs(Math.sin(waveOffset * 2)) * 14;
      }

      // Draw glowing central background
      const coreGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 65);
      coreGrad.addColorStop(0, glowColor + coreGlowIntensity + ')');
      coreGrad.addColorStop(0.4, primaryColor + (coreGlowIntensity * 0.4) + ')');
      coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, 65, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic Spherical Wave Line
      ctx.strokeStyle = primaryColor + '0.85)';
      ctx.shadowColor = glowColor + '0.6)';
      ctx.shadowBlur = 10;
      ctx.lineWidth = 2.5;
      
      ctx.beginPath();
      const wavePointsCount = 120;
      for (let i = 0; i <= wavePointsCount; i++) {
        const angle = (i * Math.PI * 2) / wavePointsCount;
        
        // Add noise based on wave Offset
        const frequency = 8;
        const waveValue = Math.sin(angle * frequency + waveOffset) * waveAmp;
        const currentRadius = 50 + waveValue;
        
        const wx = cx + Math.cos(angle) * currentRadius;
        const wy = cy + Math.sin(angle) * currentRadius;

        if (i === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      // Center Core Dot
      ctx.fillStyle = glowColor + '1)';
      ctx.beginPath();
      ctx.arc(cx, cy, status === 'speaking' ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();

      // Sub-radar scan line
      ctx.strokeStyle = accentColor + '0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      const scanX = cx + Math.cos(rotationAngle * 1.8) * 140;
      const scanY = cy + Math.sin(rotationAngle * 1.8) * 140;
      ctx.lineTo(scanX, scanY);
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [status]);

  // Send Cognitive Message to Back-end API
  const handleSendPrompt = async (promptToSend: string) => {
    if (!promptToSend.trim()) return;

    setStatus('thinking');
    setCurrentSubtitle(`Thinking... Orchestrating Mind: [${activeMind.toUpperCase()}]`);

    try {
      const response = await fetch('/api/jarvis/think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptToSend,
          agentId: activeMind === 'architect' ? 'developer' : activeMind === 'compass' ? 'therapist' : 'marketing',
          history: [
            { role: 'user', content: promptToSend }
          ],
          currentContext: {
            activeProject: 'StreamAIV Golden HUD',
            unfinishedTasksCount,
            stressLevel,
          }
        })
      });

      const data = await response.json();

      if (response.ok && data.text) {
        setStatus('speaking');
        setCurrentSubtitle(data.text);

        // Speech playback
        if (speechActive && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const speechText = data.text.replace(/[*#_`\-]/g, '');
          const utterance = new SpeechSynthesisUtterance(speechText);
          
          // Configure speech parameters to sound like J.A.R.V.I.S. (Crisp, premium British accent if available)
          const voices = window.speechSynthesis.getVoices();
          const britishVoice = voices.find(v => v.lang.includes('GB') || v.name.includes('Daniel') || v.name.includes('Google UK'));
          if (britishVoice) {
            utterance.voice = britishVoice;
          }
          utterance.rate = 1.05;
          utterance.pitch = 0.9; // Lower pitch for a mature tone
          
          utterance.onend = () => {
            setStatus('idle');
          };
          utterance.onerror = () => {
            setStatus('idle');
          };
          speechUtteranceRef.current = utterance;
          window.speechSynthesis.speak(utterance);
        } else {
          // Speak fallback simulation
          setTimeout(() => setStatus('idle'), 4000);
        }

        if (onAddMemory && (promptToSend.toLowerCase().includes('remember') || promptToSend.toLowerCase().includes('save'))) {
          onAddMemory(promptToSend, 'idea');
        }
      } else {
        setStatus('idle');
        setCurrentSubtitle("Systems encountered a localized rate-limit event, Sam. Local cognitive cache is maintaining focus bounds.");
      }
    } catch (err) {
      console.error(err);
      setStatus('idle');
      setCurrentSubtitle("Connection compromised, Sam. I am operating on emergency backup processors. Please check your network matrix.");
    }
    setChatInput("");
  };

  // Local browser Speech Recognition
  const toggleListening = () => {
    if (status === 'listening') {
      setStatus('idle');
      return;
    }

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setCurrentSubtitle("Speech recognition is not natively supported in this sandbox environment. Typing is fully active.");
      return;
    }

    setStatus('listening');
    setCurrentSubtitle("Listening... Speak clearly into your authorized vocal receptor.");

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e: any) => {
      const result = e.results[0][0].transcript;
      setCurrentSubtitle(`Vocal instruction registered: "${result}"`);
      handleSendPrompt(result);
    };

    recognition.onerror = (e: any) => {
      console.warn("Speech error:", e);
      setStatus('idle');
      setCurrentSubtitle("Vocal stream disrupted. Standby console is active.");
    };

    recognition.onend = () => {
      if (status === 'listening') {
        setStatus('idle');
      }
    };

    recognition.start();
  };

  return (
    <div className="bg-[#020408]/90 border border-amber-500/30 rounded-2xl p-6 backdrop-blur-2xl shadow-[0_0_50px_rgba(245,158,11,0.1)] relative overflow-hidden flex flex-col items-center">
      
      {/* Decorative Styling Block for glowing elements */}
      <style>{`
        @keyframes scanGlow {
          0% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
          100% { opacity: 0.3; transform: scale(1); }
        }
        .jarvis-glow-ring {
          animation: scanGlow 4s infinite ease-in-out;
        }
      `}</style>

      {/* Cybernetic Corner Borders */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/50 rounded-tl-lg pointer-events-none" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-500/50 rounded-tr-lg pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-500/50 rounded-bl-lg pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/50 rounded-br-lg pointer-events-none" />

      {/* Header telemetry band */}
      <div className="w-full flex items-center justify-between border-b border-amber-500/20 pb-4 mb-5 font-mono text-[10px]">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-500 font-bold tracking-widest uppercase">COGNITIVE QUANTUM CORE</span>
        </div>
        
        <div className="flex items-center space-x-5 text-slate-400">
          <div>
            COHERENCE: <span className="text-amber-400 font-bold">{telemetry.coherence}%</span>
          </div>
          <div className="hidden sm:block">
            ATTENTION ID: <span className="text-amber-400 font-bold">{telemetry.attention}/100</span>
          </div>
          <div>
            PING: <span className="text-amber-400 font-bold">{telemetry.quantumPing}ms</span>
          </div>
        </div>
      </div>

      {/* Primary HUD Circular Deck Canvas */}
      <div className="relative w-full max-w-[320px] aspect-square flex items-center justify-center my-2 jarvis-glow-ring">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-pointer"
          onClick={toggleListening}
          title="Click Hologram Core to toggle voice capture"
        />

        {/* Center UI Overlay Text */}
        <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center font-mono">
          <span className="text-[10px] uppercase text-amber-500/60 tracking-widest font-bold">CORE RADAR</span>
          <span className="text-xl font-black text-amber-400 tracking-wider mt-0.5 uppercase drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
            {status === 'idle' ? 'STANDBY' : status.toUpperCase()}
          </span>
          <span className="text-[8px] text-slate-400 uppercase mt-1 tracking-wider">
            SAM_SYS_ACTIVE
          </span>
        </div>
      </div>

      {/* Subtitles Readout Section */}
      <div className="w-full bg-black/40 border border-amber-500/10 rounded-xl p-4 my-4 font-mono min-h-[82px] flex items-start space-x-3.5 relative">
        <div className="absolute top-2.5 right-2.5 flex items-center space-x-1.5 text-[8px] text-amber-500/55 uppercase tracking-wider">
          <Radio className="w-3 h-3 text-amber-500 animate-pulse" />
          <span>REAL-TIME DECRYPTED UPLINK</span>
        </div>

        <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg shrink-0 mt-0.5">
          <Activity className="w-4 h-4 text-amber-400 animate-pulse" />
        </div>

        <div className="space-y-1 select-text">
          <span className="text-[9px] text-amber-500/60 uppercase font-bold block tracking-wider">JARVIS TRANSMISSION</span>
          <p className="text-[11px] text-amber-100 font-sans leading-relaxed tracking-wide min-h-[36px]">
            {displayedSubtitle}
            <span className="w-1.5 h-3.5 bg-amber-400 ml-1 inline-block animate-pulse align-middle" />
          </p>
        </div>
      </div>

      {/* Interactive Controls & Input Band */}
      <div className="w-full space-y-4">
        
        {/* Voice Activation persistent toggle */}
        <div className="flex items-center justify-between bg-amber-500/5 border border-amber-500/10 rounded-xl px-4 py-2.5 text-[10px] font-mono">
          <div className="flex items-center space-x-2">
            <Radio className={`w-3.5 h-3.5 ${voiceActivationEnabled ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-slate-300 uppercase tracking-wider">Voice Activation (Continuous Keyword)</span>
          </div>
          <button
            onClick={() => setVoiceActivationEnabled(!voiceActivationEnabled)}
            className={`px-2.5 py-1 rounded border text-[9px] font-bold uppercase tracking-wider transition cursor-pointer ${
              voiceActivationEnabled
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                : 'bg-transparent border-white/10 text-slate-400 hover:text-white'
            }`}
          >
            {voiceActivationEnabled ? 'ACTIVE: "JARVIS"' : 'OFF'}
          </button>
        </div>

        {/* Quick Mind Configuration selector */}
        <div className="flex items-center justify-center space-x-2 border-t border-b border-amber-500/10 py-3 text-[10px] font-mono">
          <span className="text-slate-400 uppercase mr-1">Cognitive Vector:</span>
          
          <button
            onClick={() => setActiveMind('architect')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              activeMind === 'architect'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-transparent border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Lead Architect
          </button>

          <button
            onClick={() => setActiveMind('compass')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              activeMind === 'compass'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-transparent border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Inner Compass
          </button>

          <button
            onClick={() => setActiveMind('growth')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              activeMind === 'growth'
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-transparent border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Viral Growth
          </button>
        </div>

        {/* Input Text Form */}
        <div className="flex items-center space-x-2 bg-black/40 border border-amber-500/20 rounded-xl p-1.5">
          <button
            onClick={toggleListening}
            className={`p-3 rounded-xl border transition ${
              status === 'listening'
                ? 'bg-red-500/20 border-red-500/40 text-red-400 animate-pulse'
                : 'bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20'
            }`}
            title="Toggle Voice Capture"
          >
            {status === 'listening' ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
          </button>

          <input
            type="text"
            placeholder={`Instruct J.A.R.V.I.S. (${activeMind})...`}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendPrompt(chatInput)}
            className="flex-1 bg-transparent border-none outline-none text-xs text-amber-100 font-mono px-2 placeholder-amber-500/40"
          />

          <button
            onClick={() => setSpeechActive(!speechActive)}
            className={`p-3 rounded-xl border transition ${
              speechActive
                ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
            }`}
            title={speechActive ? "Mute JARVIS vocal response" : "Unmute JARVIS vocal response"}
          >
            {speechActive ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
          </button>

          <button
            onClick={() => handleSendPrompt(chatInput)}
            className="p-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl transition shadow-[0_0_15px_rgba(245,158,11,0.4)]"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>

      </div>

    </div>
  );
}

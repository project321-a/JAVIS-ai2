import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, Volume2, Sparkles, AlertTriangle, Play, Pause } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AgentMind } from '../types';

interface WaveformVisualizerProps {
  isListening: boolean;
}

function WaveformVisualizer({ isListening }: WaveformVisualizerProps) {
  if (!isListening) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, height: 0 }}
      animate={{ opacity: 1, scale: 1, height: 'auto' }}
      exit={{ opacity: 0, scale: 0.95, height: 0 }}
      className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3 mb-3 flex items-center justify-between backdrop-blur-md relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-rose-500/5 via-transparent to-rose-500/5 pointer-events-none" />

      <div className="flex items-center space-x-2.5 z-10">
        <div className="relative flex items-center justify-center">
          <span className="absolute w-2 h-2 bg-rose-500 rounded-full animate-ping" />
          <span className="w-2 h-2 bg-rose-500 rounded-full" />
        </div>
        <div>
          <span className="font-mono text-[9px] uppercase tracking-widest text-rose-400 font-bold block">
            Capturing Audio Channel
          </span>
          <span className="font-mono text-[8px] uppercase tracking-wider text-slate-400 block mt-0.5">
            Voice Stream: Active
          </span>
        </div>
      </div>

      <div className="flex items-center justify-center space-x-1 h-8 z-10 px-4">
        {Array.from({ length: 28 }).map((_, i) => {
          const distanceFromCenter = Math.abs(i - 13.5);
          const maxPossibleHeight = Math.max(4, 32 - distanceFromCenter * 1.8);
          
          return (
            <motion.div
              key={i}
              animate={{
                height: [
                  '4px',
                  `${Math.max(4, Math.random() * maxPossibleHeight)}px`,
                  '4px'
                ]
              }}
              transition={{
                repeat: Infinity,
                duration: 0.45 + (i % 4) * 0.08,
                ease: "easeInOut"
              }}
              className="w-1 bg-gradient-to-t from-rose-500 via-pink-500 to-amber-400 rounded-full"
            />
          );
        })}
      </div>

      <div className="text-right z-10 hidden sm:block">
        <span className="font-mono text-[9px] text-rose-400 uppercase tracking-widest block font-bold">
          J.A.R.V.I.S. Standby
        </span>
        <span className="font-mono text-[8px] text-slate-400 uppercase block mt-0.5">
          Sampling @ 16kHz
        </span>
      </div>
    </motion.div>
  );
}

interface VoiceAssistantProps {
  agents: AgentMind[];
  activeAgent: AgentMind;
  onSelectAgent: (agent: AgentMind) => void;
  onAddMemory: (content: string, category: 'voice' | 'idea') => void;
  unfinishedTasksCount: number;
  stressLevel: number;
}

export default function VoiceAssistant({
  agents,
  activeAgent,
  onSelectAgent,
  onAddMemory,
  unfinishedTasksCount,
  stressLevel,
}: VoiceAssistantProps) {
  const [chatInput, setChatInput] = useState('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'jarvis'; text: string; time: string }[]>([
    { sender: 'jarvis', text: "Systems online, Sam. I've finished auditing your project repos. Deployment blocks detected on StreamAIV, but overall cognitive parameters look stable.", time: '05:49 AM' }
  ]);
  const [status, setStatus] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [speechSynthesisActive, setSpeechSynthesisActive] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Live API WebSocket Voice Link states
  const [isLiveLinkActive, setIsLiveLinkActive] = useState(false);
  const liveWsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const micProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const liveNextStartTimeRef = useRef<number>(0);

  // Auto scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  // Clean up Live voice links on component unmount
  useEffect(() => {
    return () => {
      if (liveWsRef.current) liveWsRef.current.close();
      if (micProcessorRef.current) micProcessorRef.current.disconnect();
      if (inputAudioCtxRef.current) inputAudioCtxRef.current.close();
      if (outputAudioCtxRef.current) outputAudioCtxRef.current.close();
    };
  }, []);

  const startLiveLink = async () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/jarvis/live`;
      const ws = new WebSocket(wsUrl);
      liveWsRef.current = ws;

      ws.onopen = async () => {
        setIsLiveLinkActive(true);
        setStatus('listening');
        setChatLog((prev) => [
          ...prev,
          { sender: 'jarvis', text: "[Real-Time Audio Link Connected] Speak directly to J.A.R.V.I.S., Sam.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);

        try {
          const inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          const outputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          inputAudioCtxRef.current = inputAudioCtx;
          outputAudioCtxRef.current = outputAudioCtx;

          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const source = inputAudioCtx.createMediaStreamSource(stream);
          const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
          micProcessorRef.current = processor;

          source.connect(processor);
          processor.connect(inputAudioCtx.destination);

          processor.onaudioprocess = (e) => {
            if (ws.readyState !== WebSocket.OPEN) return;
            const inputData = e.inputBuffer.getChannelData(0);
            
            // down-sample float32 array to 16-bit PCM buffer
            const buffer = new ArrayBuffer(inputData.length * 2);
            const view = new DataView(buffer);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            }

            // array buffer to base64
            let binary = "";
            const bytes = new Uint8Array(buffer);
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64 = window.btoa(binary);

            ws.send(JSON.stringify({ audio: base64 }));
          };
        } catch (err: any) {
          console.error("Mic access error on live link setup:", err);
          setChatLog((prev) => [
            ...prev,
            { sender: 'jarvis', text: `Failed to bind micro channel: ${err.message}`, time: 'ERROR' }
          ]);
          stopLiveLink();
        }
      };

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.audio) {
            setStatus('speaking');
            const outputCtx = outputAudioCtxRef.current;
            if (!outputCtx) return;

            const binary = window.atob(msg.audio);
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
              bytes[i] = binary.charCodeAt(i);
            }

            const int16Array = new Int16Array(bytes.buffer);
            const floatArray = new Float32Array(int16Array.length);
            for (let i = 0; i < int16Array.length; i++) {
              floatArray[i] = int16Array[i] / 32768.0;
            }

            const buffer = outputCtx.createBuffer(1, floatArray.length, 24000);
            buffer.copyToChannel(floatArray, 0);

            const source = outputCtx.createBufferSource();
            source.buffer = buffer;
            source.connect(outputCtx.destination);

            const now = outputCtx.currentTime;
            if (liveNextStartTimeRef.current < now) {
              liveNextStartTimeRef.current = now;
            }
            source.start(liveNextStartTimeRef.current);
            liveNextStartTimeRef.current += buffer.duration;

            setTimeout(() => {
              if (outputCtx.currentTime >= liveNextStartTimeRef.current - 0.1) {
                setStatus('listening');
              }
            }, buffer.duration * 1000 + 50);
          }

          if (msg.interrupted) {
            liveNextStartTimeRef.current = 0;
            setStatus('listening');
          }
        } catch (err) {
          console.error("Live voice chunk decoding failed:", err);
        }
      };

      ws.onclose = () => {
        setIsLiveLinkActive(false);
        setStatus('idle');
        setChatLog((prev) => [
          ...prev,
          { sender: 'jarvis', text: "[Live API Link Terminated] Reverting to standby console.", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      };

      ws.onerror = (err) => {
        console.error("Live WebSocket Link error:", err);
        stopLiveLink();
      };
    } catch (err: any) {
      console.error("Failed to boot live Link:", err);
      setIsLiveLinkActive(false);
      setStatus('idle');
    }
  };

  const stopLiveLink = () => {
    if (liveWsRef.current) {
      liveWsRef.current.close();
      liveWsRef.current = null;
    }
    if (micProcessorRef.current) {
      micProcessorRef.current.disconnect();
      micProcessorRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }
    setIsLiveLinkActive(false);
    setStatus('idle');
  };

  // Hologram Visualization Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const renderWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      frame++;

      // Change design based on current state
      let ringColor = 'rgba(6, 182, 212, '; // Cyan for idle/listening
      let speed = 0.05;
      let particleCount = 20;
      let radiusMultiplier = 1;

      if (status === 'thinking') {
        ringColor = 'rgba(168, 85, 247, '; // Purple for thinking
        speed = 0.1;
        particleCount = 35;
      } else if (status === 'speaking') {
        ringColor = 'rgba(16, 185, 129, '; // Emerald green for speaking
        speed = 0.07;
        radiusMultiplier = 1 + Math.sin(frame * 0.15) * 0.12;
        particleCount = 25;
      } else if (status === 'listening') {
        ringColor = 'rgba(239, 68, 68, '; // Red for listening
        speed = 0.12;
        radiusMultiplier = 1 + Math.sin(frame * 0.25) * 0.15;
        particleCount = 30;
      }

      // Draw glowing background orb
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 80);
      grad.addColorStop(0, ringColor + '0.25)');
      grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, 80, 0, Math.PI * 2);
      ctx.fill();

      // Outer HUD rings
      ctx.strokeStyle = ringColor + '0.4)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, 55 * radiusMultiplier, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = ringColor + '0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([10, 8]);
      ctx.beginPath();
      ctx.arc(cx, cy, 65 * radiusMultiplier, frame * 0.01, frame * 0.01 + Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]); // Reset

      // Sine wave nodes inside core
      ctx.strokeStyle = ringColor + '0.75)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      for (let i = 0; i < canvas.width; i++) {
        const x = i;
        const normX = (i - cx) / (canvas.width / 4);
        const amp = Math.max(0, 1 - normX * normX) * (status === 'speaking' || status === 'listening' ? 24 : 6);
        const y = cy + Math.sin(i * 0.08 + frame * speed) * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Cyber particles floating around orbit
      for (let p = 0; p < particleCount; p++) {
        const angle = (p * Math.PI * 2) / particleCount + (frame * speed * 0.2);
        const distance = (45 + Math.sin(frame * 0.02 + p) * 10) * radiusMultiplier;
        const px = cx + Math.cos(angle) * distance;
        const py = cy + Math.sin(angle) * distance;

        ctx.fillStyle = ringColor + '0.8)';
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(renderWave);
    };

    renderWave();

    return () => cancelAnimationFrame(animId);
  }, [status]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { sender: 'user' as const, text: textToSend, time: timeStr };
    setChatLog((prev) => [...prev, userMsg]);
    setChatInput('');
    setStatus('thinking');

    try {
      const response = await fetch('/api/jarvis/think', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          agentId: activeAgent.id,
          history: chatLog.map((log) => ({
            role: log.sender === 'user' ? 'user' : 'assistant',
            content: log.text,
          })),
          currentContext: {
            activeProject: 'StreamAIV Workspace',
            unfinishedTasksCount,
            stressLevel,
          },
        }),
      });

      const data = await response.json();

      if (response.ok && data.text) {
        setStatus('speaking');
        setChatLog((prev) => [
          ...prev,
          { sender: 'jarvis', text: data.text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);

        // Synthesize speech if active
        if (speechSynthesisActive && 'speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          // Clean markdown before speaking
          const cleanSpeechText = data.text.replace(/[*#_`\-]/g, '');
          const utterance = new SpeechSynthesisUtterance(cleanSpeechText.slice(0, 300)); // limit speech length
          utterance.onend = () => setStatus('idle');
          window.speechSynthesis.speak(utterance);
        } else {
          // Fallback timer simulating talking
          setTimeout(() => setStatus('idle'), 2500);
        }

        // Auto add to memory if it looks like an idea
        if (textToSend.toLowerCase().includes('idea') || textToSend.toLowerCase().includes('remember')) {
          onAddMemory(textToSend, 'idea');
        }
      } else {
        setStatus('idle');
        setChatLog((prev) => [
          ...prev,
          { sender: 'jarvis', text: `Uplink compromised: ${data.error || 'Cognitive sub-routine delayed.'}`, time: timeStr }
        ]);
      }
    } catch (error) {
      setStatus('idle');
      setChatLog((prev) => [
        ...prev,
        { sender: 'jarvis', text: "Uplink offline. I can't establish communication with the cloud core, Sam.", time: timeStr }
      ]);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition is not natively supported in this environment browser iframe. Typing in command panel remains active.');
      return;
    }

    setStatus('listening');
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRec();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      handleSendMessage(speechToText);
    };

    recognition.onerror = () => {
      setStatus('idle');
    };

    recognition.onend = () => {
      if (status === 'listening') setStatus('idle');
    };

    recognition.start();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Mind Deck Selector */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl flex flex-col justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="w-4.5 h-4.5 text-cyan-400" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-white/80">JARVIS Cognitive Minds</h3>
          </div>
          <p className="text-[11px] font-mono text-white/40 mb-4 leading-relaxed">
            Multi-agent orchestration allows switching context minds. All agents share the same long-term memory stack but assume highly customized perspectives.
          </p>

          <div className="space-y-2.5">
            {agents.map((ag) => {
              const isActive = activeAgent.id === ag.id;
              return (
                <button
                  key={ag.id}
                  onClick={() => onSelectAgent(ag)}
                  className={`w-full flex items-center p-3 rounded-lg border text-left transition ${
                    isActive
                      ? 'bg-white/10 border-white/20 text-cyan-400 shadow-[0_0_15px_-5px_rgba(34,211,238,0.3)]'
                      : 'bg-white/5 border border-white/5 text-white/70 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <span className="text-xl mr-3">{ag.avatar}</span>
                  <div className="flex-1 min-w-0 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white/90 truncate">{ag.name}</span>
                      <span className="text-[9px] text-white/40 uppercase">{ag.role}</span>
                    </div>
                    <p className="text-[10px] text-white/50 mt-0.5 truncate font-sans">{ag.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security / values compliance banner */}
        <div className="mt-5 p-3 rounded border border-emerald-500/20 bg-emerald-500/10 flex items-start space-x-2 text-[10px] font-mono text-emerald-400">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>Values Engine complies with stated priority directives. Sam’s peace indices are being continuously audited.</span>
        </div>
      </div>

      {/* Interactive Communication Interface */}
      <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl flex flex-col justify-between h-[480px] shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        {/* Hologram visualizer head */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex items-center space-x-3">
            <div className="relative w-16 h-16 bg-black/40 rounded-full border border-white/10 flex items-center justify-center overflow-hidden">
              <canvas ref={canvasRef} width={64} height={64} className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                <span className="font-mono text-xs font-semibold text-white/90 uppercase">{activeAgent.name}</span>
              </div>
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Uplink: ESTABLISHED ({status})</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={isLiveLinkActive ? stopLiveLink : startLiveLink}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-[10px] font-mono border transition ${
                isLiveLinkActive
                  ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse font-bold'
                  : 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20'
              }`}
              title="Establish zero-latency full-duplex voice connection with Gemini Live"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isLiveLinkActive ? 'DISCONNECT VOICE LINK' : 'QUANTUM VOICE LINK'}</span>
            </button>

            <button
              onClick={() => setSpeechSynthesisActive(!speechSynthesisActive)}
              className={`p-2 rounded border transition ${
                speechSynthesisActive
                  ? 'bg-white/10 border-white/25 text-cyan-400'
                  : 'bg-white/5 border border-white/5 text-white/40 hover:text-white/70'
              }`}
              title={speechSynthesisActive ? 'Disable speech feedback' : 'Enable local speech feedback'}
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Feed logs */}
        <div className="flex-1 overflow-y-auto my-4 pr-1 space-y-4 custom-scrollbar text-xs font-mono">
          <AnimatePresence initial={false}>
            {chatLog.map((log, index) => {
              const isUser = log.sender === 'user';
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 border leading-relaxed ${
                      isUser
                        ? 'bg-white/10 border-white/25 text-white font-mono text-right'
                        : 'bg-cyan-500/5 border border-cyan-500/20 text-cyan-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[8px] text-white/40 mb-1">
                      <span>{isUser ? 'SAM' : activeAgent.name.toUpperCase()}</span>
                      <span>{log.time}</span>
                    </div>
                    <p className="whitespace-pre-line text-[11px] font-sans">{log.text}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={scrollRef} />
        </div>

        {/* Real-time Waveform Visualizer */}
        <AnimatePresence mode="wait">
          {status === 'listening' && (
            <WaveformVisualizer isListening={status === 'listening'} />
          )}
        </AnimatePresence>

        {/* Input Dock controls */}
        <div className="flex items-center space-x-2 border-t border-white/5 pt-4">
          <button
            onClick={startVoiceInput}
            className={`p-3 rounded-full border transition ${
              status === 'listening'
                ? 'bg-red-500/10 border-red-500/30 text-red-400 animate-pulse'
                : 'bg-white/5 border border-white/5 text-white/50 hover:bg-white/10 hover:border-white/10'
            }`}
            title="Start voice listening"
          >
            {status === 'listening' ? <MicOff className="w-4.5 h-4.5" /> : <Mic className="w-4.5 h-4.5" />}
          </button>

          <input
            type="text"
            placeholder={`Instruct ${activeAgent.name}...`}
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white outline-none font-mono focus:border-cyan-500/40 transition placeholder-white/25"
          />

          <button
            onClick={() => handleSendMessage(chatInput)}
            className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400 hover:bg-cyan-500/20 transition"
          >
            <Send className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

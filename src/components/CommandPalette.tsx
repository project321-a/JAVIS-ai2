import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, Terminal, Shield, Zap, X, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Memory, Relationship, Project } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  memories: Memory[];
  relationships: Relationship[];
  projects: Project[];
  onTriggerFocusMode: () => void;
  onTriggerAgentChange: (id: string) => void;
  onTriggerViewChange: (view: string) => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  memories,
  relationships,
  projects,
  onTriggerFocusMode,
  onTriggerAgentChange,
  onTriggerViewChange,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setAiAnswer(null);
    }
  }, [isOpen]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setAiAnswer(null);

    try {
      const response = await fetch('/api/jarvis/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, memories, relationships, projects }),
      });
      const data = await response.json();
      if (response.ok) {
        setAiAnswer(data.text);
      } else {
        setAiAnswer(`[System Alert] ${data.error || 'Cognitive search offline.'}`);
      }
    } catch (err) {
      setAiAnswer('[System Alert] Communication uplink failed.');
    } finally {
      setLoading(false);
    }
  };

  const commandItems = [
    { label: 'Activate AI Focus Mode', icon: Zap, action: () => { onTriggerFocusMode(); onClose(); } },
    { label: 'Switch to Developer Mind', icon: Terminal, action: () => { onTriggerAgentChange('developer'); onClose(); } },
    { label: 'Switch to Therapist Mind', icon: Shield, action: () => { onTriggerAgentChange('therapist'); onClose(); } },
    { label: 'Open StreamAIV Workspace', icon: Sparkles, action: () => { onTriggerViewChange('workspaces'); onClose(); } },
  ];

  if (!isOpen) return null;

  return (
    <div id="command-palette-modal" className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

      {/* Palette Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="relative w-full max-w-2xl bg-white/5 border border-cyan-500/30 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.5),0_0_30px_rgba(34,211,238,0.2)] backdrop-blur-xl overflow-hidden text-white"
      >
        {/* Header Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center border-b border-white/10 p-4 bg-black/15 font-mono">
          <Search className="w-5 h-5 text-cyan-400 mr-3 animate-pulse" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask Jarvis: 'What was the bug from last week?' or run commands..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-base text-white placeholder-white/20 font-mono"
          />
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded text-white/50 hover:text-white/85 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </form>

        {/* Content Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-cyan-400 space-y-3 font-mono">
              <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs tracking-wider animate-pulse">JARVIS IS REASONING OVER SYSTEM MEMORIES...</p>
            </div>
          )}

          {!loading && aiAnswer && (
            <div className="mb-6 p-4 rounded-lg bg-black/25 border border-cyan-500/20 shadow-inner">
              <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono font-bold tracking-wider mb-2.5">
                <Sparkles className="w-4 h-4" />
                <span>INTELLIGENT RESPONSE GENERATED</span>
              </div>
              <div className="text-sm leading-relaxed text-white/80 prose prose-invert font-sans max-w-none">
                {aiAnswer.split('\n').map((line, idx) => (
                  <p key={idx} className="mb-2 last:mb-0">{line}</p>
                ))}
              </div>
            </div>
          )}

          {/* Quick Suggestions & Commands */}
          <div className="space-y-4">
            {query.trim().length > 0 && !aiAnswer && !loading && (
              <button
                onClick={handleSearchSubmit}
                className="w-full flex items-center justify-between p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition text-cyan-400 text-sm font-mono"
              >
                <span className="flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Query memory database: "{query}"
                </span>
                <span className="flex items-center text-xs text-cyan-500">
                  Press Enter <CornerDownLeft className="w-3.5 h-3.5 ml-1" />
                </span>
              </button>
            )}

            <div>
              <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-2 px-2">Core OS Commands</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {commandItems.map((cmd, i) => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={i}
                      onClick={cmd.action}
                      className="flex items-center p-3 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/30 hover:bg-white/10 transition text-left text-sm text-white/70 hover:text-cyan-400 font-mono"
                    >
                      <Icon className="w-4.5 h-4.5 mr-2.5 text-cyan-400/70" />
                      {cmd.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-2 px-2">Example Queries</p>
              <div className="space-y-1.5 text-xs font-mono text-white/50">
                <button
                  onClick={() => setQuery('What is the supplier price of honey jars from Sweet Amber Farms?')}
                  className="w-full text-left p-2 rounded hover:bg-white/5 hover:text-cyan-300 transition"
                >
                  "What is the supplier price of honey jars from Sweet Amber Farms?"
                </button>
                <button
                  onClick={() => setQuery('Tell me about the deployment bug with StreamAIV.')}
                  className="w-full text-left p-2 rounded hover:bg-white/5 hover:text-cyan-300 transition"
                >
                  "Tell me about the deployment bug with StreamAIV."
                </button>
                <button
                  onClick={() => setQuery('What boundaries did we set for Jackton?')}
                  className="w-full text-left p-2 rounded hover:bg-white/5 hover:text-cyan-300 transition"
                >
                  "What boundaries did we set for Jackton?"
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-3 bg-black/30 border-t border-white/5 flex justify-between items-center text-[10px] text-white/40 font-mono">
          <span>COGNITIVE CORE VER: 3.5-FLASH-COOPERATIVE</span>
          <span>PRESS ESC TO DISMISS</span>
        </div>
      </motion.div>
    </div>
  );
}

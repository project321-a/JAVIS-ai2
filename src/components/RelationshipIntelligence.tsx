import React, { useState } from 'react';
import { User, ShieldAlert, Heart, Calendar, EyeOff, MessageSquare, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Relationship } from '../types';

interface RelationshipIntelligenceProps {
  relationships: Relationship[];
  onAddRelationship: (r: Relationship) => void;
}

export default function RelationshipIntelligence({
  relationships,
  onAddRelationship,
}: RelationshipIntelligenceProps) {
  const [selectedRel, setSelectedRel] = useState<Relationship | null>(relationships[0] || null);
  const [showWarning, setShowWarning] = useState<string | null>(null);

  const handleTriggerMessageSimulation = (rel: Relationship) => {
    if (rel.anxietyScore > 5) {
      setShowWarning(`Advisory Warning: Your last discussions with ${rel.name} increased your anxiety metric to ${rel.anxietyScore}/10. Your core principle is "Protect peace before productivity". Would you like to cooling-off for 15 minutes before drafting your message?`);
    } else {
      setShowWarning(`Optimal Alignment: Initiating communications with ${rel.name} is peaceful and values-compliant.`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Stakeholders Deck */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center space-x-2">
          <User className="w-4.5 h-4.5 text-cyan-400" />
          <h3 className="font-mono text-xs uppercase tracking-wider text-white/85">Life Stakeholders Deck</h3>
        </div>
        <p className="text-[11px] font-mono text-white/40 leading-relaxed">
          JARVIS maps vital people, tracking anxiety parameters, boundaries, and communication balances to protect your cognitive and mental peace.
        </p>

        <div className="space-y-2.5">
          {relationships.map((rel) => {
            const isSelected = selectedRel?.id === rel.id;
            return (
              <button
                key={rel.id}
                onClick={() => { setSelectedRel(rel); setShowWarning(null); }}
                className={`w-full flex items-center p-3 rounded-lg border text-left transition ${
                  isSelected
                    ? 'bg-white/10 border-white/20 text-cyan-400 shadow-[0_0_15px_-5px_rgba(34,211,238,0.3)]'
                    : 'bg-white/5 border-white/5 text-white/70 hover:bg-white/10 hover:border-white/10'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-xs font-mono font-bold mr-3 text-cyan-400">
                  {rel.name[0]}
                </div>
                <div className="flex-1 min-w-0 font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white/90 truncate">{rel.name}</span>
                    <span className={`text-[8px] px-1.5 py-0.5 rounded uppercase tracking-wider ${
                      rel.anxietyScore > 5 ? 'bg-red-500/10 border border-red-500/20 text-red-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    }`}>
                      Anxiety: {rel.anxietyScore}
                    </span>
                  </div>
                  <span className="text-[9px] text-white/40 uppercase">{rel.role}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stakeholder Details / HUD warning */}
      <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl flex flex-col justify-between h-[450px] shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        {selectedRel ? (
          <div className="flex-1 flex flex-col justify-between h-full font-mono text-xs">
            <div>
              {/* Header profile */}
              <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-cyan-400">
                    {selectedRel.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">{selectedRel.name}</h4>
                    <span className="text-[9px] text-white/40 uppercase">{selectedRel.role}</span>
                  </div>
                </div>

                <div className="text-right text-[10px] text-white/50">
                  <span className="block font-mono">Frequency: {selectedRel.communicationFrequency}</span>
                  <span className="block text-white/40">Last contact: {selectedRel.lastContactDate}</span>
                </div>
              </div>

              {/* Grid Metrics and stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white/5 p-3 rounded border border-white/5">
                  <span className="text-[8px] text-white/40 uppercase block mb-1">Anxiety Index</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-red-400">{selectedRel.anxietyScore}/10</span>
                    <div className="w-2/3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full" style={{ width: `${selectedRel.anxietyScore * 10}%` }} />
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 p-3 rounded border border-white/5">
                  <span className="text-[8px] text-white/40 uppercase block mb-1">Peace Index</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-400">{selectedRel.peaceScore}/10</span>
                    <div className="w-2/3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${selectedRel.peaceScore * 10}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Boundaries & Topics tabs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[9px] text-white/40 uppercase block mb-1.5 tracking-wider">Stakeholder Boundaries</span>
                  <div className="space-y-1">
                    {selectedRel.boundaries.map((b, idx) => (
                      <div key={idx} className="p-1.5 rounded bg-white/5 border border-white/5 text-[10px] text-white/60 flex items-start space-x-1.5">
                        <EyeOff className="w-3.5 h-3.5 text-cyan-500/75 shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[9px] text-white/40 uppercase block mb-1.5 tracking-wider">Key Conversational Topics</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedRel.topics.map((t, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-white/75">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Warning HUD / Trigger button */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <AnimatePresence>
                {showWarning && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-3 rounded border text-[10px] font-mono leading-relaxed ${
                      selectedRel.anxietyScore > 5
                        ? 'bg-red-500/10 border-red-500/20 text-red-400'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    <div className="flex items-start space-x-1.5">
                      <ShieldAlert className="w-4.5 h-4.5 shrink-0 mt-0.5 animate-pulse" />
                      <p>{showWarning}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center font-mono">
                <span className="text-[9px] text-white/40 uppercase">
                  Chat Balance: {selectedRel.totalChatsCount.user} (You) / {selectedRel.totalChatsCount.contact} ({selectedRel.name})
                </span>
                <button
                  onClick={() => handleTriggerMessageSimulation(selectedRel)}
                  className="px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 text-[10px] text-white/80 hover:text-white rounded uppercase tracking-wider transition flex items-center space-x-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Prepare Communication</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-white/30 py-16 space-y-2">
            <AlertCircle className="w-8 h-8 text-white/10" />
            <p className="text-[10px] font-mono uppercase tracking-wider">No Stakeholder Selected</p>
          </div>
        )}
      </div>
    </div>
  );
}

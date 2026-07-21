import React, { useState } from 'react';
import { Target, HelpCircle, Sparkles, Scale, AlertCircle, RefreshCw, ThumbsUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ValueRule } from '../types';

interface DecisionEngineProps {
  values: ValueRule[];
}

export default function DecisionEngine({ values }: DecisionEngineProps) {
  const [question, setQuestion] = useState('Should I delay the StreamAIV launch to start a new e-commerce startup?');
  const [optionA, setOptionA] = useState('Focus exclusively on completing StreamAIV');
  const [optionB, setOptionB] = useState('Delay StreamAIV and spin up the new startup');
  const [anxieties, setAnxieties] = useState('Fear that StreamAIV wont monetize fast enough; desire for instant novelty when code gets hard.');
  const [loading, setLoading] = useState(false);
  const [decisionResult, setDecisionResult] = useState<{
    analysis: string;
    optionsScores: {
      option: string;
      valueAlignmentScore: number;
      pros: string[];
      cons: string[];
      conflictExplanation: string;
    }[];
    fearDeconstruction: string;
    jarvisRecommendation: string;
  } | null>(null);

  const handleRunAssessment = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setDecisionResult(null);

    try {
      const response = await fetch('/api/jarvis/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          options: [optionA, optionB].filter((opt) => opt.trim() !== ''),
          anxieties,
          values: values.filter((v) => v.enabled).map((v) => v.title),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setDecisionResult(data);
      } else {
        alert(`Uplink compromised: ${data.error || 'Cognitive analysis failed.'}`);
      }
    } catch (err) {
      alert('Cognitive uplink lost.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Input Deck */}
      <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl flex flex-col justify-between space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Scale className="w-5 h-5 text-cyan-400" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-white/80">Values Assessment Engine</h3>
          </div>
          <p className="text-[11px] font-mono text-white/40 mb-4 leading-relaxed">
            Deconstruct complex crossroads using Sam’s primary principles. Evaluates options, deconstructs impulsive novelty desires, and ensures long-term alignment.
          </p>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-white/40 block mb-1">Crossroad Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded p-2 text-xs text-white outline-none focus:border-cyan-500/40"
                rows={2}
              />
            </div>

            <div>
              <label className="text-white/40 block mb-1">Option 1 (The Focus choice)</label>
              <input
                type="text"
                value={optionA}
                onChange={(e) => setOptionA(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded p-2 text-xs text-white outline-none focus:border-cyan-500/40"
              />
            </div>

            <div>
              <label className="text-white/40 block mb-1">Option 2 (The Novelty choice)</label>
              <input
                type="text"
                value={optionB}
                onChange={(e) => setOptionB(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded p-2 text-xs text-white outline-none focus:border-cyan-500/40"
              />
            </div>

            <div>
              <label className="text-white/40 block mb-1">Anxiety / Fear description</label>
              <textarea
                value={anxieties}
                onChange={(e) => setAnxieties(e.target.value)}
                placeholder="What anxieties are driving this impulse?"
                className="w-full bg-black/20 border border-white/10 rounded p-2 text-xs text-white outline-none focus:border-cyan-500/40"
                rows={2}
              />
            </div>
          </div>
        </div>

        <button
          onClick={handleRunAssessment}
          disabled={loading}
          className="w-full py-2.5 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-400 text-xs font-mono font-bold tracking-wider uppercase rounded-lg transition flex items-center justify-center space-x-2 shadow-[0_0_15px_-5px_rgba(34,211,238,0.3)]"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>ALIGNING PRINCIPLES MATRIX...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Deconstruct Crossroad Choice</span>
            </>
          )}
        </button>
      </div>

      {/* Assessment HUD output */}
      <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl flex flex-col justify-between h-[450px] shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-center border-b border-white/5 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Target className="w-4.5 h-4.5 text-cyan-400" />
            <h4 className="font-mono text-xs uppercase tracking-wider text-white/80">Decision Alignment Report</h4>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-cyan-400 space-y-3 font-mono">
                <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-[11px] tracking-widest animate-pulse uppercase">Auditing state values compliance...</p>
              </div>
            ) : decisionResult ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 font-mono text-xs"
              >
                <div className="bg-white/5 p-3 rounded border border-white/5">
                  <span className="text-[8px] text-white/40 uppercase tracking-wider block mb-1">Analysis Framework</span>
                  <p className="text-[11.5px] font-sans text-white/80 leading-relaxed">{decisionResult.analysis}</p>
                </div>

                {/* Score meters */}
                <div className="space-y-3">
                  {decisionResult.optionsScores.map((score, idx) => (
                    <div key={idx} className="bg-white/5 p-3 rounded border border-white/5 space-y-2">
                      <div className="flex justify-between items-center font-mono">
                        <span className="text-[11px] font-bold text-white/90 truncate max-w-[70%]">{score.option}</span>
                        <span className={`text-[10px] font-bold ${
                          score.valueAlignmentScore > 70 ? 'text-cyan-400' : 'text-yellow-500'
                        }`}>
                          Alignment: {score.valueAlignmentScore}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-black/20 rounded-full overflow-hidden">
                        <div className={`h-full ${
                          score.valueAlignmentScore > 70 ? 'bg-cyan-400 animate-pulse' : 'bg-yellow-500'
                        }`} style={{ width: `${score.valueAlignmentScore}%` }} />
                      </div>
                      <p className="text-[10px] text-white/50 font-sans leading-relaxed">{score.conflictExplanation}</p>
                    </div>
                  ))}
                </div>

                {/* Fear Deconstruction */}
                <div className="bg-red-500/10 p-3 rounded border border-red-500/20 text-red-400">
                  <div className="flex items-center space-x-1.5 text-red-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Fear & Novelty Deconstructed</span>
                  </div>
                  <p className="text-[11px] font-sans text-white/85 leading-relaxed">{decisionResult.fearDeconstruction}</p>
                </div>

                {/* JARVIS Direct recommendation */}
                <div className="bg-cyan-500/10 p-3 rounded border border-cyan-500/20">
                  <div className="flex items-center space-x-1.5 text-cyan-400 text-[10px] uppercase font-bold tracking-wider mb-1">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>J.A.R.V.I.S. Strategic Counsel</span>
                  </div>
                  <p className="text-[11.5px] font-sans text-cyan-200 leading-relaxed">{decisionResult.jarvisRecommendation}</p>
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-white/30 py-16 space-y-2">
                <HelpCircle className="w-8 h-8 text-white/10 animate-bounce" />
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Analysis Deck Awaiting trigger</p>
                <p className="text-[10px] max-w-[200px] leading-relaxed text-white/30 font-mono">
                  Review the crossroads fields on the left, then click assess to evaluate strategic alignment.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

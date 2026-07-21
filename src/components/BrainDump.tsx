import React, { useState } from 'react';
import { Upload, HelpCircle, FileText, Sparkles, BookOpen, Clock, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Project, Memory, Task } from '../types';

interface BrainDumpProps {
  projects: Project[];
  onAddMemory: (memory: Memory) => void;
  onAddTask: (task: Task) => void;
}

export default function BrainDump({ projects, onAddMemory, onAddTask }: BrainDumpProps) {
  const [content, setContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    summary: string;
    category: 'idea' | 'meeting' | 'screenshot' | 'voice' | 'link' | 'lesson';
    projectLink: string | null;
    tags: string[];
    extractedTasks: { title: string; priority: 'high' | 'medium' | 'low' }[];
  } | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setContent(`[Captured File: ${file.name}] Transcribing meeting metadata and screenshot coordinates...`);
    }
  };

  const handleProcessDump = async () => {
    if (!content.trim()) return;

    setIsProcessing(true);
    setAnalysisResult(null);

    try {
      const response = await fetch('/api/jarvis/braindump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, projects }),
      });
      const data = await response.json();

      if (response.ok) {
        setAnalysisResult(data);
      } else {
        alert(`Uplink Error: ${data.error || 'Cognitive categorization failed.'}`);
      }
    } catch (err) {
      alert('Cognitive communication failure. Confirm server state is online.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCommitDump = () => {
    if (!analysisResult) return;

    const newMemory: Memory = {
      id: `mem_${Date.now()}`,
      content: content,
      timestamp: new Date().toISOString(),
      category: analysisResult.category,
      projectLink: analysisResult.projectLink || undefined,
      tags: analysisResult.tags,
      summary: analysisResult.summary,
    };

    // Add Memory
    onAddMemory(newMemory);

    // Add extracted tasks
    analysisResult.extractedTasks.forEach((task, idx) => {
      onAddTask({
        id: `task_${Date.now()}_${idx}`,
        title: task.title,
        completed: false,
        dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days in future
        priority: task.priority,
        category: projects.find((p) => p.id === analysisResult.projectLink)?.name.split(' ')[0] || 'Life',
        projectId: analysisResult.projectLink || undefined,
      });
    });

    // Reset
    setContent('');
    setAnalysisResult(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Input Stage */}
      <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl flex flex-col justify-between space-y-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h3 className="font-mono text-xs uppercase tracking-wider text-white/80">Continuous Cognitive Dump</h3>
          </div>
          <p className="text-[11px] font-mono text-white/40 mb-4 leading-relaxed">
            Brain dump any ideas, screenshot logs, or supplier communication. JARVIS’s cognitive layers will read, extract actionable tasks, link them, and categorize.
          </p>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`relative rounded-lg border-2 border-dashed p-4 min-h-[180px] flex flex-col justify-between transition ${
              dragActive
                ? 'border-cyan-500 bg-cyan-500/10'
                : 'border-white/10 bg-black/20 hover:border-white/20'
            }`}
          >
            <textarea
              placeholder="Start typing your brain dump here (e.g. 'Jackton wants the trailer automation demo delayed until Thursday because marketing performance was low, need to review supplier Honey cost details by Tuesday...')"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent border-0 outline-none resize-none text-xs text-white placeholder-white/20 font-sans min-h-[120px] focus:ring-0"
            />

            <div className="flex justify-between items-center border-t border-white/5 pt-3 mt-3">
              <span className="text-[9px] font-mono text-white/30">Drag files here to simulate screen parsing</span>
              <label className="cursor-pointer flex items-center space-x-1.5 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 transition">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Snapshot</span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setContent(`[Captured Log File: ${e.target.files[0].name}] Processing...`);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        </div>

        <button
          onClick={handleProcessDump}
          disabled={!content.trim() || isProcessing}
          className="w-full py-2.5 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-lg hover:bg-cyan-500/20 disabled:opacity-40 disabled:pointer-events-none transition text-xs font-mono font-bold tracking-wider uppercase flex items-center justify-center space-x-2 shadow-[0_0_15px_-5px_rgba(34,211,238,0.3)]"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span>JARVIS IS PARSING CORE STRUCTURAL PARAMS...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4.5 h-4.5 animate-pulse" />
              <span>Submit to Cognitive Parser</span>
            </>
          )}
        </button>
      </div>

      {/* Structured Extraction Preview */}
      <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl flex flex-col justify-between h-[420px] shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4.5 h-4.5 text-cyan-400" />
            <h4 className="font-mono text-xs uppercase tracking-wider text-white/80">Cognitive Alignment Engine</h4>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
          <AnimatePresence mode="wait">
            {analysisResult ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-xs font-mono"
              >
                {/* Meta summary cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-2.5 rounded border border-white/5">
                    <span className="text-[8px] text-white/40 uppercase tracking-wider">Summary</span>
                    <p className="text-[11px] font-sans text-cyan-200 mt-1">{analysisResult.summary}</p>
                  </div>
                  <div className="bg-white/5 p-2.5 rounded border border-white/5">
                    <span className="text-[8px] text-white/40 uppercase tracking-wider">Category</span>
                    <p className="text-[11px] text-cyan-200 mt-1 capitalize">{analysisResult.category}</p>
                  </div>
                </div>

                {/* Linked Project */}
                <div className="bg-white/5 p-3 rounded border border-white/5">
                  <span className="text-[8px] text-white/40 uppercase tracking-wider block mb-1">Target Project linkage</span>
                  <div className="flex items-center space-x-2 text-[11px] text-white/80">
                    <FileText className="w-3.5 h-3.5 text-cyan-500" />
                    <span>
                      {projects.find((p) => p.id === analysisResult.projectLink)?.name || 'Direct life task (No specific project link)'}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <span className="text-[8px] text-white/40 uppercase tracking-wider block mb-1.5">Identified tags</span>
                  <div className="flex flex-wrap gap-1.5">
                    {analysisResult.tags.map((tag, i) => (
                      <span key={i} className="flex items-center px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-cyan-400">
                        <Tag className="w-2.5 h-2.5 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Extracted Tasks checklist */}
                <div className="space-y-2">
                  <span className="text-[8px] text-white/40 uppercase tracking-wider block mb-1">Extracted actionable items</span>
                  {analysisResult.extractedTasks.length > 0 ? (
                    <div className="space-y-1.5">
                      {analysisResult.extractedTasks.map((task, i) => (
                        <div key={i} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 text-[11px]">
                          <span className="text-white/80 font-sans truncate pr-2">{task.title}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider ${
                            task.priority === 'high' ? 'bg-red-500/10 border border-red-500/20 text-red-400 font-bold' : 'bg-white/5 border border-white/5 text-white/50'
                          }`}>
                            {task.priority}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-white/30">No immediate sub-tasks found in this brain dump block.</p>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-white/30 space-y-2 py-12">
                <HelpCircle className="w-8 h-8 text-white/10 animate-bounce" />
                <p className="text-[10px] font-mono uppercase tracking-wider text-white/40">Alignment Deck Awaiting Submission</p>
                <p className="text-[10px] max-w-[200px] leading-relaxed text-white/30 font-mono">
                  Enter your raw text snippet or drag a screen snapshot file on the left, then click Submit to process.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {analysisResult && (
          <div className="border-t border-white/5 pt-4 flex space-x-2">
            <button
              onClick={() => setAnalysisResult(null)}
              className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] font-mono text-white/60 hover:text-white transition uppercase tracking-wider"
            >
              Discard Analysis
            </button>
            <button
              onClick={handleCommitDump}
              className="flex-1 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded text-[10px] font-mono font-bold tracking-wider uppercase transition shadow-[0_0_15px_-5px_rgba(34,211,238,0.3)]"
            >
              Commit into Memory
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

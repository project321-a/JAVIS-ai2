import React, { useEffect, useRef, useState } from 'react';
import { Network, Sparkles, BookOpen, User, Target, Link2 } from 'lucide-react';
import { Project, Relationship, Memory, ValueRule } from '../types';

interface KnowledgeGraphProps {
  projects: Project[];
  relationships: Relationship[];
  memories: Memory[];
  values: ValueRule[];
}

interface Node {
  id: string;
  label: string;
  type: 'project' | 'people' | 'memory' | 'value';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface Edge {
  source: string;
  target: string;
  value: number;
}

export default function KnowledgeGraph({
  projects,
  relationships,
  memories,
  values,
}: KnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  // Initialize nodes and edges from props
  useEffect(() => {
    const initializedNodes: Node[] = [];
    const initializedEdges: Edge[] = [];

    // Add Stated Values (Core Goals)
    values.forEach((v, index) => {
      initializedNodes.push({
        id: `val_${v.id}`,
        label: v.title,
        type: 'value',
        x: 150 + Math.random() * 100,
        y: 100 + index * 60,
        vx: 0,
        vy: 0,
        radius: 14,
        color: '#10b981', // Emerald green
      });
    });

    // Add Projects
    projects.forEach((p, index) => {
      initializedNodes.push({
        id: `proj_${p.id}`,
        label: p.name,
        type: 'project',
        x: 350 + Math.random() * 80,
        y: 150 + index * 80,
        vx: 0,
        vy: 0,
        radius: 18,
        color: '#06b6d4', // Cyan
      });

      // Link projects to relevant values (just an example link)
      if (p.id === 'p1') {
        // StreamAIV links to Limit project hopping (v3) & Build long term leverage (v5)
        initializedEdges.push({ source: 'proj_p1', target: 'val_v3', value: 1 });
        initializedEdges.push({ source: 'proj_p1', target: 'val_v5', value: 1.5 });
      } else if (p.id === 'p2') {
        initializedEdges.push({ source: 'proj_p2', target: 'val_v5', value: 1 });
      } else if (p.id === 'p4') {
        initializedEdges.push({ source: 'proj_p4', target: 'val_v2', value: 2 });
      }
    });

    // Add People
    relationships.forEach((r, index) => {
      initializedNodes.push({
        id: `rel_${r.id}`,
        label: r.name,
        type: 'people',
        x: 550 + Math.random() * 80,
        y: 100 + index * 120,
        vx: 0,
        vy: 0,
        radius: 16,
        color: '#a855f7', // Purple
      });

      // Link Grandma to family value, Jackton to StreamAIV
      if (r.id === 'r1') {
        initializedEdges.push({ source: 'rel_r1', target: 'proj_p1', value: 2 });
        initializedEdges.push({ source: 'rel_r1', target: 'val_v4', value: 1 }); // impulsive communication
      } else if (r.id === 'r2') {
        initializedEdges.push({ source: 'rel_r2', target: 'val_v2', value: 2 }); // family commitment
        initializedEdges.push({ source: 'rel_r2', target: 'proj_p4', value: 1 }); // Personal growth
      }
    });

    // Add Memories
    memories.forEach((m, index) => {
      initializedNodes.push({
        id: `mem_${m.id}`,
        label: m.summary || m.content.slice(0, 20) + '...',
        type: 'memory',
        x: 250 + Math.random() * 200,
        y: 350 + index * 70,
        vx: 0,
        vy: 0,
        radius: 12,
        color: '#eab308', // Amber yellow
      });

      // Link memory to its project
      if (m.projectLink) {
        initializedEdges.push({ source: `mem_${m.id}`, target: `proj_${m.projectLink}`, value: 1.5 });
      }
    });

    setNodes(initializedNodes);
    setEdges(initializedEdges);
  }, [projects, relationships, memories, values]);

  // Physics animation loop inside Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    // Responsive Canvas Resizing
    const resizeCanvas = () => {
      if (containerRef.current && canvas) {
        canvas.width = containerRef.current.clientWidth;
        canvas.height = 420;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Node drag support
    let draggedNode: Node | null = null;
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const hitNode = nodes.find((node) => {
        const dx = node.x - mouseX;
        const dy = node.y - mouseY;
        return Math.sqrt(dx * dx + dy * dy) < node.radius + 10;
      });

      if (hitNode) {
        draggedNode = hitNode;
        setSelectedNode(hitNode);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (draggedNode) {
        const rect = canvas.getBoundingClientRect();
        draggedNode.x = e.clientX - rect.left;
        draggedNode.y = e.clientY - rect.top;
      }
    };

    const handleMouseUp = () => {
      draggedNode = null;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    const runPhysics = () => {
      if (nodes.length === 0) return;

      // 1. Force repulsions between all node pairs
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const minD = n1.radius + n2.radius + 60;

          if (dist < minD) {
            const force = (minD - dist) * 0.05;
            const ax = (dx / dist) * force;
            const ay = (dy / dist) * force;
            n1.vx -= ax;
            n1.vy -= ay;
            n2.vx += ax;
            n2.vy += ay;
          }
        }
      }

      // 2. Attraction pull along edges
      edges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        if (sourceNode && targetNode) {
          const dx = targetNode.x - sourceNode.x;
          const dy = targetNode.y - sourceNode.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const desiredDist = 120;
          const force = (dist - desiredDist) * 0.01 * edge.value;

          const ax = (dx / dist) * force;
          const ay = (dy / dist) * force;

          sourceNode.vx += ax;
          sourceNode.vy += ay;
          targetNode.vx -= ax;
          targetNode.vy -= ay;
        }
      });

      // 3. Gravity pull toward center and boundary dampening
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      nodes.forEach((node) => {
        const dx = cx - node.x;
        const dy = cy - node.y;
        node.vx += dx * 0.001;
        node.vy += dy * 0.001;

        // Apply friction
        node.vx *= 0.85;
        node.vy *= 0.85;

        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Wall collisions
        if (node.x < node.radius) { node.x = node.radius; node.vx *= -1; }
        if (node.x > canvas.width - node.radius) { node.x = canvas.width - node.radius; node.vx *= -1; }
        if (node.y < node.radius) { node.y = node.radius; node.vy *= -1; }
        if (node.y > canvas.height - node.radius) { node.y = canvas.height - node.radius; node.vy *= -1; }
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw Edges (Glow neon links)
      edges.forEach((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);

        if (sourceNode && targetNode) {
          ctx.beginPath();
          ctx.moveTo(sourceNode.x, sourceNode.y);
          ctx.lineTo(targetNode.x, targetNode.y);
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
          ctx.stroke();

          // Connective sparks crawling the graph
          const flowOffset = (Date.now() * 0.002 * edge.value) % 1;
          const sx = sourceNode.x + (targetNode.x - sourceNode.x) * flowOffset;
          const sy = sourceNode.y + (targetNode.y - sourceNode.y) * flowOffset;
          ctx.beginPath();
          ctx.arc(sx, sy, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#06b6d4';
          ctx.shadowBlur = 4;
          ctx.shadowColor = '#06b6d4';
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      });

      // Draw Nodes
      nodes.forEach((node) => {
        const isSelected = selectedNode?.id === node.id;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isSelected ? 3 : 0), 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowBlur = isSelected ? 15 : 6;
        ctx.shadowColor = node.color;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Thin outer ring for luxury HUD aesthetic
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + (isSelected ? 7 : 4), 0, Math.PI * 2);
        ctx.strokeStyle = `${node.color}40`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Node Label Typography
        ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(node.label.length > 18 ? node.label.slice(0, 16) + '..' : node.label, node.x, node.y - node.radius - 10);
      });

      runPhysics();
      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeMouseMoveListener?.(handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      cancelAnimationFrame(animationId);
    };
  }, [nodes, edges, selectedNode]);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-5 backdrop-blur-xl relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Network className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h3 className="font-mono text-sm uppercase tracking-wider text-white/85">Personal Knowledge Graph</h3>
        </div>
        <div className="flex items-center space-x-4 text-[10px] font-mono text-white/40">
          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500 mr-1" /> Workspaces</span>
          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 mr-1" /> People</span>
          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1" /> Goals</span>
          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-yellow-500 mr-1" /> Memories</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Dynamic Interactive Stage */}
        <div ref={containerRef} className="lg:col-span-3 bg-black/25 border border-white/5 rounded-lg relative cursor-grab active:cursor-grabbing">
          <canvas ref={canvasRef} className="block w-full" />
          <div className="absolute bottom-3 left-3 bg-black/40 border border-white/10 px-2.5 py-1.5 rounded text-[10px] text-white/50 font-mono">
            💡 Drag nodes to interact with physics
          </div>
        </div>

        {/* Selected Entity Card HUD */}
        <div className="bg-white/5 border border-white/5 rounded-lg p-4 flex flex-col justify-between font-mono text-xs">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 pb-2 border-b border-white/5">
                {selectedNode.type === 'project' && <Sparkles className="w-4 h-4 text-cyan-400" />}
                {selectedNode.type === 'people' && <User className="w-4 h-4 text-purple-400" />}
                {selectedNode.type === 'value' && <Target className="w-4 h-4 text-emerald-400" />}
                {selectedNode.type === 'memory' && <BookOpen className="w-4 h-4 text-yellow-400" />}
                <span className="uppercase text-[10px] font-bold tracking-wider text-white/40">Node Selected</span>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-white mb-1.5">{selectedNode.label}</h4>
                <p className="text-[10px] text-white/40 capitalize">Type: {selectedNode.type}</p>
              </div>

              <div className="space-y-2 bg-white/5 p-2.5 rounded border border-white/5">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block">Cognitive Linkage</span>
                <p className="text-[11px] text-white/70 leading-relaxed">
                  {selectedNode.type === 'project' && "Active business unit linked directly to long-term leverage values and relevant stakeholder contacts."}
                  {selectedNode.type === 'people' && "Vital life stakeholder. Retains communication frequency checks, conversational records, and boundaries."}
                  {selectedNode.type === 'value' && "Core guiding value ensuring JARVIS optimizes recommended daily focus and warns during prioritization conflicts."}
                  {selectedNode.type === 'memory' && "Brain dumped snippet stored, searchable, and linked to relevant project codebases."}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-white/30 space-y-2 py-10">
              <Link2 className="w-8 h-8 text-white/10 animate-pulse" />
              <p className="text-[11px] font-mono uppercase tracking-wider">No Node Selected</p>
              <p className="text-[10px] max-w-[160px] leading-relaxed">Click any HUD particle node to query cognitive relationship parameters.</p>
            </div>
          )}

          {selectedNode && (
            <button
              onClick={() => setSelectedNode(null)}
              className="mt-4 w-full py-1.5 bg-white/5 border border-white/10 hover:border-white/20 rounded text-[10px] text-white/50 hover:text-white/80 transition uppercase tracking-wider"
            >
              Clear Focus
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

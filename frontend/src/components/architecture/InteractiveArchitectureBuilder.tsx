import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Cpu, Maximize2, Minimize2, CheckCircle2, Box, ArrowRight, X } from 'lucide-react';

interface InteractiveArchitectureBuilderProps {
  initialNodes: any[];
  initialEdges: any[];
  solutionTitle: string;
}

export const InteractiveArchitectureBuilder: React.FC<InteractiveArchitectureBuilderProps> = ({
  initialNodes,
  initialEdges,
  solutionTitle,
}) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  };

  return (
    <div
      className={`relative w-full rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : 'h-[580px]'
      }`}
    >
      {/* Header Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 z-10 backdrop-blur-md">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <Cpu className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Interactive System Architecture Diagram
            </h4>
            <span className="text-[11px] text-slate-400 truncate block max-w-md">
              {solutionTitle}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center space-x-1 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-3.5 w-3.5" />
                <span>Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="h-3.5 w-3.5" />
                <span>Fullscreen</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
          className="bg-slate-950"
        >
          <Background variant={BackgroundVariant.Lines} gap={30} color="#1e293b" />
          <Controls className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden fill-slate-300 text-slate-300" />
        </ReactFlow>

        {/* Selected Architecture Component Inspector */}
        {selectedNode && (
          <div className="absolute right-4 top-4 z-20 w-84 rounded-xl border border-indigo-500/40 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Box className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                  Component Architecture Inspector
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3">
              <h5 className="text-sm font-bold text-white leading-snug">
                {selectedNode.data?.label}
              </h5>
              <div className="mt-2 flex items-center space-x-2">
                <span className="rounded bg-indigo-950 text-indigo-300 px-2 py-0.5 text-[11px] font-medium border border-indigo-800/40">
                  {selectedNode.data?.category || 'Pipeline Module'}
                </span>
                <span className="rounded bg-emerald-950 text-emerald-300 px-2 py-0.5 text-[11px] font-medium border border-emerald-800/40">
                  Status: {selectedNode.data?.status || 'Proposed'}
                </span>
              </div>
            </div>

            <div className="mt-4 space-y-2 border-t border-slate-800 pt-3 text-xs text-slate-300">
              <p className="text-slate-400 leading-relaxed">
                This component processes input streams, verifies invariant constraints, and dispatches calibrated representations to subsequent layers.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950 px-4 py-2 text-[11px] text-slate-400">
        <span className="flex items-center text-slate-400">
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-indigo-400" />
          Interactive Architectural Schema (Zoom / Pan / Click to inspect)
        </span>
        <span className="text-slate-500">Live Component Graph</span>
      </div>
    </div>
  );
};

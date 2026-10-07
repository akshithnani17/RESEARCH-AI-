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
import { ZoomIn, ZoomOut, Maximize2, Search, Filter, Layers, Info, X } from 'lucide-react';

interface InteractiveResearchGraphProps {
  initialNodes: any[];
  initialEdges: any[];
}

export const InteractiveResearchGraph: React.FC<InteractiveResearchGraphProps> = ({
  initialNodes,
  initialEdges,
}) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  const filteredNodes = nodes.filter((n) => {
    const label = (n.data?.label as string) || '';
    const category = (n.data?.category as string) || '';
    const matchesSearch = label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === 'ALL' || category.toLowerCase().includes(filterCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="relative h-[650px] w-full rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl flex flex-col">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3 z-10 backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Layers className="h-4 w-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Interactive Research Relationship Graph
            </span>
          </div>
          <span className="hidden sm:inline-block rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
            {nodes.length} Nodes | {edges.length} Connections
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search graph nodes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-7.5 rounded-lg border border-slate-700 bg-slate-950 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="h-7.5 rounded-lg border border-slate-700 bg-slate-950 px-2.5 text-xs text-slate-300 focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All Node Types</option>
            <option value="Literature">Papers Only</option>
            <option value="Gap">Research Gaps</option>
            <option value="Solution">Solutions</option>
          </select>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 w-full h-full relative">
        <ReactFlow
          nodes={filteredNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
          className="bg-slate-950"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1e293b" />
          <Controls className="bg-slate-900 border border-slate-700 rounded-lg overflow-hidden fill-slate-300 text-slate-300" />
        </ReactFlow>

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute right-4 top-4 z-20 w-80 rounded-xl border border-slate-700 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <Info className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                  Node Inspector
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
              <h4 className="text-sm font-bold text-white leading-snug">
                {selectedNode.data?.label || 'Selected Node'}
              </h4>
              <div className="mt-2 inline-block rounded border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-300">
                {selectedNode.data?.category || 'Node Entity'}
              </div>
            </div>

            <div className="mt-3 space-y-2 border-t border-slate-800 pt-3 text-xs text-slate-300">
              {selectedNode.data?.score !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">AI-Assisted Gap Score:</span>
                  <span className="font-bold text-indigo-400">{selectedNode.data.score}/100</span>
                </div>
              )}
              {selectedNode.data?.confidence && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Confidence Level:</span>
                  <span className="font-medium text-emerald-400">{selectedNode.data.confidence}</span>
                </div>
              )}
              {selectedNode.data?.year && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Publication Year:</span>
                  <span className="text-slate-200">{selectedNode.data.year}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-between border-t border-slate-800/80 bg-slate-950 px-4 py-2 text-[11px] text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-slate-500"></span> Baseline Papers
          </span>
          <span className="flex items-center">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-indigo-500"></span> Discovered Gaps
          </span>
          <span className="flex items-center">
            <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-500"></span> Proposed Solution
          </span>
        </div>
        <span className="text-slate-500">Click any node to view details</span>
      </div>
    </div>
  );
};

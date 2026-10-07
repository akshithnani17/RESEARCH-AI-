import React from 'react';
import { X, FileText, CheckCircle2, Bookmark } from 'lucide-react';
import { EvidenceSnippet, GapEvidence } from '../../types';

interface EvidenceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  evidenceItems: (EvidenceSnippet | GapEvidence)[];
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({
  isOpen,
  onClose,
  title,
  evidenceItems,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-2">
                <Bookmark className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-semibold text-white">Grounded Literature Evidence</h3>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4">
              <span className="text-xs uppercase tracking-wider font-semibold text-indigo-400">Claim Focus</span>
              <p className="mt-1 text-sm font-medium text-slate-200 bg-slate-800/60 p-3 rounded-lg border border-slate-700/50">
                {title}
              </p>
            </div>

            <div className="mt-6 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
              <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                Extracted Supporting Excerpts ({evidenceItems.length})
              </span>

              {evidenceItems.length === 0 ? (
                <div className="p-4 bg-slate-800/30 rounded-lg border border-dashed border-slate-700 text-center">
                  <p className="text-sm text-slate-400">No direct quotes indexed for this item.</p>
                </div>
              ) : (
                evidenceItems.map((item, index) => {
                  const paperTitle = 'paper_title' in item ? item.paper_title : 'Source Document';
                  const pageNumber = 'page' in item ? (item as EvidenceSnippet).page : (item as GapEvidence).page_number;
                  const sectionName = 'section' in item ? (item as EvidenceSnippet).section : ((item as GapEvidence).section_name || 'General');
                  const quoteText = 'text' in item ? (item as EvidenceSnippet).text : (item as GapEvidence).extracted_text;
                  const relation = 'relationship' in item ? ((item as EvidenceSnippet).relationship || 'SUPPORTS') : ((item as GapEvidence).relationship_type || 'SUPPORTS');

                  return (
                    <div
                      key={index}
                      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 transition"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                        <span className="flex items-center font-medium text-indigo-300">
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          {paperTitle.length > 35 ? `${paperTitle.substring(0, 35)}...` : paperTitle}
                        </span>
                        <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300">
                          Page {pageNumber || 1}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 mb-2">
                        Section: <span className="text-slate-300 font-medium">{sectionName}</span>
                      </div>

                      <blockquote className="text-xs italic text-slate-300 bg-slate-900/80 p-3 rounded-lg border-l-2 border-indigo-500 leading-relaxed">
                        "{quoteText}"
                      </blockquote>

                      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="inline-flex items-center text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Relation: {relation}
                        </span>
                        <span className="text-slate-500">Verified Citation</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition"
            >
              Close Evidence Explorer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { DecisionPointsConfig, FeedSortOption, VisibilityPolicy } from '../types';
import {
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Eye,
  EyeOff,
  Edit3,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
} from 'lucide-react';

interface DecisionPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  policy: DecisionPointsConfig;
  onUpdatePolicy: (newPolicy: Partial<DecisionPointsConfig>) => Promise<void>;
}

export const DecisionPointsModal: React.FC<DecisionPointsModalProps> = ({
  isOpen,
  onClose,
  policy,
  onUpdatePolicy,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="modal-dp-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="modal-dp"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-neutral-900">Editorial Decision Points</h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                  20 PTS Civic Tech Analysis
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Ethical & algorithmic trade-offs in viral misinformation triage.
              </p>
            </div>
          </div>
          <button
            id="btn-close-dp-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Policy Intro */}
          <div className="p-3.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-700 leading-relaxed flex items-start gap-2.5">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-neutral-900 font-semibold">Neutral By Design:</strong> Triage platforms face critical governance decisions with no single "perfect" answer. Toggle the live policies below to see how the platform dynamically recalculates the feed and risk vectors.
            </div>
          </div>

          {/* DP1: Feed Order */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center text-xs font-bold font-mono">
                  1
                </div>
                <h3 className="text-sm font-bold text-neutral-900">
                  DP1 · Feed Order: What surfaces first?
                </h3>
              </div>
              <span className="text-xs text-neutral-500 font-mono">Active: {policy.feedOrder}</span>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              <strong>Question:</strong> How is the public feed ordered: recency, risk, status, something else? Why?
            </p>

            {/* Interactive Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                id="btn-dp1-risk"
                onClick={() => onUpdatePolicy({ feedOrder: 'risk' })}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  policy.feedOrder === 'risk'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Risk Priority</span>
                  {policy.feedOrder === 'risk' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className={`text-[11px] mt-1 ${policy.feedOrder === 'risk' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  High-risk rumors with 2+ flags float to the top to stop contagion before viral peak.
                </p>
              </button>

              <button
                type="button"
                id="btn-dp1-recency"
                onClick={() => onUpdatePolicy({ feedOrder: 'recency' })}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  policy.feedOrder === 'recency'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Recency (Time)</span>
                  {policy.feedOrder === 'recency' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className={`text-[11px] mt-1 ${policy.feedOrder === 'recency' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Pure chronological stream. Best for tracking real-time breaking events as they hit WhatsApp.
                </p>
              </button>

              <button
                type="button"
                id="btn-dp1-status"
                onClick={() => onUpdatePolicy({ feedOrder: 'status' })}
                className={`p-2.5 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  policy.feedOrder === 'status'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="font-bold flex items-center justify-between">
                  <span>Status Priority</span>
                  {policy.feedOrder === 'status' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <p className={`text-[11px] mt-1 ${policy.feedOrder === 'status' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Unverified claims first so newsrooms and volunteer fact-checkers can triage immediate queue.
                </p>
              </button>
            </div>

            {/* Editorial Rationale */}
            <div className="p-2.5 bg-neutral-50 rounded text-[11px] text-neutral-600 border border-neutral-100">
              <span className="font-semibold text-neutral-800">Editorial Rationale:</span> In Indian information ecosystems (e.g. WhatsApp groups), panic spreads exponentially. Ordering by <strong>Risk Score</strong> prioritizes debunks where harm velocity is highest (financial scams, fake curfew orders).
            </div>
          </div>

          {/* DP2: Visibility */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center text-xs font-bold font-mono">
                  2
                </div>
                <h3 className="text-sm font-bold text-neutral-900">
                  DP2 · Visibility: Are unverified claims public?
                </h3>
              </div>
              <span className="text-xs text-neutral-500 font-mono">
                {policy.visibility === 'all' ? 'Transparent' : 'Quarantine'}
              </span>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              <strong>Question:</strong> Are unverified claims publicly visible, or held back until reviewed? Why?
            </p>

            {/* Interactive Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                id="btn-dp2-all"
                onClick={() => onUpdatePolicy({ visibility: 'all' })}
                className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  policy.visibility === 'all'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="font-bold flex items-center gap-2 mb-1">
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Publicly Visible with Caution Badges</span>
                </div>
                <p className={`text-[11px] ${policy.visibility === 'all' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Citizens can see what is currently circulating with warning tags, preventing duplication and allowing crowdsourced corroboration.
                </p>
              </button>

              <button
                type="button"
                id="btn-dp2-quarantine"
                onClick={() => onUpdatePolicy({ visibility: 'quarantine_unverified' })}
                className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  policy.visibility === 'quarantine_unverified'
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="font-bold flex items-center gap-2 mb-1">
                  <EyeOff className="w-4 h-4 text-rose-400" />
                  <span>Quarantine Until Fact-Checked</span>
                </div>
                <p className={`text-[11px] ${policy.visibility === 'quarantine_unverified' ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Unverified claims stay in a private newsroom queue so the platform itself does not accidentally amplify fringe falsehoods before verification.
                </p>
              </button>
            </div>

            {/* Editorial Rationale */}
            <div className="p-2.5 bg-neutral-50 rounded text-[11px] text-neutral-600 border border-neutral-100">
              <span className="font-semibold text-neutral-800">Editorial Rationale:</span> The <em>Amplification Risk</em> debate. Showing unverified claims with loud warning tags provides immediate situational awareness; however, malicious actors could submit spam to gain a platform. Toggling to "Quarantine" guarantees zero unverified rumor leakage.
            </div>
          </div>

          {/* DP3: Editing */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-neutral-100 text-neutral-800 flex items-center justify-center text-xs font-bold font-mono">
                  3
                </div>
                <h3 className="text-sm font-bold text-neutral-900">
                  DP3 · Editing: Post-submission changes & flag recalculation
                </h3>
              </div>
              <span className="text-xs text-neutral-500 font-mono">
                {policy.allowEditing ? 'Allowed (Audited)' : 'Immutable'}
              </span>
            </div>

            <p className="text-xs text-neutral-600 leading-relaxed">
              <strong>Question:</strong> Can a claim be edited after submission, and what happens to its flags? Why?
            </p>

            {/* Interactive Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                id="btn-dp3-editable"
                onClick={() => onUpdatePolicy({ allowEditing: true })}
                className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  policy.allowEditing
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="font-bold flex items-center gap-2 mb-1">
                  <Edit3 className="w-4 h-4 text-emerald-400" />
                  <span>Audited Edits + Flag Recalculation</span>
                </div>
                <p className={`text-[11px] ${policy.allowEditing ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  Claims can be updated (e.g. adding missing source links or correcting typos). The platform logs a permanent audit trail and recomputes all risk flags immediately.
                </p>
              </button>

              <button
                type="button"
                id="btn-dp3-locked"
                onClick={() => onUpdatePolicy({ allowEditing: false })}
                className={`p-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                  !policy.allowEditing
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-2xs'
                    : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                <div className="font-bold flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Strict Immutability (Read-Only)</span>
                </div>
                <p className={`text-[11px] ${!policy.allowEditing ? 'text-neutral-300' : 'text-neutral-500'}`}>
                  No post-submission edits are allowed. Any correction must be submitted as a new claim to preserve forensic evidence of what was viral.
                </p>
              </button>
            </div>

            {/* Editorial Rationale */}
            <div className="p-2.5 bg-neutral-50 rounded text-[11px] text-neutral-600 border border-neutral-100">
              <span className="font-semibold text-neutral-800">Editorial Rationale:</span> In Truth Lens, when editing is enabled, <strong>risk flags are strictly recalculated in real-time</strong>. If a user adds a verified source URL, the "Unsourced" flag drops. A transparent audit trail logs every revision to prevent covert modifications.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50/90 flex items-center justify-between">
          <span className="text-xs text-neutral-500 font-mono">
            Changes apply instantly to live feed
          </span>
          <button
            id="btn-save-dp"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-black text-white transition-colors cursor-pointer"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};

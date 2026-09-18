import React, { useState, useMemo } from 'react';
import { SourcePlatform, ClaimCategory, Claim } from '../types';
import { evaluateRiskFlags } from '../utils/riskAnalyzer';
import {
  X,
  Send,
  AlertTriangle,
  Flame,
  Volume2,
  Link2Off,
  Sparkles,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface SubmitClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitClaim: (claimData: {
    text: string;
    sourcePlatform: SourcePlatform;
    sourceUrl?: string;
    category: ClaimCategory;
    region?: string;
  }) => Promise<void>;
}

const SAMPLE_CLAIMS = [
  {
    title: 'WhatsApp Viral UPI Scheme',
    text: 'URGENT ALERT: Government is giving ₹5,000 cash bonus to all bank accounts! Tap and enter UPI PIN immediately. Share before deleted!',
    platform: 'WhatsApp' as SourcePlatform,
    category: 'Finance' as ClaimCategory,
    sourceUrl: '',
    region: 'Pan-India',
  },
  {
    title: 'Health Miracle Cure Forward',
    text: 'SHOCKING SECRET: DRINKING BOILED CLOVE WATER WITH LEMON CURES ALL VIRAL INFECTIONS IN 2 HOURS! HOSPITALS WANT THIS DELETED! FORWARD TO ALL GROUPS!',
    platform: 'WhatsApp' as SourcePlatform,
    category: 'Health' as ClaimCategory,
    sourceUrl: '',
    region: 'Delhi NCR',
  },
  {
    title: 'Official Metro Advisory',
    text: 'Delhi Metro Rail Corporation announces revised passenger schedule for Independence Day morning services on Violet line.',
    platform: 'X' as SourcePlatform,
    category: 'Other' as ClaimCategory,
    sourceUrl: 'https://delhimetrorail.com',
    region: 'Delhi',
  },
];

export const SubmitClaimModal: React.FC<SubmitClaimModalProps> = ({
  isOpen,
  onClose,
  onSubmitClaim,
}) => {
  const [text, setText] = useState('');
  const [sourcePlatform, setSourcePlatform] = useState<SourcePlatform>('WhatsApp');
  const [sourceUrl, setSourceUrl] = useState('');
  const [category, setCategory] = useState<ClaimCategory>('Finance');
  const [region, setRegion] = useState('Pan-India');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Live real-time risk flag computation as user types (Feature 2)
  const analysis = useMemo(() => {
    return evaluateRiskFlags(text, sourceUrl);
  }, [text, sourceUrl]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || text.trim().length < 8) {
      setErrorMsg('Please enter a claim with at least 8 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSubmitClaim({
        text: text.trim(),
        sourcePlatform,
        sourceUrl: sourceUrl.trim() || undefined,
        category,
        region: region.trim() || 'Pan-India',
      });
      setText('');
      setSourceUrl('');
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit claim. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadSample = (sample: typeof SAMPLE_CLAIMS[0]) => {
    setText(sample.text);
    setSourcePlatform(sample.platform);
    setCategory(sample.category);
    setSourceUrl(sample.sourceUrl);
    setRegion(sample.region);
    setErrorMsg('');
  };

  return (
    <div
      id="modal-submit-claim-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="modal-submit-claim"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-xl bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Submit a Viral Claim</h2>
            <p className="text-xs text-neutral-500">
              Submit suspicious social media posts or WhatsApp forwards for newsroom triage.
            </p>
          </div>
          <button
            id="btn-close-submit-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Quick Indian Samples */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Quick test samples:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_CLAIMS.map((s, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => loadSample(s)}
                  className="px-2.5 py-1 text-xs rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium transition-colors cursor-pointer flex items-center gap-1 border border-neutral-200"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>{s.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Viral Claim Text */}
          <div>
            <label htmlFor="input-claim-text" className="block text-xs font-semibold text-neutral-800 mb-1">
              Viral Claim / Forward Text <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="input-claim-text"
              rows={4}
              required
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste viral WhatsApp message, tweet, rumor, or post caption here..."
              className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all text-neutral-900 placeholder:text-neutral-400"
            />
          </div>

          {/* Real-time Risk Flag Inspector (Feature 2) */}
          <div className="p-3 rounded-lg border bg-neutral-50 border-neutral-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-neutral-700 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-neutral-500" />
                Live Automated Risk Analysis (Feature 2)
              </span>
              <span
                className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded-full ${
                  analysis.isHighRisk
                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                    : analysis.flags.length === 1
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                }`}
              >
                {analysis.isHighRisk ? '⚠️ High Risk (2+ Flags)' : `${analysis.flags.length} Flag(s)`}
              </span>
            </div>

            {/* Flags list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              {/* Sensational */}
              <div
                className={`p-2 rounded border flex items-center gap-1.5 ${
                  analysis.flags.some(f => f.type === 'Sensational')
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                    : 'bg-white border-neutral-200 text-neutral-400'
                }`}
              >
                <Flame className="w-3.5 h-3.5 shrink-0" />
                <span>Sensational words</span>
              </div>

              {/* Shouting */}
              <div
                className={`p-2 rounded border flex items-center gap-1.5 ${
                  analysis.flags.some(f => f.type === 'Shouting')
                    ? 'bg-orange-50 border-orange-300 text-orange-900 font-semibold'
                    : 'bg-white border-neutral-200 text-neutral-400'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 shrink-0" />
                <span>&gt;50% CAPS shouting</span>
              </div>

              {/* Unsourced */}
              <div
                className={`p-2 rounded border flex items-center gap-1.5 ${
                  analysis.flags.some(f => f.type === 'Unsourced')
                    ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                    : 'bg-white border-neutral-200 text-neutral-400'
                }`}
              >
                <Link2Off className="w-3.5 h-3.5 shrink-0" />
                <span>Unsourced (no link)</span>
              </div>
            </div>
          </div>

          {/* Grid: Platform & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="select-platform" className="block text-xs font-semibold text-neutral-800 mb-1">
                Source Platform <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-platform"
                value={sourcePlatform}
                onChange={e => setSourcePlatform(e.target.value as SourcePlatform)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer"
              >
                <option value="WhatsApp">WhatsApp (Forward / Group)</option>
                <option value="X">X (Twitter)</option>
                <option value="Instagram">Instagram (Reel / Post)</option>
                <option value="Facebook">Facebook</option>
                <option value="Telegram">Telegram Channel</option>
                <option value="Other">Other Media / SMS</option>
              </select>
            </div>

            <div>
              <label htmlFor="select-category" className="block text-xs font-semibold text-neutral-800 mb-1">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                id="select-category"
                value={category}
                onChange={e => setCategory(e.target.value as ClaimCategory)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer"
              >
                <option value="Politics">Politics & Governance</option>
                <option value="Health">Health & Medical</option>
                <option value="Finance">Finance, Banking & UPI</option>
                <option value="Other">Other Public Interest</option>
              </select>
            </div>
          </div>

          {/* Grid: Source link & Indian Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="input-source-url" className="block text-xs font-semibold text-neutral-800 mb-1">
                Source Link (Optional)
              </label>
              <input
                id="input-source-url"
                type="url"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900 placeholder:text-neutral-400"
              />
              <p className="text-[10px] text-neutral-400 mt-0.5">
                Adding a verifiable URL clears the "Unsourced" risk flag.
              </p>
            </div>

            <div>
              <label htmlFor="input-region" className="block text-xs font-semibold text-neutral-800 mb-1">
                Region / City in India
              </label>
              <input
                id="input-region"
                type="text"
                value={region}
                onChange={e => setRegion(e.target.value)}
                placeholder="e.g. Pan-India, Delhi, Mumbai, Bengaluru"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              id="btn-cancel-submit"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-confirm-submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-black active:bg-neutral-950 text-white transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Submitting to Triage...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Claim</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

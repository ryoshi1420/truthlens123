import React, { useState, useEffect } from 'react';
import { Claim } from '../types';
import { evaluateRiskFlags } from '../utils/riskAnalyzer';
import { X, Save, AlertCircle, RefreshCw } from 'lucide-react';

interface EditClaimModalProps {
  claim: Claim | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveEdit: (claimId: string, updatedData: { text: string; sourceUrl?: string; editReason: string }) => Promise<void>;
  allowEditing: boolean;
}

export const EditClaimModal: React.FC<EditClaimModalProps> = ({
  claim,
  isOpen,
  onClose,
  onSaveEdit,
  allowEditing,
}) => {
  const [text, setText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [editReason, setEditReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (claim) {
      setText(claim.text);
      setSourceUrl(claim.sourceUrl || '');
      setEditReason('');
      setErrorMsg('');
    }
  }, [claim]);

  if (!isOpen || !claim) return null;

  const currentAnalysis = evaluateRiskFlags(text, sourceUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || text.trim().length < 8) {
      setErrorMsg('Claim text must be at least 8 characters long.');
      return;
    }
    if (!editReason.trim() || editReason.trim().length < 4) {
      setErrorMsg('Please specify a brief edit reason for the transparent audit log.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSaveEdit(claim.id, {
        text: text.trim(),
        sourceUrl: sourceUrl.trim() || undefined,
        editReason: editReason.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to edit claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="modal-edit-claim-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="modal-edit-claim"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Edit Claim (Decision Point 3)</h2>
            <p className="text-xs text-neutral-500">
              Audit log recorded. Flags will be recalculated immediately.
            </p>
          </div>
          <button
            id="btn-close-edit-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!allowEditing ? (
          <div className="p-6 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-sm font-bold text-neutral-900">Edits Currently Disabled by Policy</h3>
            <p className="text-xs text-neutral-600 max-w-sm mx-auto">
              Under the active DP3 editorial policy, claims are strictly immutable to maintain tamper-evident legal records. Enable editing in the "Decision Points" menu to test this feature.
            </p>
            <button
              onClick={onClose}
              className="mt-2 px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 text-white cursor-pointer"
            >
              Understood
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label htmlFor="input-edit-text" className="block text-xs font-semibold text-neutral-800 mb-1">
                Updated Claim Text
              </label>
              <textarea
                id="input-edit-text"
                rows={3}
                required
                value={text}
                onChange={e => setText(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900"
              />
            </div>

            <div>
              <label htmlFor="input-edit-source-url" className="block text-xs font-semibold text-neutral-800 mb-1">
                Source Link (e.g. adding missing source removes Unsourced flag)
              </label>
              <input
                id="input-edit-source-url"
                type="url"
                value={sourceUrl}
                onChange={e => setSourceUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900"
              />
            </div>

            <div>
              <label htmlFor="input-edit-reason" className="block text-xs font-semibold text-neutral-800 mb-1">
                Reason for Edit (Permanent Audit Log) <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-edit-reason"
                type="text"
                required
                value={editReason}
                onChange={e => setEditReason(e.target.value)}
                placeholder="e.g. Added authentic news link, fixed typo, updated context"
                className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900"
              />
            </div>

            {/* Live recalculation preview */}
            <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200 text-xs">
              <div className="flex items-center justify-between font-semibold text-neutral-700 mb-1">
                <span className="flex items-center gap-1">
                  <RefreshCw className="w-3.5 h-3.5 text-neutral-500" />
                  Recalculated Flags:
                </span>
                <span className="font-mono text-[11px]">
                  {currentAnalysis.isHighRisk ? '⚠️ High Risk (2+ Flags)' : `${currentAnalysis.flags.length} Flag(s)`}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {currentAnalysis.flags.map(f => (
                  <span key={f.type} className="px-2 py-0.5 rounded bg-neutral-200 text-neutral-800 text-[10px] font-mono">
                    {f.label}
                  </span>
                ))}
                {currentAnalysis.flags.length === 0 && (
                  <span className="text-[11px] text-emerald-600 font-medium">Clean · No risk flags triggered</span>
                )}
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {errorMsg}
              </div>
            )}

            <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                id="btn-cancel-edit"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-confirm-edit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-black text-white cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Saving...' : 'Save & Recalculate Flags'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

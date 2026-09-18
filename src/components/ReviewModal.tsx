import React, { useState, useEffect } from 'react';
import { Claim, ClaimStatus } from '../types';
import {
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Save,
  Link,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface ReviewModalProps {
  claim: Claim | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (reviewData: {
    claimId: string;
    status: ClaimStatus;
    reviewerNote: string;
    reviewerName: string;
    verificationSourceUrl?: string;
  }) => Promise<void>;
}

const TEMPLATE_NOTES: { label: string; status: ClaimStatus; note: string; source: string }[] = [
  {
    label: 'Official Govt Debunk',
    status: 'False',
    note: 'Debunked by official press release. No such notification or scheme has been sanctioned by the concerned ministry.',
    source: 'https://pib.gov.in/factcheck',
  },
  {
    label: 'Medical Health Warning',
    status: 'False',
    note: 'Medical guidelines and WHO confirm that this viral home concoction lacks clinical efficacy and can cause severe dehydration or delay vital hospital treatment.',
    source: 'https://mohfw.gov.in',
  },
  {
    label: 'Verified Official Announcement',
    status: 'Verified True',
    note: 'Confirmed through official gazette notification and government press briefing.',
    source: 'https://india.gov.in',
  },
  {
    label: 'Out of Context / Misleading',
    status: 'Misleading',
    note: 'The post uses authentic footage from a 2019 event and falsely misattributes it to recent developments.',
    source: '',
  },
];

export const ReviewModal: React.FC<ReviewModalProps> = ({
  claim,
  isOpen,
  onClose,
  onSubmitReview,
}) => {
  const [status, setStatus] = useState<ClaimStatus>('False');
  const [reviewerNote, setReviewerNote] = useState('');
  const [reviewerName, setReviewerName] = useState('Senior Fact-Checker, Newsroom Desk');
  const [verificationSourceUrl, setVerificationSourceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (claim) {
      setStatus(claim.status === 'Unverified' ? 'False' : claim.status);
      setReviewerNote(claim.reviewerNote || '');
      setReviewerName(claim.reviewerName || 'Senior Fact-Checker, Newsroom Desk');
      setVerificationSourceUrl(claim.verificationSourceUrl || '');
      setErrorMsg('');
    }
  }, [claim]);

  if (!isOpen || !claim) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerNote.trim() || reviewerNote.trim().length < 8) {
      setErrorMsg('Please enter an explanatory reviewer note of at least 8 characters.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSubmitReview({
        claimId: claim.id,
        status,
        reviewerNote: reviewerNote.trim(),
        reviewerName: reviewerName.trim(),
        verificationSourceUrl: verificationSourceUrl.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const applyTemplate = (tpl: typeof TEMPLATE_NOTES[0]) => {
    setStatus(tpl.status);
    setReviewerNote(tpl.note);
    if (tpl.source) setVerificationSourceUrl(tpl.source);
  };

  return (
    <div
      id="modal-review-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="modal-review"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-lg bg-white rounded-2xl border border-neutral-200 shadow-xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-amber-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900">Review Workflow (Feature 3)</h2>
              <p className="text-xs text-neutral-500">
                Move claim from Unverified to factual verdict with neutral notes.
              </p>
            </div>
          </div>
          <button
            id="btn-close-review-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Claim excerpt */}
          <div className="p-3 rounded-lg bg-neutral-50 border border-neutral-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Under Review:
            </span>
            <p className="text-xs text-neutral-800 line-clamp-3 italic">
              "{claim.text}"
            </p>
          </div>

          {/* Quick template helpers */}
          <div>
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              Quick editorial note snippets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_NOTES.map((tpl, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => applyTemplate(tpl)}
                  className="px-2 py-0.5 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded border border-neutral-200 font-medium transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-600" />
                  <span>{tpl.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status Selection (Feature 3) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-800 mb-2">
              Verdict Status <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-verdict-false"
                onClick={() => setStatus('False')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  status === 'False'
                    ? 'bg-rose-50 border-rose-400 text-rose-800 ring-2 ring-rose-200'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <div className="text-left">
                  <div className="font-bold">False (Debunked)</div>
                  <div className="text-[10px] font-normal text-neutral-500">Fabricated rumor</div>
                </div>
              </button>

              <button
                type="button"
                id="btn-verdict-misleading"
                onClick={() => setStatus('Misleading')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  status === 'Misleading'
                    ? 'bg-amber-50 border-amber-400 text-amber-800 ring-2 ring-amber-200'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <div className="text-left">
                  <div className="font-bold">Misleading</div>
                  <div className="text-[10px] font-normal text-neutral-500">Out of context</div>
                </div>
              </button>

              <button
                type="button"
                id="btn-verdict-true"
                onClick={() => setStatus('Verified True')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  status === 'Verified True'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-800 ring-2 ring-emerald-200'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="text-left">
                  <div className="font-bold">Verified True</div>
                  <div className="text-[10px] font-normal text-neutral-500">Authentic facts</div>
                </div>
              </button>

              <button
                type="button"
                id="btn-verdict-unverified"
                onClick={() => setStatus('Unverified')}
                className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                  status === 'Unverified'
                    ? 'bg-neutral-100 border-neutral-400 text-neutral-800 ring-2 ring-neutral-300'
                    : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                }`}
              >
                <Clock className="w-4 h-4 text-neutral-500 shrink-0" />
                <div className="text-left">
                  <div className="font-bold">Unverified</div>
                  <div className="text-[10px] font-normal text-neutral-500">Hold in triage</div>
                </div>
              </button>
            </div>
          </div>

          {/* Short Review Note (Feature 3) */}
          <div>
            <label htmlFor="input-reviewer-note" className="block text-xs font-semibold text-neutral-800 mb-1">
              Short Reviewer Note / Fact-Check Explanation <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="input-reviewer-note"
              rows={3}
              required
              value={reviewerNote}
              onChange={e => setReviewerNote(e.target.value)}
              placeholder="State the verified facts neutrally: quote official agency refutations or corroboration..."
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white text-neutral-900"
            />
          </div>

          {/* Official Verification Link */}
          <div>
            <label htmlFor="input-review-source-url" className="block text-xs font-semibold text-neutral-800 mb-1 flex items-center gap-1">
              <Link className="w-3 h-3 text-neutral-500" />
              <span>Authoritative Evidence / Circular Link (Optional)</span>
            </label>
            <input
              id="input-review-source-url"
              type="url"
              value={verificationSourceUrl}
              onChange={e => setVerificationSourceUrl(e.target.value)}
              placeholder="https://pib.gov.in or https://rbi.org.in"
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900"
            />
          </div>

          {/* Reviewer Desk Identity */}
          <div>
            <label htmlFor="input-reviewer-name" className="block text-xs font-semibold text-neutral-800 mb-1">
              Reviewer Name / Desk Signature
            </label>
            <input
              id="input-reviewer-name"
              type="text"
              value={reviewerName}
              onChange={e => setReviewerName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 text-neutral-900"
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Footer actions */}
          <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              id="btn-cancel-review"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-save-review"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-neutral-900 hover:bg-black text-white transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving Review...' : 'Commit Fact-Check Verdict'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

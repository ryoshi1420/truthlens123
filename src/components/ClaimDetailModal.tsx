import React, { useState } from 'react';
import { Claim } from '../types';
import {
  X,
  Share2,
  Check,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Flame,
  Volume2,
  Link2Off,
  UserCheck,
  History,
  Calendar,
  Globe,
  Edit3,
} from 'lucide-react';

interface ClaimDetailModalProps {
  claim: Claim | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReview: (claim: Claim) => void;
  onOpenEdit: (claim: Claim) => void;
  isNewsroomMode: boolean;
}

export const ClaimDetailModal: React.FC<ClaimDetailModalProps> = ({
  claim,
  isOpen,
  onClose,
  onOpenReview,
  onOpenEdit,
  isNewsroomMode,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  if (!isOpen || !claim) return null;

  const handleCopyWhatsAppShare = () => {
    const verdictText =
      claim.status === 'False'
        ? '❌ *FACT-CHECK: FAKE / DEBUNKED*'
        : claim.status === 'Verified True'
        ? '✅ *FACT-CHECK: VERIFIED TRUE*'
        : claim.status === 'Misleading'
        ? '⚠️ *FACT-CHECK: MISLEADING / OUT OF CONTEXT*'
        : '⏳ *FACT-CHECK: UNVERIFIED RUMOR UNDER INVESTIGATION*';

    const textToShare = `*Truth Lens Fact-Check Alert*\n\n${verdictText}\n\n*Viral Claim:* "${claim.text}"\n\n*Platform:* ${claim.sourcePlatform}\n*Region:* ${claim.region || 'India'}\n*Editorial Verdict Note:* ${
      claim.reviewerNote || 'Currently undergoing verification by civic fact-checkers.'
    }\n${claim.verificationSourceUrl ? `*Official Evidence Link:* ${claim.verificationSourceUrl}\n` : ''}\n_Shared via Truth Lens Civic Tech._`;

    navigator.clipboard.writeText(textToShare);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2200);
  };

  const getStatusBadge = () => {
    switch (claim.status) {
      case 'Verified True':
        return {
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: CheckCircle2,
          label: 'Verified True',
        };
      case 'False':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: XCircle,
          label: 'Debunked False',
        };
      case 'Misleading':
        return {
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: AlertTriangle,
          label: 'Misleading',
        };
      case 'Unverified':
      default:
        return {
          bg: 'bg-neutral-100 text-neutral-800 border-neutral-300',
          icon: Clock,
          label: 'Unverified (In Triage)',
        };
    }
  };

  const statusConfig = getStatusBadge();
  const StatusIcon = statusConfig.icon;

  const formatISTDate = (isoString?: string) => {
    if (!isoString) return 'N/A';
    return new Date(isoString).toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  return (
    <div
      id="modal-claim-detail-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="modal-claim-detail"
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-2xl border border-neutral-200 shadow-2xl overflow-hidden my-6"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/80">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.bg}`}
            >
              <StatusIcon className="w-4 h-4" />
              {statusConfig.label}
            </span>
            {claim.isHighRisk && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                <AlertTriangle className="w-3.5 h-3.5" />
                High Risk
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-close-detail-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-200">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-neutral-400">Platform:</span>
              <span className="font-semibold text-neutral-900">{claim.sourcePlatform}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-neutral-400">Category:</span>
              <span className="font-semibold text-neutral-900">{claim.category}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1.5 font-medium">
              <span className="text-neutral-400">Region:</span>
              <span className="font-semibold text-neutral-900">{claim.region || 'Pan-India'}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1 text-neutral-500">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span>Submitted: {formatISTDate(claim.submittedAt)} (IST)</span>
            </div>
          </div>

          {/* Full Claim Text (Feature 5) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
              Viral Claim Full Text
            </h3>
            <div className="p-4 rounded-xl bg-neutral-900 text-neutral-50 text-base sm:text-lg font-medium leading-relaxed shadow-xs selection:bg-neutral-700">
              "{claim.text}"
            </div>
          </div>

          {/* Source Link if provided */}
          {claim.sourceUrl ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 font-medium">Source URL Provided:</span>
              <a
                href={claim.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-900 font-mono underline hover:text-black flex items-center gap-1 truncate max-w-md"
              >
                <span>{claim.sourceUrl}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          ) : (
            <div className="text-xs text-rose-600 font-medium flex items-center gap-1.5">
              <Link2Off className="w-4 h-4" />
              <span>No original publication or authoritative source link provided by submitter.</span>
            </div>
          )}

          {/* Risk Flags Analysis Breakdown (Feature 2) */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5">
              Automated Risk Flags Analysis (Feature 2)
            </h3>
            <div className="space-y-2">
              {claim.flags.map((flag, idx) => {
                let IconComponent = AlertTriangle;
                let borderStyle = 'border-neutral-200 bg-neutral-50';

                if (flag.type === 'Sensational') {
                  IconComponent = Flame;
                  borderStyle = 'border-amber-200 bg-amber-50/60 text-amber-900';
                } else if (flag.type === 'Shouting') {
                  IconComponent = Volume2;
                  borderStyle = 'border-orange-200 bg-orange-50/60 text-orange-900';
                } else if (flag.type === 'Unsourced') {
                  IconComponent = Link2Off;
                  borderStyle = 'border-rose-200 bg-rose-50/60 text-rose-900';
                }

                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border ${borderStyle} flex items-start gap-3`}
                  >
                    <IconComponent className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-bold block">{flag.label} Signal Triggered</span>
                      <p className="text-xs text-neutral-700 mt-0.5">{flag.reason}</p>
                    </div>
                  </div>
                );
              })}

              {claim.flags.length === 0 && (
                <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No automated risk flags triggered. Claim contains sober vocabulary, mixed case, and a verified source link.</span>
                </div>
              )}
            </div>
          </div>

          {/* Reviewer Note & Fact-Check Verdict (Feature 3 & 5) */}
          <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-neutral-800" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-800">
                  Editorial Fact-Check Review
                </h3>
              </div>
              {claim.reviewedAt && (
                <span className="text-[11px] text-neutral-500 font-mono">
                  Verified: {formatISTDate(claim.reviewedAt)}
                </span>
              )}
            </div>

            {claim.reviewerNote ? (
              <div className="pt-1">
                <p className="text-sm text-neutral-800 leading-relaxed font-normal">
                  {claim.reviewerNote}
                </p>
                {claim.verificationSourceUrl && (
                  <div className="mt-2.5 pt-2.5 border-t border-neutral-200 flex items-center gap-2 text-xs">
                    <span className="text-neutral-500">Official Fact-Check Source:</span>
                    <a
                      href={claim.verificationSourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-neutral-900 underline flex items-center gap-1 hover:text-black"
                    >
                      <span>{claim.verificationSourceUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                {claim.reviewerName && (
                  <p className="text-xs text-neutral-400 mt-2">
                    Reviewed by: <strong className="text-neutral-600 font-semibold">{claim.reviewerName}</strong>
                  </p>
                )}
              </div>
            ) : (
              <div className="pt-1 text-xs text-neutral-500">
                This claim is currently pending triage review by newsroom fact-checkers.
              </div>
            )}
          </div>

          {/* Decision Point 3: Revision History & Audit Trail */}
          {claim.revisions && claim.revisions.length > 0 && (
            <div className="p-4 rounded-xl border border-neutral-200 bg-white space-y-2">
              <div className="flex items-center gap-1.5 text-neutral-800">
                <History className="w-4 h-4 text-neutral-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Audit History (Decision Point 3)
                </h3>
              </div>
              <p className="text-xs text-neutral-500">
                Transparency log: Edits re-evaluate automated risk flags to prevent viral tampering.
              </p>
              <div className="space-y-2 pt-1">
                {claim.revisions.map((rev, i) => (
                  <div key={i} className="p-2.5 rounded bg-neutral-50 border border-neutral-200 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1">
                      <span>Revision #{i + 1}</span>
                      <span>{formatISTDate(rev.editedAt)}</span>
                    </div>
                    <p className="text-neutral-700 font-medium mb-1">Reason: {rev.note}</p>
                    <div className="text-[11px] text-neutral-500 line-through truncate">
                      Old: "{rev.previousText}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-neutral-200 bg-neutral-50/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              id="btn-detail-share-wa"
              onClick={handleCopyWhatsAppShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              {copiedShare ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied WhatsApp Debunk!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Copy WhatsApp Debunk Format</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-detail-edit"
              onClick={() => {
                onClose();
                onOpenEdit(claim);
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-neutral-700 bg-white border border-neutral-300 hover:bg-neutral-100 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Claim (DP3)</span>
            </button>

            {isNewsroomMode && (
              <button
                id="btn-detail-review"
                onClick={() => {
                  onClose();
                  onOpenReview(claim);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer shadow-2xs"
              >
                <UserCheck className="w-4 h-4" />
                <span>Update Fact-Check Review</span>
              </button>
            )}

            <button
              id="btn-detail-close"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-200 hover:bg-neutral-300 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Claim } from '../types';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  Share2,
  ExternalLink,
  Edit3,
  Check,
  MessageSquare,
  Flame,
  Volume2,
  Link2Off,
  UserCheck,
} from 'lucide-react';

interface ClaimCardProps {
  claim: Claim;
  isNewsroomMode: boolean;
  onOpenDetail: (claim: Claim) => void;
  onOpenReview: (claim: Claim) => void;
  onOpenEdit: (claim: Claim) => void;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({
  claim,
  isNewsroomMode,
  onOpenDetail,
  onOpenReview,
  onOpenEdit,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  // Time formatter
  const getTimeAgo = (isoString: string) => {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Status badge style
  const getStatusBadge = () => {
    switch (claim.status) {
      case 'Verified True':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-300',
          icon: CheckCircle2,
          label: 'Verified True',
        };
      case 'False':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-300',
          icon: XCircle,
          label: 'Debunked False',
        };
      case 'Misleading':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-300',
          icon: AlertTriangle,
          label: 'Misleading',
        };
      case 'Unverified':
      default:
        return {
          bg: 'bg-neutral-100 text-neutral-700 border-neutral-300',
          icon: Clock,
          label: 'Unverified (In Triage)',
        };
    }
  };

  const statusConfig = getStatusBadge();
  const StatusIcon = statusConfig.icon;

  // Platform styling
  const getPlatformBadge = (platform: Claim['sourcePlatform']) => {
    switch (platform) {
      case 'WhatsApp':
        return 'bg-emerald-100/70 text-emerald-800 border-emerald-200';
      case 'X':
        return 'bg-neutral-900 text-white border-neutral-900';
      case 'Instagram':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'Telegram':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      default:
        return 'bg-neutral-100 text-neutral-700 border-neutral-200';
    }
  };

  // WhatsApp Debunk sharing helper
  const handleCopyWhatsAppShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const verdictText =
      claim.status === 'False'
        ? '❌ *FACT-CHECK: FAKE / DEBUNKED*'
        : claim.status === 'Verified True'
        ? '✅ *FACT-CHECK: VERIFIED TRUE*'
        : claim.status === 'Misleading'
        ? '⚠️ *FACT-CHECK: MISLEADING / OUT OF CONTEXT*'
        : '⏳ *FACT-CHECK: UNVERIFIED RUMOR UNDER INVESTIGATION*';

    const textToShare = `*Truth Lens India Fact-Check Alert*\n\n${verdictText}\n\n*Claim:* "${claim.text}"\n\n*Source Platform:* ${claim.sourcePlatform}\n*Status Note:* ${claim.reviewerNote || 'Awaiting editorial verification from fact-checking desk.'}\n\n_Do not forward unverified claims. Check before you share._`;

    navigator.clipboard.writeText(textToShare);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2200);
  };

  return (
    <article
      id={`claim-card-${claim.id}`}
      onClick={() => onOpenDetail(claim)}
      className={`relative bg-white rounded-xl border p-4 sm:p-5 transition-all hover:shadow-sm cursor-pointer ${
        claim.isHighRisk
          ? 'border-rose-300 ring-1 ring-rose-200/60 bg-rose-50/10'
          : 'border-neutral-200 hover:border-neutral-300'
      }`}
    >
      {/* Top row: Platform, Category, Status & High Risk */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Source Platform Badge */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${getPlatformBadge(
              claim.sourcePlatform
            )}`}
          >
            {claim.sourcePlatform}
          </span>

          {/* Category */}
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-neutral-100 text-neutral-600 border border-neutral-200">
            {claim.category}
          </span>

          {/* Region tag */}
          {claim.region && (
            <span className="text-[11px] text-neutral-400 font-mono hidden sm:inline">
              · {claim.region}
            </span>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-1.5">
          {claim.isHighRisk && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white shadow-2xs animate-pulse"
              title="2 or more risk flags detected! High risk viral rumor."
            >
              <AlertTriangle className="w-3 h-3" />
              High Risk
            </span>
          )}

          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusConfig.bg}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Claim Text */}
      <div className="mb-3">
        <p className="text-sm sm:text-base font-medium text-neutral-900 leading-snug line-clamp-3">
          "{claim.text}"
        </p>
      </div>

      {/* Risk Flags Row (Feature 2) */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="text-[11px] text-neutral-400 font-medium mr-1">Signals:</span>
        {claim.flags.map(flag => {
          let IconComponent = HelpCircle;
          let colorStyle = 'bg-neutral-100 text-neutral-700 border-neutral-200';

          if (flag.type === 'Sensational') {
            IconComponent = Flame;
            colorStyle = 'bg-amber-100 text-amber-800 border-amber-300';
          } else if (flag.type === 'Shouting') {
            IconComponent = Volume2;
            colorStyle = 'bg-orange-100 text-orange-800 border-orange-300';
          } else if (flag.type === 'Unsourced') {
            IconComponent = Link2Off;
            colorStyle = 'bg-neutral-100 text-neutral-600 border-neutral-300';
          }

          return (
            <span
              key={flag.type}
              title={flag.reason}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${colorStyle}`}
            >
              <IconComponent className="w-3 h-3" />
              <span>{flag.label}</span>
            </span>
          );
        })}

        {claim.flags.length === 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            No viral risk flags detected
          </span>
        )}
      </div>

      {/* Reviewer note preview if reviewed (Feature 3 & 5) */}
      {claim.reviewerNote && (
        <div className="mb-3 p-2.5 rounded-lg bg-neutral-50 border border-neutral-200 text-xs text-neutral-800">
          <div className="flex items-center gap-1 font-semibold text-neutral-900 mb-0.5">
            <UserCheck className="w-3.5 h-3.5 text-neutral-700" />
            <span>Fact-Check Verdict Note:</span>
            {claim.reviewerName && (
              <span className="font-normal text-neutral-500">by {claim.reviewerName}</span>
            )}
          </div>
          <p className="line-clamp-2 text-neutral-700 leading-relaxed">
            {claim.reviewerNote}
          </p>
        </div>
      )}

      {/* Bottom info & actions */}
      <div className="pt-2.5 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <span>Submitted {getTimeAgo(claim.submittedAt)}</span>
          {claim.revisions && claim.revisions.length > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 bg-neutral-100 text-neutral-600 rounded font-mono">
              Edited ({claim.revisions.length})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
          {/* WhatsApp copy debunk */}
          <button
            id={`btn-share-wa-${claim.id}`}
            onClick={handleCopyWhatsAppShare}
            className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-medium transition-colors cursor-pointer border border-emerald-200"
            title="Copy debunk formatted for WhatsApp family & community groups"
          >
            {copiedShare ? (
              <>
                <Check className="w-3 h-3 text-emerald-700" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3 h-3 text-emerald-700" />
                <span className="hidden sm:inline">WhatsApp Debunk</span>
                <span className="sm:hidden">Share</span>
              </>
            )}
          </button>

          {/* If newsroom mode, Quick Review button */}
          {isNewsroomMode && (
            <button
              id={`btn-review-${claim.id}`}
              onClick={() => onOpenReview(claim)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-amber-500 hover:bg-amber-600 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <UserCheck className="w-3 h-3" />
              <span>Review</span>
            </button>
          )}

          {/* Edit button (DP3) */}
          <button
            id={`btn-edit-${claim.id}`}
            onClick={() => onOpenEdit(claim)}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Edit Claim & Recalculate Flags (DP3)"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* View Details */}
          <button
            id={`btn-detail-${claim.id}`}
            onClick={() => onOpenDetail(claim)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-neutral-900 hover:bg-black text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <span>Details</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>
    </article>
  );
};

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Claim,
  ClaimCategory,
  ClaimStatus,
  DecisionPointsConfig,
  FeedSortOption,
  SourcePlatform,
  TriageStats,
  VisibilityPolicy,
} from './types';
import { initialClaims } from './data/seedClaims';
import { evaluateRiskFlags } from './utils/riskAnalyzer';

// Components
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { FilterBar } from './components/FilterBar';
import { ClaimCard } from './components/ClaimCard';
import { SubmitClaimModal } from './components/SubmitClaimModal';
import { ClaimDetailModal } from './components/ClaimDetailModal';
import { ReviewModal } from './components/ReviewModal';
import { DecisionPointsModal } from './components/DecisionPointsModal';
import { EditClaimModal } from './components/EditClaimModal';
import { GitHubDeployModal } from './components/GitHubDeployModal';

// Icons
import {
  AlertTriangle,
  Plus,
  SlidersHorizontal,
  RefreshCw,
  SearchX,
  Sparkles,
  ShieldCheck,
  Eye,
  Info,
} from 'lucide-react';

// LocalStorage keys for static GitHub Pages deployment
const STORAGE_KEY_CLAIMS = 'truth_lens_claims_v1';
const STORAGE_KEY_POLICY = 'truth_lens_policy_v1';

export default function App() {
  // State
  const [claims, setClaims] = useState<Claim[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CLAIMS);
      if (saved) return JSON.parse(saved);
    } catch {}
    return initialClaims;
  });
  const [stats, setStats] = useState<TriageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);

  // User mode: Citizen vs Newsroom Fact-Checker
  const [isNewsroomMode, setIsNewsroomMode] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Decision Points Policy Config (DP1, DP2, DP3)
  const [policy, setPolicy] = useState<DecisionPointsConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POLICY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      feedOrder: 'risk',
      visibility: 'all',
      allowEditing: true,
    };
  });

  // Modals state
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isDPOpen, setIsDPOpen] = useState(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState(false);
  const [selectedClaimDetail, setSelectedClaimDetail] = useState<Claim | null>(null);
  const [selectedClaimReview, setSelectedClaimReview] = useState<Claim | null>(null);
  const [selectedClaimEdit, setSelectedClaimEdit] = useState<Claim | null>(null);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(current => (current === msg ? null : current));
    }, 3500);
  };

  // Re-calculate stats locally or from backend
  const computeLocalStats = useCallback((claimsList: Claim[]): TriageStats => {
    return {
      totalClaims: claimsList.length,
      unverifiedCount: claimsList.filter(c => c.status === 'Unverified').length,
      highRiskCount: claimsList.filter(c => c.isHighRisk).length,
      debunkedFalseCount: claimsList.filter(c => c.status === 'False').length,
      verifiedTrueCount: claimsList.filter(c => c.status === 'Verified True').length,
      misleadingCount: claimsList.filter(c => c.status === 'Misleading').length,
    };
  }, []);

  // Fetch initial data from Express backend
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [claimsRes, statsRes, policyRes] = await Promise.all([
        fetch('/api/claims'),
        fetch('/api/stats'),
        fetch('/api/policy'),
      ]);

      if (claimsRes.ok) {
        const claimsData = await claimsRes.json();
        setClaims(claimsData.claims || initialClaims);
        setApiOnline(true);
      } else {
        const saved = localStorage.getItem(STORAGE_KEY_CLAIMS);
        if (saved) {
          try {
            setClaims(JSON.parse(saved));
          } catch {
            setClaims(initialClaims);
          }
        }
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      } else {
        setStats(computeLocalStats(claims));
      }

      if (policyRes.ok) {
        const policyData = await policyRes.json();
        setPolicy(policyData);
      }
    } catch (err) {
      console.warn('Backend API not reachable (running on static host like GitHub Pages):', err);
      const saved = localStorage.getItem(STORAGE_KEY_CLAIMS);
      if (saved) {
        try {
          setClaims(JSON.parse(saved));
        } catch {
          setClaims(initialClaims);
        }
      }
      setStats(computeLocalStats(claims));
    } finally {
      setLoading(false);
    }
  }, [computeLocalStats, claims]);

  useEffect(() => {
    fetchData();
  }, []);

  // Sync to localStorage for static hosting environments (e.g., GitHub Pages)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(claims));
      localStorage.setItem(STORAGE_KEY_POLICY, JSON.stringify(policy));
    } catch (e) {
      console.warn('Failed to save to localStorage', e);
    }
  }, [claims, policy]);

  // Handle Submitting a new claim (Feature 1 & Feature 2)
  const handleSubmitClaim = async (data: {
    text: string;
    sourcePlatform: SourcePlatform;
    sourceUrl?: string;
    category: ClaimCategory;
    region?: string;
  }) => {
    try {
      const res = await fetch('/api/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const newClaim = await res.json();
        setClaims(prev => [newClaim, ...prev]);
        setStats(prev => (prev ? { ...prev, totalClaims: prev.totalClaims + 1, unverifiedCount: prev.unverifiedCount + 1, highRiskCount: prev.highRiskCount + (newClaim.isHighRisk ? 1 : 0) } : null));
        showToast('Claim submitted to triage queue successfully!');
      } else {
        // Fallback client insertion
        const { flags, isHighRisk } = evaluateRiskFlags(data.text, data.sourceUrl);
        const fallbackClaim: Claim = {
          id: `claim-${Date.now()}`,
          text: data.text,
          sourcePlatform: data.sourcePlatform,
          sourceUrl: data.sourceUrl,
          category: data.category,
          region: data.region || 'Pan-India',
          status: 'Unverified',
          flags,
          isHighRisk,
          submittedAt: new Date().toISOString(),
          revisions: [],
        };
        setClaims(prev => [fallbackClaim, ...prev]);
        showToast('Claim queued in triage stream!');
      }
    } catch (e) {
      const { flags, isHighRisk } = evaluateRiskFlags(data.text, data.sourceUrl);
      const fallbackClaim: Claim = {
        id: `claim-${Date.now()}`,
        text: data.text,
        sourcePlatform: data.sourcePlatform,
        sourceUrl: data.sourceUrl,
        category: data.category,
        region: data.region || 'Pan-India',
        status: 'Unverified',
        flags,
        isHighRisk,
        submittedAt: new Date().toISOString(),
        revisions: [],
      };
      setClaims(prev => [fallbackClaim, ...prev]);
      showToast('Claim queued in triage stream!');
    }
  };

  // Handle Review workflow (Feature 3)
  const handleReviewClaim = async (reviewData: {
    claimId: string;
    status: ClaimStatus;
    reviewerNote: string;
    reviewerName: string;
    verificationSourceUrl?: string;
  }) => {
    try {
      const res = await fetch(`/api/claims/${reviewData.claimId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });

      if (res.ok) {
        const updatedClaim: Claim = await res.json();
        setClaims(prev => prev.map(c => (c.id === updatedClaim.id ? updatedClaim : c)));
        if (selectedClaimDetail?.id === updatedClaim.id) {
          setSelectedClaimDetail(updatedClaim);
        }
        showToast(`Verdict committed: Moved to "${updatedClaim.status}"!`);
      } else {
        // Local state update fallback
        setClaims(prev =>
          prev.map(c => {
            if (c.id === reviewData.claimId) {
              return {
                ...c,
                status: reviewData.status,
                reviewerNote: reviewData.reviewerNote,
                reviewerName: reviewData.reviewerName,
                verificationSourceUrl: reviewData.verificationSourceUrl,
                reviewedAt: new Date().toISOString(),
              };
            }
            return c;
          })
        );
        showToast(`Verdict saved locally: "${reviewData.status}"!`);
      }
    } catch (e) {
      setClaims(prev =>
        prev.map(c => {
          if (c.id === reviewData.claimId) {
            return {
              ...c,
              status: reviewData.status,
              reviewerNote: reviewData.reviewerNote,
              reviewerName: reviewData.reviewerName,
              verificationSourceUrl: reviewData.verificationSourceUrl,
              reviewedAt: new Date().toISOString(),
            };
          }
          return c;
        })
      );
      showToast(`Verdict updated!`);
    }
  };

  // Handle Edit Claim (Decision Point 3)
  const handleEditClaim = async (
    claimId: string,
    updatedData: { text: string; sourceUrl?: string; editReason: string }
  ) => {
    try {
      const res = await fetch(`/api/claims/${claimId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) {
        const updatedClaim: Claim = await res.json();
        setClaims(prev => prev.map(c => (c.id === updatedClaim.id ? updatedClaim : c)));
        if (selectedClaimDetail?.id === updatedClaim.id) {
          setSelectedClaimDetail(updatedClaim);
        }
        showToast('Claim updated and risk flags recalculated!');
      } else {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to edit claim');
      }
    } catch (e: any) {
      // Local fallback with audited revision
      const { flags, isHighRisk } = evaluateRiskFlags(updatedData.text, updatedData.sourceUrl);
      setClaims(prev =>
        prev.map(c => {
          if (c.id === claimId) {
            const revisions = c.revisions || [];
            revisions.push({
              editedAt: new Date().toISOString(),
              previousText: c.text,
              newText: updatedData.text,
              note: updatedData.editReason,
            });
            return {
              ...c,
              text: updatedData.text,
              sourceUrl: updatedData.sourceUrl,
              flags,
              isHighRisk,
              revisions,
            };
          }
          return c;
        })
      );
      showToast('Claim edited with audit entry.');
    }
  };

  // Handle policy change (DP1, DP2, DP3)
  const handleUpdatePolicy = async (newPolicy: Partial<DecisionPointsConfig>) => {
    const updated = { ...policy, ...newPolicy };
    setPolicy(updated);

    try {
      await fetch('/api/policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPolicy),
      });
      showToast('Editorial policy updated!');
    } catch (e) {
      console.warn('Policy update local only', e);
    }
  };

  // Reset to initial seed claims
  const handleResetData = async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
      setClaims(initialClaims);
      setPolicy({
        feedOrder: 'risk',
        visibility: 'all',
        allowEditing: true,
      });
      setStats(computeLocalStats(initialClaims));
      showToast('Reset to initial Indian viral claims dataset.');
    } catch (e) {
      setClaims(initialClaims);
      showToast('Reset local claims dataset.');
    }
  };

  // Filtered and Sorted Claims (Feature 4 + DP1 & DP2)
  const filteredClaims = useMemo(() => {
    let list = [...claims];

    // DP2: Visibility policy check
    if (policy.visibility === 'quarantine_unverified') {
      list = list.filter(c => c.status !== 'Unverified');
    }

    // Category filter
    if (selectedCategory !== 'All') {
      list = list.filter(c => c.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Status filter
    if (selectedStatus !== 'All') {
      if (selectedStatus === 'High Risk') {
        list = list.filter(c => c.isHighRisk);
      } else {
        list = list.filter(c => c.status.toLowerCase() === selectedStatus.toLowerCase());
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        c =>
          c.text.toLowerCase().includes(q) ||
          (c.reviewerNote && c.reviewerNote.toLowerCase().includes(q)) ||
          (c.region && c.region.toLowerCase().includes(q)) ||
          c.sourcePlatform.toLowerCase().includes(q)
      );
    }

    // DP1: Feed Order
    if (policy.feedOrder === 'risk') {
      list.sort((a, b) => {
        if (a.isHighRisk !== b.isHighRisk) return a.isHighRisk ? -1 : 1;
        if (b.flags.length !== a.flags.length) return b.flags.length - a.flags.length;
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });
    } else if (policy.feedOrder === 'recency') {
      list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
    } else if (policy.feedOrder === 'status') {
      const priorityMap: Record<ClaimStatus, number> = {
        'Unverified': 1,
        'False': 2,
        'Misleading': 3,
        'Verified True': 4,
      };
      list.sort((a, b) => priorityMap[a.status] - priorityMap[b.status]);
    }

    return list;
  }, [claims, policy, selectedCategory, selectedStatus, searchQuery]);

  return (
    <div className="min-h-screen bg-neutral-100/60 flex flex-col font-sans text-neutral-900 selection:bg-neutral-900 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center gap-2 border border-neutral-700 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Navbar
        isNewsroomMode={isNewsroomMode}
        onToggleNewsroomMode={() => {
          setIsNewsroomMode(prev => !prev);
          showToast(
            !isNewsroomMode
              ? 'Newsroom Desk Mode activated (Fact-checker triage enabled)'
              : 'Citizen View activated'
          );
        }}
        onOpenSubmit={() => setIsSubmitOpen(true)}
        onOpenDecisionPoints={() => setIsDPOpen(true)}
        onOpenGitHubModal={() => setIsGitHubOpen(true)}
        onResetData={handleResetData}
      />

      {/* High-speed Stats Metrics Bar */}
      <StatsBar
        stats={stats || computeLocalStats(claims)}
        activeStatusFilter={selectedStatus}
        onSelectStatusFilter={st => setSelectedStatus(st)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-5">
        {/* Editorial Sub-banner: Explaining Neutral Design & Indian Civic Context */}
        <div className="mb-4 bg-white rounded-xl border border-neutral-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-neutral-900">
                Civic Misinformation Triage Platform
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700 border border-neutral-200">
                Neutral By Design
              </span>
            </div>
            <p className="text-xs text-neutral-600 mt-0.5">
              Rapidly triaging viral claims circulating on WhatsApp, X, and Instagram in India. Checks factual information, not ideologies.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 text-xs">
            <button
              id="btn-open-dp-banner"
              onClick={() => setIsDPOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 hover:border-neutral-400 bg-neutral-50 text-neutral-800 font-medium transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-neutral-600" />
              <span>Explore 3 Decision Points</span>
            </button>
            <button
              id="btn-reset-seed"
              onClick={handleResetData}
              className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
              title="Reset to initial Indian seed dataset"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* DP2 Active Quarantine Notice if enabled */}
        {policy.visibility === 'quarantine_unverified' && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                <strong>Quarantine Mode Active (DP2):</strong> Unverified claims are hidden from public view until newsroom review.
              </span>
            </div>
            <button
              onClick={() => handleUpdatePolicy({ visibility: 'all' })}
              className="underline font-semibold hover:text-black shrink-0 cursor-pointer"
            >
              Switch to Public Visibility
            </button>
          </div>
        )}

        {/* Filter & Search Bar (Feature 4) */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          feedOrder={policy.feedOrder}
          onFeedOrderChange={order => handleUpdatePolicy({ feedOrder: order })}
          totalFilteredCount={filteredClaims.length}
        />

        {/* Public Feed (Feature 4) */}
        <div id="public-feed-section" className="space-y-3">
          {filteredClaims.map(claim => (
            <ClaimCard
              key={claim.id}
              claim={claim}
              isNewsroomMode={isNewsroomMode}
              onOpenDetail={c => setSelectedClaimDetail(c)}
              onOpenReview={c => setSelectedClaimReview(c)}
              onOpenEdit={c => setSelectedClaimEdit(c)}
            />
          ))}

          {/* Empty state if search or filters match nothing */}
          {filteredClaims.length === 0 && (
            <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center space-y-3 my-6">
              <SearchX className="w-10 h-10 text-neutral-400 mx-auto" />
              <h3 className="text-sm font-bold text-neutral-900">No claims match your current filters</h3>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Try searching for a different keyword, clearing your filters, or submit a new viral claim to the triage desk.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedStatus('All');
                    if (policy.visibility === 'quarantine_unverified') {
                      handleUpdatePolicy({ visibility: 'all' });
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors cursor-pointer border border-neutral-300"
                >
                  Reset All Filters
                </button>
                <button
                  onClick={() => setIsSubmitOpen(true)}
                  className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-neutral-900 text-white hover:bg-black transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Submit Claim</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 mt-12 text-neutral-500 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-neutral-900">Truth Lens India</span>
            <span>·</span>
            <span>Civic Tech Misinformation Triage Engine</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setIsDPOpen(true)}
              className="hover:text-neutral-900 underline cursor-pointer"
            >
              Decision Points (DP1, DP2, DP3)
            </button>
            <button
              onClick={() => setIsGitHubOpen(true)}
              className="hover:text-neutral-900 underline cursor-pointer"
            >
              GitHub Deployment
            </button>
            <span>High-Speed Minimalist Architecture</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Submit Claim Modal (Feature 1 & Feature 2) */}
      <SubmitClaimModal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        onSubmitClaim={handleSubmitClaim}
      />

      {/* 2. Detail View Modal (Feature 5) */}
      <ClaimDetailModal
        claim={selectedClaimDetail}
        isOpen={Boolean(selectedClaimDetail)}
        onClose={() => setSelectedClaimDetail(null)}
        onOpenReview={c => setSelectedClaimReview(c)}
        onOpenEdit={c => setSelectedClaimEdit(c)}
        isNewsroomMode={isNewsroomMode}
      />

      {/* 3. Review Workflow Modal (Feature 3) */}
      <ReviewModal
        claim={selectedClaimReview}
        isOpen={Boolean(selectedClaimReview)}
        onClose={() => setSelectedClaimReview(null)}
        onSubmitReview={handleReviewClaim}
      />

      {/* 4. Decision Points Interactive Modal (DP1, DP2, DP3) */}
      <DecisionPointsModal
        isOpen={isDPOpen}
        onClose={() => setIsDPOpen(false)}
        policy={policy}
        onUpdatePolicy={handleUpdatePolicy}
      />

      {/* 5. Edit Claim Modal (DP3) */}
      <EditClaimModal
        claim={selectedClaimEdit}
        isOpen={Boolean(selectedClaimEdit)}
        onClose={() => setSelectedClaimEdit(null)}
        onSaveEdit={handleEditClaim}
        allowEditing={policy.allowEditing}
      />

      {/* 6. GitHub Deploy & Architecture Modal */}
      <GitHubDeployModal
        isOpen={isGitHubOpen}
        onClose={() => setIsGitHubOpen(false)}
      />
    </div>
  );
}

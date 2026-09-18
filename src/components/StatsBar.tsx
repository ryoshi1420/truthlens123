import React from 'react';
import { TriageStats } from '../types';
import { AlertTriangle, Clock, CheckCircle2, XCircle, BarChart2 } from 'lucide-react';

interface StatsBarProps {
  stats: TriageStats | null;
  activeStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats,
  activeStatusFilter,
  onSelectStatusFilter,
}) => {
  if (!stats) {
    return (
      <div className="w-full bg-white border-b border-neutral-200 py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between animate-pulse">
          <div className="h-4 bg-neutral-200 rounded w-28"></div>
          <div className="h-4 bg-neutral-200 rounded w-48 hidden sm:block"></div>
        </div>
      </div>
    );
  }

  const items = [
    {
      id: 'stat-all',
      label: 'Total Tracked',
      count: stats.totalClaims,
      filterKey: 'All',
      icon: BarChart2,
      color: 'text-neutral-700',
      activeBorder: 'border-neutral-900 bg-neutral-100',
    },
    {
      id: 'stat-unverified',
      label: 'Needs Triage',
      count: stats.unverifiedCount,
      filterKey: 'Unverified',
      icon: Clock,
      color: 'text-amber-600',
      activeBorder: 'border-amber-500 bg-amber-50',
    },
    {
      id: 'stat-high-risk',
      label: 'High Risk (2+ Flags)',
      count: stats.highRiskCount,
      filterKey: 'High Risk',
      icon: AlertTriangle,
      color: 'text-rose-600',
      activeBorder: 'border-rose-500 bg-rose-50',
      highlightBadge: true,
    },
    {
      id: 'stat-false',
      label: 'Debunked (False)',
      count: stats.debunkedFalseCount,
      filterKey: 'False',
      icon: XCircle,
      color: 'text-rose-700',
      activeBorder: 'border-rose-600 bg-rose-50',
    },
    {
      id: 'stat-verified',
      label: 'Verified True',
      count: stats.verifiedTrueCount,
      filterKey: 'Verified True',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      activeBorder: 'border-emerald-500 bg-emerald-50',
    },
  ];

  return (
    <div className="w-full bg-white border-b border-neutral-200 py-2.5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 shrink-0 mr-1 hidden sm:inline">
            Triage Metrics:
          </span>
          {items.map(item => {
            const Icon = item.icon;
            const isSelected = activeStatusFilter === item.filterKey;
            return (
              <button
                key={item.id}
                id={item.id}
                onClick={() => onSelectStatusFilter(item.filterKey)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? `${item.activeBorder} font-semibold text-neutral-900 shadow-2xs`
                    : 'border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="text-neutral-600">{item.label}</span>
                <span
                  className={`font-mono text-xs px-1.5 py-0.2 rounded font-bold ${
                    item.highlightBadge
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-neutral-100 text-neutral-800'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

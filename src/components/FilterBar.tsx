import React from 'react';
import { ClaimCategory, FeedSortOption } from '../types';
import { Search, X, ArrowUpDown, ShieldAlert, Sparkles } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  feedOrder: FeedSortOption;
  onFeedOrderChange: (order: FeedSortOption) => void;
  totalFilteredCount: number;
}

const CATEGORIES: { label: string; value: string }[] = [
  { label: 'All Categories', value: 'All' },
  { label: 'Politics', value: 'Politics' },
  { label: 'Health', value: 'Health' },
  { label: 'Finance & UPI', value: 'Finance' },
  { label: 'Other', value: 'Other' },
];

const STATUSES: { label: string; value: string }[] = [
  { label: 'All Status', value: 'All' },
  { label: 'Needs Triage', value: 'Unverified' },
  { label: 'High Risk ⚠️', value: 'High Risk' },
  { label: 'Debunked (False)', value: 'False' },
  { label: 'Misleading', value: 'Misleading' },
  { label: 'Verified True', value: 'Verified True' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedStatus,
  onStatusChange,
  feedOrder,
  onFeedOrderChange,
  totalFilteredCount,
}) => {
  return (
    <div className="w-full bg-white rounded-xl border border-neutral-200 p-4 shadow-2xs mb-4">
      {/* Top row: Search input & Sort selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            id="input-search-claims"
            type="text"
            placeholder="Search viral claims, keywords, WhatsApp forwards, or fact-checks..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:bg-white transition-all text-neutral-900 placeholder:text-neutral-400"
          />
          {searchQuery && (
            <button
              id="btn-clear-search"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort by selector (DP1 implementation) */}
        <div className="flex items-center gap-2 shrink-0">
          <label htmlFor="select-sort-order" className="text-xs text-neutral-500 font-medium flex items-center gap-1 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Order (DP1):</span>
          </label>
          <select
            id="select-sort-order"
            value={feedOrder}
            onChange={e => onFeedOrderChange(e.target.value as FeedSortOption)}
            className="text-xs font-medium bg-neutral-50 border border-neutral-300 rounded-lg px-2.5 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer"
          >
            <option value="risk">High Risk First (Priority)</option>
            <option value="recency">Newest First (Chronological)</option>
            <option value="status">Status Priority (Unverified First)</option>
          </select>
        </div>
      </div>

      {/* Bottom row: Category & Status Filter Pills */}
      <div className="mt-3 pt-3 border-t border-neutral-100 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase mr-1 shrink-0">
            Category:
          </span>
          {CATEGORIES.map(cat => {
            const active = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                id={`filter-cat-${cat.value.toLowerCase()}`}
                onClick={() => onCategoryChange(cat.value)}
                className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors cursor-pointer border ${
                  active
                    ? 'bg-neutral-900 text-white border-neutral-900 font-medium shadow-2xs'
                    : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[11px] font-semibold text-neutral-400 uppercase mr-1 shrink-0">
            Status:
          </span>
          {STATUSES.map(st => {
            const active = selectedStatus === st.value;
            return (
              <button
                key={st.value}
                id={`filter-status-${st.value.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                onClick={() => onStatusChange(st.value)}
                className={`px-2.5 py-1 rounded-md text-xs whitespace-nowrap transition-colors cursor-pointer border ${
                  active
                    ? 'bg-neutral-800 text-white border-neutral-800 font-medium'
                    : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {st.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Result counter & active filter indicators */}
      <div className="mt-2 text-[11px] text-neutral-500 flex items-center justify-between">
        <span>
          Showing <strong className="font-mono text-neutral-800">{totalFilteredCount}</strong> matching claims
        </span>
        {(searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All') && (
          <button
            id="btn-reset-filters"
            onClick={() => {
              onSearchChange('');
              onCategoryChange('All');
              onStatusChange('All');
            }}
            className="text-neutral-700 hover:text-black underline font-medium cursor-pointer"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
};

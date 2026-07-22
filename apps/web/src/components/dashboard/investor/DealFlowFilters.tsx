'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface DealFlowFilterState {
  stage: string | null;
  sector: string | null;
  region: string | null;
  sort: 'match_score' | 'newest' | 'raising_asc' | 'raising_desc';
}

interface SelectChipProps {
  label: string;
  value: string | null;
  options: { value: string; label: string }[];
  onChange: (value: string | null) => void;
  placeholder: string;
  ariaLabel: string;
}

function SelectChip({ label: _label, value, options, onChange, placeholder, ariaLabel }: SelectChipProps) {
  return (
    <select
      aria-label={ariaLabel}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || null)}
      className={cn(
        'text-xs font-medium px-3 py-1.5 rounded-full border bg-white cursor-pointer transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary-500',
        value
          ? 'border-warning-400 text-warning-700 bg-warning-50'
          : 'border-neutral-200 text-neutral-600 hover:border-neutral-300',
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

const STAGE_OPTIONS = [
  { value: 'pre_seed', label: 'Pre-seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series_a', label: 'Series A' },
  { value: 'series_b_plus', label: 'Series B+' },
];

const SECTOR_OPTIONS = [
  { value: 'fintech', label: 'Fintech' },
  { value: 'healthtech', label: 'HealthTech' },
  { value: 'edtech', label: 'EdTech' },
  { value: 'saas', label: 'SaaS' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'deeptech', label: 'DeepTech' },
  { value: 'cleantech', label: 'CleanTech' },
  { value: 'other', label: 'Other' },
];

const REGION_OPTIONS = [
  { value: 'london', label: 'London' },
  { value: 'manchester', label: 'Manchester' },
  { value: 'edinburgh', label: 'Edinburgh' },
  { value: 'birmingham', label: 'Birmingham' },
  { value: 'remote', label: 'Remote / Distributed' },
  { value: 'india', label: 'India' },
  { value: 'north_america', label: 'North America' },
];

const SORT_OPTIONS = [
  { value: 'match_score', label: 'Best Match' },
  { value: 'newest', label: 'Newest' },
  { value: 'raising_asc', label: 'Raising: Low → High' },
  { value: 'raising_desc', label: 'Raising: High → Low' },
];

interface DealFlowFiltersProps {
  onFilterChange: (filters: DealFlowFilterState) => void;
}

export function DealFlowFilters({ onFilterChange }: DealFlowFiltersProps) {
  const [filters, setFilters] = useState<DealFlowFilterState>({
    stage: null,
    sector: null,
    region: null,
    sort: 'match_score',
  });

  function update(partial: Partial<DealFlowFilterState>) {
    const next = { ...filters, ...partial };
    setFilters(next);
    onFilterChange(next);
  }

  const activeCount = [filters.stage, filters.sector, filters.region].filter(Boolean).length;

  return (
    <div className="flex flex-wrap gap-2 mb-5" role="group" aria-label="Deal flow filters">
      <SelectChip
        label="Stage"
        placeholder="All Stages"
        value={filters.stage}
        options={STAGE_OPTIONS}
        onChange={(v) => update({ stage: v })}
        ariaLabel="Filter by funding stage"
      />
      <SelectChip
        label="Sector"
        placeholder="All Sectors"
        value={filters.sector}
        options={SECTOR_OPTIONS}
        onChange={(v) => update({ sector: v })}
        ariaLabel="Filter by sector"
      />
      <SelectChip
        label="Region"
        placeholder="All Regions"
        value={filters.region}
        options={REGION_OPTIONS}
        onChange={(v) => update({ region: v })}
        ariaLabel="Filter by region"
      />
      <SelectChip
        label="Sort"
        placeholder="Best Match"
        value={filters.sort}
        options={SORT_OPTIONS}
        onChange={(v) => update({ sort: (v as DealFlowFilterState['sort']) ?? 'match_score' })}
        ariaLabel="Sort deal flow"
      />
      {activeCount > 0 && (
        <button
          className="text-xs text-neutral-500 hover:text-neutral-700 underline px-2"
          onClick={() => update({ stage: null, sector: null, region: null })}
        >
          Clear {activeCount} filter{activeCount > 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
}

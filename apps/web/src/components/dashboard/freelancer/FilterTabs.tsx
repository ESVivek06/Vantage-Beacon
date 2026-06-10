'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface FilterTab {
  id: string;
  label: string;
  count?: number;
}

export interface FilterTabsProps {
  tabs: FilterTab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
}

export function FilterTabs({ tabs, defaultTab, onChange }: FilterTabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? '');

  const select = (id: string) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div
      role="tablist"
      aria-label="Match filters"
      className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1 overflow-x-auto"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          id={`tab-${tab.id}`}
          aria-selected={active === tab.id}
          aria-controls={`tabpanel-${tab.id}`}
          onClick={() => select(tab.id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium',
            'transition-colors duration-fast whitespace-nowrap focus-visible:outline-none',
            'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-inset',
            active === tab.id
              ? 'bg-white text-neutral-900 shadow-sm'
              : 'text-neutral-500 hover:text-neutral-700',
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full text-xs font-semibold',
                active === tab.id
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-neutral-200 text-neutral-500',
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

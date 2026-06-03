'use client';

import { Check } from 'lucide-react';
import type { ComponentType } from 'react';

export interface RoleOption {
  id: string;
  icon: ComponentType<{ className?: string }>;
  label: string;
  description: string;
}

interface RoleCardProps {
  role: RoleOption;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function RoleCard({ role, selected, onSelect }: RoleCardProps) {
  const Icon = role.icon;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={`Select role: ${role.label} — ${role.description}`}
      onClick={() => onSelect(role.id)}
      className={[
        'relative flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all',
        'focus-visible:outline-none focus-visible:shadow-focus-ring',
        'h-[100px] mobile:h-24',
        selected
          ? 'border-primary-500 bg-primary-50 shadow-[0_0_0_3px_rgba(99,102,241,0.15)]'
          : 'border-neutral-200 bg-neutral-0 hover:border-neutral-300 hover:shadow-sm',
      ].join(' ')}
    >
      {selected && (
        <span className="absolute top-[-8px] right-[-8px] h-[18px] w-[18px] flex items-center justify-center rounded-full bg-primary-600 z-10">
          <Check className="h-2.5 w-2.5 text-white" aria-hidden="true" />
        </span>
      )}
      <Icon
        className={['h-8 w-8 transition-colors', selected ? 'text-primary-600' : 'text-neutral-400'].join(' ')}
      />
      <span className={['text-sm font-semibold text-center', selected ? 'text-primary-700' : 'text-neutral-700'].join(' ')}>
        {role.label}
      </span>
      <span className={['text-xs text-center hidden sm:block', selected ? 'text-primary-500' : 'text-neutral-400'].join(' ')}>
        {role.description}
      </span>
    </button>
  );
}

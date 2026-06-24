'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SidePanelActivity {
  date: string;
  text: string;
}

export interface SidePanelContent {
  title: string;
  subtitle?: string;
  meta?: Array<{ label: string; value: string }>;
  rationale?: string;
  activities?: SidePanelActivity[];
  actions?: Array<{ label: string; onClick: () => void }>;
}

interface AnalyticsSidePanelProps {
  open: boolean;
  onClose: () => void;
  content: SidePanelContent | null;
}

export function AnalyticsSidePanel({ open, onClose, content }: AnalyticsSidePanelProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          'fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl border-l border-neutral-200 z-50 overflow-y-auto transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label={content?.title ?? 'Detail panel'}
      >
        {content && (
          <div className="flex flex-col h-full">
            <div className="flex items-start justify-between p-5 border-b border-neutral-100">
              <div>
                <h2 className="text-base font-semibold text-neutral-900">{content.title}</h2>
                {content.subtitle && (
                  <p className="text-sm text-neutral-500 mt-0.5">{content.subtitle}</p>
                )}
              </div>
              <button
                onClick={onClose}
                className="h-8 w-8 flex items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors flex-shrink-0 ml-2"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 p-5 space-y-5">
              {content.meta && content.meta.length > 0 && (
                <dl className="grid grid-cols-2 gap-3">
                  {content.meta.map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-xs text-neutral-400 mb-0.5">{label}</dt>
                      <dd className="text-sm font-semibold text-neutral-900">{value}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {content.rationale && (
                <div className="bg-primary-50 border border-primary-100 rounded-lg p-3">
                  <p className="text-xs font-semibold text-primary-700 mb-1">AI Rationale</p>
                  <p className="text-sm text-neutral-700 leading-relaxed">{content.rationale}</p>
                </div>
              )}

              {content.activities && content.activities.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                    Activity
                  </h3>
                  <ul className="space-y-2">
                    {content.activities.map((act, i) => (
                      <li key={i} className="flex gap-2 text-sm text-neutral-600">
                        <span className="text-primary-400 flex-shrink-0">●</span>
                        <span>
                          <span className="text-neutral-400 mr-1">{act.date} —</span>
                          {act.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {content.actions && content.actions.length > 0 && (
              <div className="p-5 border-t border-neutral-100 flex gap-2 flex-wrap">
                {content.actions.map((action) => (
                  <button
                    key={action.label}
                    onClick={action.onClick}
                    className="px-3 py-1.5 text-sm font-medium bg-primary-50 text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

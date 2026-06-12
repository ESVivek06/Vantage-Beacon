'use client';

import { useState } from 'react';
import { ExternalLink, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { PortfolioItem } from '@/types/profile';

interface PortfolioGridProps {
  items: PortfolioItem[];
  isOwnProfile?: boolean;
  title?: string;
  onAdd?: () => void;
}

function PortfolioThumb({ item }: { item: PortfolioItem }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="group rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
      <div
        className="relative aspect-video bg-neutral-200 cursor-pointer overflow-hidden"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-200 to-neutral-300">
            <span className="text-neutral-400 text-xs font-medium">No preview</span>
          </div>
        )}
        {/* Hover overlay */}
        <div
          className={cn(
            'absolute inset-0 flex items-center justify-center bg-black/60 transition-opacity duration-200',
            hovered ? 'opacity-100' : 'opacity-0',
          )}
        >
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-100"
            >
              View
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <span className="text-white text-sm">View project</span>
          )}
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-semibold text-neutral-900 truncate">{item.title}</p>
        {(item.role || item.year) && (
          <p className="text-xs text-neutral-500 mt-0.5">
            {[item.role, item.year].filter(Boolean).join(' · ')}
          </p>
        )}
        {item.technologies && item.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {item.technologies.slice(0, 4).map((tech) => (
              <span key={tech} className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PortfolioGrid({ items, isOwnProfile, title = 'Portfolio', onAdd }: PortfolioGridProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, 3);

  return (
    <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>
        <div className="flex items-center gap-2">
          {items.length > 3 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="text-sm text-primary-600 hover:underline font-medium"
            >
              {showAll ? 'Show less' : `View all (${items.length})`}
            </button>
          )}
          {isOwnProfile && (
            <Button variant="ghost" size="sm" onClick={onAdd} className="gap-1">
              <Plus className="h-3.5 w-3.5" />
              Add
            </Button>
          )}
        </div>
      </div>

      {visible.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((item) => (
            <PortfolioThumb key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-neutral-500 text-sm">
          {isOwnProfile ? (
            <div>
              <p className="mb-3">No portfolio items yet.</p>
              <Button variant="outline" size="sm" onClick={onAdd}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add first item
              </Button>
            </div>
          ) : (
            'No portfolio items shared yet.'
          )}
        </div>
      )}
    </section>
  );
}

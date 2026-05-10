import React from 'react';
import { EmptyState } from '@/components/study-plan/EmptyState';
import type { RecommendedResource } from '@/lib/backend';

export function ResourcesPanel({
  classTitle,
  resources,
  onRefresh,
  loading,
}: {
  classTitle: string;
  resources: RecommendedResource[] | null;
  onRefresh: () => void;
  loading: boolean;
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold tracking-tight">Helpful Resources</h2>
          <p className="text-sm text-slate-300">Recommended for “{classTitle}”.</p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="rounded-xl border border-white/15 bg-white/[0.03] text-slate-100 px-3 py-1.5 text-xs font-semibold hover:bg-white/[0.06] disabled:opacity-60 transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {resources && resources.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {resources.map((res, idx) => (
            <a
              key={`${res.url}-${idx}`}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06] transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {res.title}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 truncate">
                    {res.url}
                  </p>
                  <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                    {res.explanation}
                  </p>
                </div>
                <div className="shrink-0 p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors">
                  <svg
                    className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No recommendations yet"
          body="Add notes or wait for your class topics to be processed to see helpful videos and resources."
        />
      )}
    </section>
  );
}

'use client';

const STEPS = [
  { n: 1, label: 'Class setup' },
  { n: 2, label: 'Syllabus' },
  { n: 3, label: 'Timeline' },
  { n: 4, label: 'Study plan' },
];

export function OnboardingStepper({ phase }: { phase: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={[
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border',
                s.n < phase
                  ? 'bg-white text-black border-white'
                  : s.n === phase
                    ? 'bg-white/10 text-white border-white/60'
                    : 'bg-transparent text-slate-500 border-white/20',
              ].join(' ')}
            >
              {s.n < phase ? '✓' : s.n}
            </div>
            <span className={['text-xs', s.n === phase ? 'text-white' : 'text-slate-500'].join(' ')}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 ? (
            <div className={['h-px w-12 mx-1 mb-5', s.n < phase ? 'bg-white/60' : 'bg-white/15'].join(' ')} />
          ) : null}
        </div>
      ))}
    </div>
  );
}

'use client';

const STEPS = [
  { n: 1, label: 'Class setup' },
  { n: 2, label: 'Syllabus' },
  { n: 3, label: 'Timeline' },
  { n: 4, label: 'Study plan' },
];

export function OnboardingStepper({ phase }: { phase: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-10">
      {STEPS.map((s, i) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-2">
            <div
              className={[
                'w-11 h-11 rounded-full flex items-center justify-center text-base font-semibold border-2',
                s.n < phase
                  ? 'bg-white text-black border-white'
                  : s.n === phase
                    ? 'bg-white/10 text-white border-white/60'
                    : 'bg-transparent text-slate-500 border-white/20',
              ].join(' ')}
            >
              {s.n < phase ? '✓' : s.n}
            </div>
            <span className={['text-sm font-medium', s.n === phase ? 'text-white' : 'text-slate-500'].join(' ')}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 ? (
            <div className={['h-px w-16 mx-2 mb-6', s.n < phase ? 'bg-white/60' : 'bg-white/15'].join(' ')} />
          ) : null}
        </div>
      ))}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendChatMessage } from '@/lib/backend';
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper';

type TermChoice = 'from_syllabus' | 'fall' | 'spring';
type Snapshot = { timezone?: string | null; start?: string | null; end?: string | null; term?: string | null };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function inferYear(start: string, end: string) {
  for (const d of [start, end]) {
    if (d && ISO_DATE.test(d)) return parseInt(d.slice(0, 4), 10);
  }
  return new Date().getFullYear();
}

export default function Phase3Client() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [termChoice, setTermChoice] = useState<TermChoice>('fall');
  const [timezone, setTimezone] = useState('America/New_York');
  const [semesterStart, setSemesterStart] = useState('');
  const [semesterEnd, setSemesterEnd] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sid = sessionStorage.getItem('gp_onboarding_session');
    if (!sid) { router.replace('/chat/phase/1'); return; }
    setSessionId(sid);

    const raw = sessionStorage.getItem('gp_syllabus_snapshot');
    const y = new Date().getFullYear();
    if (raw) {
      try {
        const snap: Snapshot = JSON.parse(raw);
        setSnapshot(snap);
        if (snap.timezone) setTimezone(snap.timezone);
        if (snap.start && snap.end) {
          setSemesterStart(snap.start);
          setSemesterEnd(snap.end);
          setTermChoice('from_syllabus');
        } else {
          const t = snap.term?.toLowerCase();
          if (t === 'spring') {
            setTermChoice('spring');
            setSemesterStart(`${y}-01-01`);
            setSemesterEnd(`${y}-06-30`);
          } else {
            setTermChoice('fall');
            setSemesterStart(`${y}-08-01`);
            setSemesterEnd(`${y}-12-20`);
          }
        }
      } catch { /* ignore */ }
    } else {
      setSemesterStart(`${y}-08-01`);
      setSemesterEnd(`${y}-12-20`);
    }
  }, [router]);

  function applyTerm(choice: TermChoice) {
    setTermChoice(choice);
    const y = inferYear(semesterStart, semesterEnd) || new Date().getFullYear();
    if (choice === 'from_syllabus' && snapshot?.start && snapshot.end) {
      if (snapshot.timezone) setTimezone(snapshot.timezone);
      setSemesterStart(snapshot.start);
      setSemesterEnd(snapshot.end);
    } else if (choice === 'fall') {
      setSemesterStart(`${y}-08-01`);
      setSemesterEnd(`${y}-12-20`);
    } else {
      setSemesterStart(`${y}-01-01`);
      setSemesterEnd(`${y}-06-30`);
    }
  }

  async function handleSave() {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    try {
      await sendChatMessage(sessionId, JSON.stringify({
        timezone: timezone.trim(),
        semester_start: semesterStart.trim(),
        semester_end: semesterEnd.trim(),
      }));
      router.push('/chat/phase/4');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save timeline');
      setLoading(false);
    }
  }

  const hasSyllabusDate = Boolean(snapshot?.start && snapshot?.end);

  return (
    <div className="min-h-screen w-full bg-[#0A0B10] text-[#F8FAFC] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <OnboardingStepper phase={3} />

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-white">Set your semester timeline</h1>
            <p className="text-slate-400">
              {hasSyllabusDate
                ? 'We inferred dates from your syllabus — confirm or adjust below.'
                : 'Choose a term or enter custom dates.'}
            </p>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="space-y-3 rounded-xl border border-white/10 bg-black/20 p-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Term</div>
            {[
              {
                value: 'from_syllabus' as TermChoice,
                label: 'Use dates from syllabus',
                disabled: !hasSyllabusDate,
                hint: hasSyllabusDate ? `${snapshot!.start} → ${snapshot!.end}` : 'not available',
              },
              { value: 'fall' as TermChoice, label: 'Fall', hint: 'Aug 1 → Dec 20', disabled: false },
              { value: 'spring' as TermChoice, label: 'Spring', hint: 'Jan 1 → Jun 30', disabled: false },
            ].map((opt) => (
              <label key={opt.value} className={['flex items-center gap-3 cursor-pointer', opt.disabled ? 'opacity-40' : ''].join(' ')}>
                <input
                  type="radio" name="term"
                  checked={termChoice === opt.value}
                  disabled={opt.disabled}
                  onChange={() => applyTerm(opt.value)}
                  className="accent-white"
                />
                <span className="text-sm text-slate-200">{opt.label}</span>
                <span className="text-xs text-slate-500">{opt.hint}</span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-3">
            <input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Timezone (e.g. America/New_York)"
              className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={semesterStart}
                onChange={(e) => setSemesterStart(e.target.value)}
                placeholder="Start (YYYY-MM-DD)"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
              <input
                value={semesterEnd}
                onChange={(e) => setSemesterEnd(e.target.value)}
                placeholder="End (YYYY-MM-DD)"
                className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20"
              />
            </div>
          </div>

          <button
            disabled={loading || !timezone.trim() || !semesterStart.trim() || !semesterEnd.trim()}
            onClick={() => void handleSave()}
            className="w-full rounded-xl bg-white text-black py-3 text-base font-semibold disabled:opacity-50 hover:bg-slate-100 transition-colors"
          >
            {loading ? 'Saving…' : 'Save & generate plan →'}
          </button>

          <div className="flex justify-start">
            <button onClick={() => router.back()} className="text-sm text-slate-400 hover:text-white transition-colors">
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sendChatMessage } from '@/lib/backend';
import { StudyPlanShell } from '@/components/study-plan/StudyPlanShell';
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
          const y = inferYear(snap.start ?? '', snap.end ?? '');
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
      const y = new Date().getFullYear();
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
    } else if (choice === 'spring') {
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
    <StudyPlanShell title="New Class Setup" subtitle="Step through setup to get your personalised study plan.">
      <OnboardingStepper phase={3} />

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 mb-4">
          {error}
        </div>
      ) : null}

      <div className="max-w-lg space-y-5">
        <div>
          <h2 className="text-base font-semibold text-white">Set your semester timeline</h2>
          <p className="text-sm text-slate-400 mt-1">
            {hasSyllabusDate
              ? 'We inferred dates from your syllabus — confirm or adjust below.'
              : 'Choose a term or enter custom dates.'}
          </p>
        </div>

        <div className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">Term</div>
          <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
            <input
              type="radio" name="term"
              checked={termChoice === 'from_syllabus'}
              disabled={!hasSyllabusDate}
              onChange={() => applyTerm('from_syllabus')}
            />
            Use dates from syllabus
            {hasSyllabusDate
              ? <span className="text-xs text-slate-500">({snapshot!.start} → {snapshot!.end})</span>
              : <span className="text-xs text-slate-500">(not available)</span>}
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
            <input type="radio" name="term" checked={termChoice === 'fall'} onChange={() => applyTerm('fall')} />
            Fall — default Aug 1 → Dec 20
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-200 cursor-pointer">
            <input type="radio" name="term" checked={termChoice === 'spring'} onChange={() => applyTerm('spring')} />
            Spring — default Jan 1 → Jun 30
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            placeholder="Timezone (e.g. America/New_York)"
            className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          <input
            value={semesterStart}
            onChange={(e) => setSemesterStart(e.target.value)}
            placeholder="Start (YYYY-MM-DD)"
            className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
          />
          <input
            value={semesterEnd}
            onChange={(e) => setSemesterEnd(e.target.value)}
            placeholder="End (YYYY-MM-DD)"
            className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
          />
        </div>

        <div className="flex justify-between items-center">
          <button onClick={() => router.back()} className="text-sm text-slate-400 hover:text-white">
            ← Back
          </button>
          <button
            disabled={loading || !timezone.trim() || !semesterStart.trim() || !semesterEnd.trim()}
            onClick={() => void handleSave()}
            className="rounded-xl bg-white text-black px-6 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Save & generate plan →'}
          </button>
        </div>
      </div>
    </StudyPlanShell>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getChatSession,
  uploadOnboardingSyllabus,
  type SyllabusOnboardingOut,
} from '@/lib/backend';
import { StudyPlanShell } from '@/components/study-plan/StudyPlanShell';
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper';

export default function Phase2Client() {
  const router = useRouter();
  const [classId, setClassId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sid = sessionStorage.getItem('gp_onboarding_session');
    if (!sid) { router.replace('/chat/phase/1'); return; }
    setSessionId(sid);
    getChatSession(sid).then((reply) => {
      const cid =
        (typeof reply.class_id === 'string' && reply.class_id) ||
        (typeof reply.state?.class_id === 'string' && reply.state.class_id) ||
        null;
      if (!cid) { router.replace('/chat/phase/1'); return; }
      setClassId(cid);
    }).catch(() => router.replace('/chat/phase/1'));
  }, [router]);

  function storeSnapshot(out: SyllabusOnboardingOut) {
    sessionStorage.setItem('gp_syllabus_snapshot', JSON.stringify({
      timezone: out.suggested_timezone,
      start: out.suggested_semester_start,
      end: out.suggested_semester_end,
      term: out.suggested_semester_term,
    }));
  }

  async function handleSkip() {
    router.push('/chat/phase/3');
  }

  return (
    <StudyPlanShell title="New Class Setup" subtitle="Step through setup to get your personalised study plan.">
      <OnboardingStepper phase={2} />

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 mb-4">
          {error}
        </div>
      ) : null}

      <div className="max-w-lg space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">Upload your syllabus</h2>
          <p className="text-sm text-slate-400 mt-1">
            We'll extract deadlines, infer semester dates, and index it for Q&A.
            This takes about a minute — stay on this page until it finishes.
          </p>
        </div>

        {busy ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
            {busy}
          </div>
        ) : null}

        <label className={[
          'block rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-slate-300 hover:text-white cursor-pointer text-center',
          (!classId || !sessionId || busy !== null) ? 'opacity-50 pointer-events-none' : '',
        ].join(' ')}>
          <input
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            disabled={!classId || !sessionId || busy !== null}
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (!f || !classId || !sessionId) return;
              setError(null);
              setBusy('Processing syllabus: extracting text, running AI, building search index…');
              try {
                const out = await uploadOnboardingSyllabus(classId, f, sessionId);
                storeSnapshot(out);
                router.push('/chat/phase/3');
              } catch (err: unknown) {
                setError(err instanceof Error ? err.message : 'Syllabus processing failed');
                setBusy(null);
              }
            }}
          />
          {busy ? 'Processing…' : '📄 Upload syllabus PDF'}
        </label>

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={() => router.back()}
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back
          </button>
          <button
            disabled={busy !== null}
            onClick={handleSkip}
            className="text-sm text-slate-400 hover:text-white disabled:opacity-50"
          >
            Skip for now →
          </button>
        </div>
      </div>
    </StudyPlanShell>
  );
}

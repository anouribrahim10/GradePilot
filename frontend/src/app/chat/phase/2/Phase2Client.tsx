'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getChatSession, uploadOnboardingSyllabus, type SyllabusOnboardingOut } from '@/lib/backend';
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

  return (
    <div className="min-h-screen w-full bg-[#0A0B10] text-[#F8FAFC] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <OnboardingStepper phase={2} />

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-white">Upload your syllabus</h1>
            <p className="text-slate-400">
              We'll extract deadlines, infer semester dates, and index it for Q&A.
              This takes about a minute — stay on this page until it finishes.
            </p>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          {busy ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100 flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border-2 border-amber-300/40 border-t-amber-300 animate-spin shrink-0" />
              {busy}
            </div>
          ) : null}

          <label className={[
            'flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-white/20 bg-black/20 px-6 py-10 text-center cursor-pointer hover:border-white/40 hover:bg-black/30 transition-colors',
            (!classId || !sessionId || busy !== null) ? 'opacity-50 pointer-events-none' : '',
          ].join(' ')}>
            <span className="text-4xl">📄</span>
            <span className="text-base font-medium text-white">
              {busy ? 'Processing…' : 'Click to upload syllabus PDF'}
            </span>
            <span className="text-sm text-slate-400">PDF files only</span>
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
          </label>

          <div className="flex justify-between items-center pt-2">
            <button onClick={() => router.back()} className="text-sm text-slate-400 hover:text-white transition-colors">
              ← Back
            </button>
            <button
              disabled={busy !== null}
              onClick={() => router.push('/chat/phase/3')}
              className="text-sm text-slate-400 hover:text-white disabled:opacity-50 transition-colors"
            >
              Skip for now →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

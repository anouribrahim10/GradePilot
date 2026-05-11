'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getChatSession } from '@/lib/backend';
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper';

export default function Phase4Client() {
  const router = useRouter();
  const [status, setStatus] = useState('Generating your study plan…');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sid = sessionStorage.getItem('gp_onboarding_session');
    if (!sid) { router.replace('/chat/phase/1'); return; }

    let cancelled = false;

    async function poll() {
      try {
        const reply = await getChatSession(sid!);
        if (cancelled) return;

        const classId =
          (typeof reply.class_id === 'string' && reply.class_id) ||
          (typeof reply.state?.class_id === 'string' && reply.state.class_id) ||
          null;

        if (reply.complete && classId) {
          sessionStorage.removeItem('gp_onboarding_session');
          sessionStorage.removeItem('gp_syllabus_snapshot');
          router.push(`/classes/${classId}`);
          return;
        }

        const phase = typeof reply.state?.phase === 'number' ? reply.state.phase : Number(reply.state?.phase) || 0;
        if (phase >= 4 && classId) {
          setStatus('Plan ready! Redirecting to your class…');
          setTimeout(() => {
            if (!cancelled) {
              sessionStorage.removeItem('gp_onboarding_session');
              sessionStorage.removeItem('gp_syllabus_snapshot');
              router.push(`/classes/${classId}`);
            }
          }, 1500);
          return;
        }

        setTimeout(() => { if (!cancelled) void poll(); }, 2500);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    }

    void poll();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className="min-h-screen w-full bg-[#0A0B10] text-[#F8FAFC] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <OnboardingStepper phase={4} />

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white">Almost there!</h1>
            <p className="text-slate-400">{status}</p>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-black/20 px-6 py-5">
            <div className="w-6 h-6 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            <span className="text-slate-300">Working on it…</span>
          </div>
        </div>
      </div>
    </div>
  );
}

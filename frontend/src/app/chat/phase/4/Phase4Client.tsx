'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getChatSession } from '@/lib/backend';
import { StudyPlanShell } from '@/components/study-plan/StudyPlanShell';
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

        // If plan is ready but complete flag not set yet, check phase
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

        // Poll again
        setTimeout(() => { if (!cancelled) poll(); }, 2500);
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Something went wrong');
      }
    }

    void poll();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <StudyPlanShell title="New Class Setup" subtitle="Step through setup to get your personalised study plan.">
      <OnboardingStepper phase={4} />

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 mb-4">
          {error}
        </div>
      ) : null}

      <div className="max-w-lg space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">Almost there!</h2>
          <p className="text-sm text-slate-400 mt-1">{status}</p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
          <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          <span className="text-sm text-slate-300">Working on it…</span>
        </div>
      </div>
    </StudyPlanShell>
  );
}

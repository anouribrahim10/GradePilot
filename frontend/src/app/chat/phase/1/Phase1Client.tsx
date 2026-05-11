'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrGetChatSession, sendChatMessage } from '@/lib/backend';
import { StudyPlanShell } from '@/components/study-plan/StudyPlanShell';
import { OnboardingStepper } from '@/components/onboarding/OnboardingStepper';

export default function Phase1Client() {
  const router = useRouter();
  const [classTitle, setClassTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!classTitle.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const sess = await createOrGetChatSession({ forceNew: true });
      await sendChatMessage(sess.id, JSON.stringify({ class_title: classTitle.trim() }));
      sessionStorage.setItem('gp_onboarding_session', sess.id);
      router.push('/chat/phase/2');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create class');
      setLoading(false);
    }
  }

  return (
    <StudyPlanShell title="New Class Setup" subtitle="Step through setup to get your personalised study plan.">
      <OnboardingStepper phase={1} />

      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 mb-4">
          {error}
        </div>
      ) : null}

      <div className="max-w-lg space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white">What class are you setting up?</h2>
          <p className="text-sm text-slate-400 mt-1">Enter the course name or code.</p>
        </div>
        <input
          value={classTitle}
          onChange={(e) => setClassTitle(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void handleCreate(); }}
          placeholder='e.g. "CS 301 — Algorithms"'
          className="w-full bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
          autoFocus
        />
        <div className="flex justify-end">
          <button
            disabled={loading || classTitle.trim().length === 0}
            onClick={() => void handleCreate()}
            className="rounded-xl bg-white text-black px-6 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Continue →'}
          </button>
        </div>
      </div>
    </StudyPlanShell>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createOrGetChatSession, sendChatMessage } from '@/lib/backend';
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
    <div className="min-h-screen w-full bg-[#0A0B10] text-[#F8FAFC] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-xl">
        <OnboardingStepper phase={1} />

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold text-white">What class are you setting up?</h1>
            <p className="text-slate-400">Enter the course name or code to get started.</p>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <input
            value={classTitle}
            onChange={(e) => setClassTitle(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void handleCreate(); }}
            placeholder='e.g. "CS 301 — Algorithms"'
            className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-white/20"
            autoFocus
          />

          <button
            disabled={loading || classTitle.trim().length === 0}
            onClick={() => void handleCreate()}
            className="w-full rounded-xl bg-white text-black py-3 text-base font-semibold disabled:opacity-50 hover:bg-slate-100 transition-colors"
          >
            {loading ? 'Creating…' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  );
}

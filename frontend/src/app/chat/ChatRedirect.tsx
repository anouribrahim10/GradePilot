'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createOrGetChatSession, getChatSession } from '@/lib/backend';

export default function ChatRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const forceNew = searchParams?.get('new') === '1' || searchParams?.get('new') === 'true';

    async function redirect() {
      try {
        if (forceNew) {
          sessionStorage.removeItem('gp_onboarding_session');
          sessionStorage.removeItem('gp_syllabus_snapshot');
          router.replace('/chat/phase/1');
          return;
        }

        // Try to resume an existing in-progress session
        const sid = sessionStorage.getItem('gp_onboarding_session');
        if (sid) {
          const reply = await getChatSession(sid);
          const phase = typeof reply.state?.phase === 'number'
            ? reply.state.phase
            : Number(reply.state?.phase) || 1;
          const clamped = Math.min(Math.max(phase, 1), 4);
          router.replace(`/chat/phase/${clamped}`);
          return;
        }

        // No session — check if there's an active one on the server
        const sess = await createOrGetChatSession({ forceNew: false });
        const reply = await getChatSession(sess.id);
        const phase = typeof reply.state?.phase === 'number'
          ? reply.state.phase
          : Number(reply.state?.phase) || 1;

        if (phase > 1) {
          sessionStorage.setItem('gp_onboarding_session', sess.id);
          router.replace(`/chat/phase/${Math.min(phase, 4)}`);
        } else {
          router.replace('/chat/phase/1');
        }
      } catch {
        router.replace('/chat/phase/1');
      }
    }

    void redirect();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-400 text-sm">
      Loading…
    </div>
  );
}

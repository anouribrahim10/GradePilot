'use client';

import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export function OnboardingShell({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  return (
    <div className="min-h-screen w-full bg-[#0A0B10] text-[#F8FAFC] flex flex-col">
      <div className="sticky top-0 z-50 border-b border-white/10 bg-[#0A0B10]/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" className="text-sm font-medium tracking-tight text-white hover:text-slate-200 transition-colors shrink-0">
            GradePilot
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/classes" className="text-sm text-slate-300 hover:text-white transition-colors">
              Classes
            </Link>
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
              className="text-sm text-slate-300 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        {children}
      </div>
    </div>
  );
}

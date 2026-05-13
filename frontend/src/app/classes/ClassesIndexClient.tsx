'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  BackendError,
  getUserSettings,
  listClasses,
  startGoogleCalendarOAuth,
  updateUserSettings,
  type ClassOut,
} from '@/lib/backend';
import { StudyPlanShell } from '@/components/study-plan/StudyPlanShell';
import { createClient } from '@/lib/supabase/client';
import {
  HHMM_RE,
  MAX_STUDY_WINDOWS,
  StudyWindow,
  isValidStudyWindow,
} from '@/lib/settingsTypes';

export default function ClassesIndexClient() {
  const supabase = createClient();
  const [classes, setClasses] = useState<ClassOut[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [googleConnected, setGoogleConnected] = useState<boolean | null>(null);
  const [googleConnectBusy, setGoogleConnectBusy] = useState(false);

  const [autoSchedule, setAutoSchedule] = useState<boolean>(false);
  const [windows, setWindows] = useState<StudyWindow[]>([]);
  const [savingSchedulingPrefs, setSavingSchedulingPrefs] = useState(false);
  const [schedulingHint, setSchedulingHint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const [res, settings] = await Promise.all([listClasses(), getUserSettings()]);
        if (cancelled) return;
        setClasses(res);
        setGoogleConnected(settings.googleConnected);
        setAutoSchedule(Boolean(settings.autoScheduleSessions));
        setWindows(settings.preferredStudyWindows ?? []);
      } catch (e: unknown) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load classes');
        setClasses([]);
        setGoogleConnected(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  async function persistSchedulingPrefs(next: {
    autoScheduleSessions?: boolean;
    preferredStudyWindows?: StudyWindow[];
  }): Promise<void> {
    setSavingSchedulingPrefs(true);
    setSchedulingHint(null);
    setError(null);
    try {
      const updated = await updateUserSettings(next);
      setAutoSchedule(Boolean(updated.autoScheduleSessions));
      setWindows(updated.preferredStudyWindows ?? []);
      setSchedulingHint('Saved.');
    } catch (e: unknown) {
      setError(
        e instanceof BackendError ? e.message : e instanceof Error ? e.message : 'Failed to save scheduling preferences'
      );
    } finally {
      setSavingSchedulingPrefs(false);
    }
  }

  return (
    <StudyPlanShell
      title="Classes"
      subtitle="Manage your classes and configure your study preferences."
      actions={
        <div className="flex items-center gap-4">
          <Link href="/chat/phase/1" className="rounded-xl bg-white text-black px-4 py-1.5 text-sm font-semibold hover:bg-slate-100 transition-colors">
            + Add Class
          </Link>
          <button
            onClick={async () => { await supabase.auth.signOut(); window.location.href = '/'; }}
            className="text-sm text-slate-300 hover:text-white transition-colors"
          >
            Sign out
          </button>
        </div>
      }
    >
      {error ? (
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100 mb-6">
          {error}
        </div>
      ) : null}

      {/* ── Classes ── */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Your Classes</h2>
            <p className="text-sm text-slate-400 mt-0.5">Click a class to open its dashboard.</p>
          </div>
        </div>

        {classes === null ? (
          <div className="text-sm text-slate-400">Loading…</div>
        ) : classes.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center space-y-3">
            <div className="text-3xl">📚</div>
            <div className="text-base font-semibold text-white">No classes yet</div>
            <p className="text-sm text-slate-400">Add your first class to get started.</p>
            <Link
              href="/chat/phase/1"
              className="inline-block mt-2 rounded-xl bg-white text-black px-5 py-2 text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              + Add your first class
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((c) => (
              <Link
                key={c.id}
                href={`/classes/${c.id}`}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.06] hover:border-white/20 transition-colors group"
              >
                <div className="text-base font-semibold text-white group-hover:text-slate-100">{c.title}</div>
                <div className="mt-2 text-xs text-slate-500">
                  Added {new Date(c.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Integrations & Preferences ── */}
      <section>
        <h2 className="text-base font-semibold text-white mb-4">Integrations & Preferences</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Google Calendar */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg">📅</div>
              <div>
                <div className="text-sm font-semibold text-white">Google Calendar</div>
                <p className="text-xs text-slate-400">Sync deadlines to your Google account.</p>
              </div>
            </div>

            {googleConnected === null ? (
              <div className="text-xs text-slate-400">Checking connection…</div>
            ) : googleConnected ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span className="text-sm font-medium text-emerald-400">Connected</span>
              </div>
            ) : (
              <button
                type="button"
                disabled={googleConnectBusy}
                onClick={async () => {
                  setGoogleConnectBusy(true);
                  setError(null);
                  try {
                    const { authorization_url, state, code_verifier } = await startGoogleCalendarOAuth();
                    if (state && code_verifier) {
                      sessionStorage.setItem(`gp_google_oauth_verifier:${state}`, code_verifier);
                    }
                    window.location.assign(authorization_url);
                  } catch (e: unknown) {
                    setError(e instanceof BackendError ? e.message : e instanceof Error ? e.message : 'Could not start Google sign-in');
                    setGoogleConnectBusy(false);
                  }
                }}
                className="w-full rounded-xl bg-white text-black py-2 text-sm font-semibold disabled:opacity-60 hover:bg-slate-100 transition-colors"
              >
                {googleConnectBusy ? 'Redirecting…' : 'Connect Google Calendar'}
              </button>
            )}
          </div>

          {/* Smart Study Sessions */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-lg">🧠</div>
              <div>
                <div className="text-sm font-semibold text-white">Smart Study Sessions</div>
                <p className="text-xs text-slate-400">Auto-book 60-min slots before deadlines.</p>
              </div>
            </div>

            {googleConnected !== true ? (
              <p className="text-xs text-amber-200/80 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                Connect Google Calendar to enable this feature.
              </p>
            ) : (
              <label className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-black/20 px-4 py-3 cursor-pointer">
                <span className="text-sm text-slate-200">Auto-schedule on new notes</span>
                <input
                  type="checkbox"
                  checked={autoSchedule}
                  disabled={savingSchedulingPrefs}
                  onChange={(e) => persistSchedulingPrefs({ autoScheduleSessions: e.target.checked })}
                  className="accent-white w-4 h-4"
                />
              </label>
            )}

            {/* Study windows */}
            <div className="space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Preferred study windows
              </div>
              <p className="text-xs text-slate-500">
                Sessions will land inside these times (max {MAX_STUDY_WINDOWS}).
              </p>

              <div className="space-y-2">
                {windows.length === 0 ? (
                  <div className="text-xs text-slate-500">No windows set — first free slot will be used.</div>
                ) : (
                  windows.map((w, idx) => {
                    const valid = isValidStudyWindow(w);
                    return (
                      <div key={idx} className="flex flex-wrap items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                        <span className="text-xs text-slate-400">From</span>
                        <input
                          value={w.start}
                          onChange={(e) => { const next = windows.slice(); next[idx] = { ...w, start: e.target.value }; setWindows(next); }}
                          placeholder="07:00"
                          className="w-20 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm text-white"
                        />
                        <span className="text-xs text-slate-400">to</span>
                        <input
                          value={w.end}
                          onChange={(e) => { const next = windows.slice(); next[idx] = { ...w, end: e.target.value }; setWindows(next); }}
                          placeholder="10:00"
                          className="w-20 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm text-white"
                        />
                        {!valid && (HHMM_RE.test(w.start) || w.start === '') ? (
                          <span className="text-xs text-rose-300">Use HH:MM, start &lt; end</span>
                        ) : null}
                        <button
                          type="button"
                          className="ml-auto text-xs text-slate-400 hover:text-white"
                          onClick={() => setWindows(windows.filter((_, i) => i !== idx))}
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={savingSchedulingPrefs || windows.length >= MAX_STUDY_WINDOWS}
                  onClick={() => setWindows([...windows, { start: '19:00', end: '23:00' }])}
                  className="rounded-xl border border-white/20 bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                >
                  + Add window
                </button>
                <button
                  type="button"
                  disabled={savingSchedulingPrefs || !windows.every(isValidStudyWindow)}
                  onClick={() => persistSchedulingPrefs({ preferredStudyWindows: windows })}
                  className="rounded-xl bg-white text-black px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                >
                  {savingSchedulingPrefs ? 'Saving…' : 'Save windows'}
                </button>
                {schedulingHint ? <span className="text-xs text-emerald-400">{schedulingHint}</span> : null}
              </div>
            </div>
          </div>

        </div>
      </section>
    </StudyPlanShell>
  );
}

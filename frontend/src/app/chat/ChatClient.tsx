'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  createOrGetChatSession,
  getChatSession,
  importDeadlinesFromSyllabus,
  listClasses,
  sendChatMessage,
  uploadMaterialPdf,
  type ChatReplyOut,
  type ChatToolAction,
  type ClassOut,
} from '@/lib/backend';
import { createClient } from '@/lib/supabase/client';
import { StudyPlanShell } from '@/components/study-plan/StudyPlanShell';

type ToolCard = { title: string; detail?: string };

function toolActionToCard(a: ChatToolAction): ToolCard | null {
  if (a.type === 'create_classes') {
    const titles = (a.payload?.titles as unknown as string[]) ?? [];
    return { title: 'Created classes', detail: titles.join(', ') };
  }
  return { title: `Action: ${a.type}` };
}

export default function ChatClient() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatReplyOut | null>(null);
  const [draft, setDraft] = useState('');
  const [toolCards, setToolCards] = useState<ToolCard[]>([]);

  const [classes, setClasses] = useState<ClassOut[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId) ?? null,
    [classes, selectedClassId]
  );

  const phaseRaw = String(chat?.state?.phase ?? 'need_materials');
  // Legacy sessions may still have the old first-step phase name
  const phase = phaseRaw === 'need_semester' ? 'need_materials' : phaseRaw;
  const classTitles = (chat?.state?.class_titles as unknown as string[]) ?? [];

  const [uploadGateHint, setUploadGateHint] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const sess = await createOrGetChatSession();
        if (cancelled) return;
        setSessionId(sess.id);
        const reply = await getChatSession(sess.id);
        if (cancelled) return;
        setChat(reply);
        const cls = await listClasses();
        if (cancelled) return;
        setClasses(cls);
        setSelectedClassId(cls[0]?.id ?? '');
      } catch (e: unknown) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'Failed to load chat');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (classes.length > 0 && !selectedClassId) {
      setSelectedClassId(classes[0]!.id);
    }
  }, [classes, selectedClassId]);

  async function send() {
    if (!sessionId) return;
    const content = draft.trim();
    if (!content) return;
    setDraft('');
    setLoading(true);
    setError(null);
    try {
      const out = await sendChatMessage(sessionId, content);
      setChat(out);
      setUploadGateHint(null);
      const newCards = (out.tool_actions ?? [])
        .map(toolActionToCard)
        .filter((c): c is ToolCard => Boolean(c));
      setToolCards((prev) => [...newCards, ...prev].slice(0, 12));
      const nextPhase = String(out.state?.phase ?? '');
      if (
        newCards.length ||
        nextPhase === 'need_syllabi' ||
        nextPhase === 'need_classes'
      ) {
        const cls = await listClasses();
        setClasses(cls);
        setSelectedClassId((prev) => prev || cls[0]?.id || '');
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }

  return (
    <StudyPlanShell
      title="GradePilot Chat"
      subtitle="Share syllabi, notes, and readings first — then semester dates for your full plan."
      actions={
        <div className="flex items-center gap-4">
          <Link href="/study-plan" className="text-sm text-slate-300 hover:text-white transition-colors">
            Workspace
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
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <aside className="lg:col-span-4 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="text-sm font-semibold">Status</div>
            <div className="mt-2 text-sm text-slate-300">
              Phase: <span className="text-white">{phase}</span>
            </div>
            {classTitles.length ? (
              <div className="mt-2 text-xs text-slate-400">Classes: {classTitles.join(', ')}</div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-4 space-y-3">
            <div>
              <div className="text-sm font-semibold text-emerald-100">Upload course materials</div>
              <div className="mt-1 text-xs text-slate-400">
                <strong>Syllabus PDF</strong> — Q&amp;A + deadline import.{' '}
                <strong>Notes / readings</strong> — optional PDFs for search.
              </div>
            </div>

            {classes.length === 0 ? (
              <p className="text-xs text-amber-200/90 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2">
                Send <span className="font-mono text-amber-100">CS101, BIO 101</span> in the chat to
                create class workspaces — then the buttons below will attach files to the class you
                pick.
              </p>
            ) : null}

            {uploadGateHint ? (
              <p className="text-xs text-amber-200/90">{uploadGateHint}</p>
            ) : null}

            <div className="grid gap-2">
              <label className="text-xs text-slate-400">Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                disabled={classes.length === 0}
                className="bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm disabled:opacity-50"
              >
                {classes.length === 0 ? (
                  <option value="">— Add class names in chat —</option>
                ) : (
                  classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            <label
              className={[
                'text-sm rounded-xl border px-4 py-2.5 text-center block font-semibold transition-colors',
                classes.length && selectedClassId
                  ? 'text-slate-100 border-white/20 bg-white/[0.08] hover:bg-white/[0.12] cursor-pointer'
                  : 'text-slate-500 border-white/10 bg-black/20 cursor-not-allowed opacity-70',
              ].join(' ')}
            >
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                disabled={!classes.length || !selectedClassId}
                onChange={async (e) => {
                  if (!classes.length || !selectedClass) {
                    setUploadGateHint('Add class names in the chat first.');
                    return;
                  }
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (!f || !selectedClass) return;
                  setLoading(true);
                  setError(null);
                  try {
                    await uploadMaterialPdf(selectedClass.id, f, 'syllabus');
                    const imported = await importDeadlinesFromSyllabus(selectedClass.id, f);
                    setToolCards((prev) => [
                      { title: 'Imported deadlines', detail: `${imported.created} created` },
                      ...prev,
                    ]);
                  } catch (err: unknown) {
                    setError(err instanceof Error ? err.message : 'Upload/import failed');
                  } finally {
                    setLoading(false);
                  }
                }}
              />
              Upload syllabus PDF
            </label>

            <label
              className={[
                'text-sm rounded-xl border px-4 py-2.5 text-center block font-semibold transition-colors',
                classes.length && selectedClassId
                  ? 'text-slate-100 border-white/20 bg-white/[0.08] hover:bg-white/[0.12] cursor-pointer'
                  : 'text-slate-500 border-white/10 bg-black/20 cursor-not-allowed opacity-70',
              ].join(' ')}
            >
              <input
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                disabled={!classes.length || !selectedClassId}
                onChange={async (e) => {
                  if (!classes.length || !selectedClass) {
                    setUploadGateHint('Add class names in the chat first.');
                    return;
                  }
                  const f = e.target.files?.[0];
                  e.target.value = '';
                  if (!f || !selectedClass) return;
                  setLoading(true);
                  setError(null);
                  try {
                    const out = await uploadMaterialPdf(selectedClass.id, f, 'reading');
                    setToolCards((prev) => [
                      {
                        title: 'Indexed reading/slides',
                        detail: `${out.chunks_created} chunks`,
                      },
                      ...prev,
                    ]);
                  } catch (err: unknown) {
                    setError(err instanceof Error ? err.message : 'Upload failed');
                  } finally {
                    setLoading(false);
                  }
                }}
              />
              Upload notes or readings (PDF)
            </label>
          </div>

          {toolCards.length ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
              <div className="text-sm font-semibold">Recent actions</div>
              <ul className="space-y-2">
                {toolCards.map((c, i) => (
                  <li key={`${c.title}-${i}`} className="text-xs text-slate-300 border-l-2 border-white/20 pl-3">
                    <div className="text-slate-100">{c.title}</div>
                    {c.detail ? <div className="text-slate-400 mt-0.5">{c.detail}</div> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>

        <main className="lg:col-span-8 space-y-4">
          {error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4">
            <div className="space-y-3 max-h-[55vh] overflow-auto pr-1">
              {(chat?.messages ?? []).length ? (
                chat!.messages.map((m) => (
                  <div
                    key={m.id}
                    className={[
                      'rounded-xl border border-white/10 p-3 text-sm whitespace-pre-wrap',
                      m.role === 'assistant' ? 'bg-black/20 text-slate-100' : 'bg-white/[0.04] text-white',
                    ].join(' ')}
                  >
                    <div className="text-[11px] uppercase tracking-[0.14em] text-slate-400 mb-2">
                      {m.role}
                    </div>
                    {m.content}
                  </div>
                ))
              ) : (
                <div className="text-sm text-slate-300">
                  Your first message from GradePilot lists syllabus, notes, and readings — check above after load.
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Message GradePilot…"
                className="flex-1 min-h-[48px] max-h-[140px] bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-white/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <button
                type="button"
                disabled={loading || draft.trim().length === 0}
                onClick={() => void send()}
                className="rounded-xl bg-white text-black px-4 py-2 text-sm font-semibold disabled:opacity-60"
              >
                Send
              </button>
            </div>
            <div className="text-xs text-slate-400">
              After uploads: send semester as{' '}
              <span className="font-mono">
                timezone=America/New_York; start=YYYY-MM-DD; end=YYYY-MM-DD
              </span>{' '}
              or start with class names: <span className="font-mono">CS101, BIO 101</span>
            </div>
          </div>
        </main>
      </div>
    </StudyPlanShell>
  );
}


"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { listClasses, type ClassOut } from "@/lib/backend";

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const data = await listClasses();
        if (!cancelled) setClasses(data);
      } catch (e: any) {
        if (!cancelled) setError(e?.message ?? "Failed to load classes");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const empty = !loading && classes.length === 0 && !error;

  const sorted = useMemo(() => {
    // backend already returns newest-first, but keep it stable here
    return [...classes].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [classes]);

  return (
    <div
      className="relative min-h-screen w-full text-[#F8FAFC] font-sans overflow-x-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 50% 0%, #1a1f4a 0%, #0B0F2A 60%)",
      }}
    >
      <div className="pointer-events-none fixed top-[-10%] left-[-5%] w-[50%] h-[50%] bg-[#6D4AFF]/10 rounded-full blur-[140px]" />
      <div className="pointer-events-none fixed bottom-[-10%] right-[-5%] w-[50%] h-[50%] bg-[#00F5D4]/6 rounded-full blur-[160px]" />

      <nav className="relative z-20 flex items-center justify-between px-6 md:px-16 py-5 border-b border-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-9 h-9 rounded-xl shadow-lg shadow-[#00F5D4]/20"
            style={{ background: "linear-gradient(135deg, #6D4AFF, #00F5D4)" }}
          >
            <span className="text-white font-extrabold">G</span>
          </div>
          <span className="text-lg font-bold tracking-tight">GradePilot</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-[#94A3B8] hover:text-white transition-colors"
          >
            Back to dashboard
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl text-sm font-extrabold text-[#0B0F2A] transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #6D4AFF, #00F5D4)" }}
          >
            Create new class
          </Link>
        </div>
      </nav>

      <main className="relative z-10 px-6 md:px-16 py-12 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-end justify-between gap-6 mb-8"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
              Saved classes
            </h1>
            <p className="text-[#94A3B8] text-sm mt-2">
              These are the classes you’ve already created.
            </p>
          </div>
          <div className="text-xs text-slate-400 font-semibold">
            {loading ? "Loading…" : `${classes.length} total`}
          </div>
        </motion.div>

        {error ? (
          <div className="mb-6 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        {empty ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-white font-extrabold text-lg">
              No classes yet
            </p>
            <p className="text-[#94A3B8] text-sm mt-2">
              Go to the dashboard to create your first class.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex mt-6 px-5 py-3 rounded-2xl text-sm font-extrabold text-[#0B0F2A] transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #6D4AFF, #00F5D4)" }}
            >
              Create a class
            </Link>
          </div>
        ) : null}

        {!loading && sorted.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sorted.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="rounded-3xl bg-[#141B3A]/60 border border-white/10 backdrop-blur-md shadow-xl overflow-hidden"
              >
                <div className="p-6">
                  <p className="text-slate-400 text-[10px] font-extrabold uppercase tracking-[0.2em]">
                    Class
                  </p>
                  <h3 className="text-white font-extrabold text-lg mt-2 line-clamp-2">
                    {c.title}
                  </h3>
                  <p className="text-[#94A3B8] text-xs mt-3">
                    Created{" "}
                    <span className="text-slate-200 font-semibold">
                      {new Date(c.created_at).toLocaleString()}
                    </span>
                  </p>
                </div>
                <div className="px-6 pb-6">
                  <Link
                    href={`/dashboard?classId=${encodeURIComponent(c.id)}`}
                    className="inline-flex w-full items-center justify-center px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-extrabold transition-colors"
                  >
                    Open in dashboard
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}


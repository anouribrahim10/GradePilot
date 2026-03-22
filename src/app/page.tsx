'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Calendar,
  CheckCircle2,
  Clock,
  FileUp,
  LayoutDashboard,
  RefreshCw,
  Settings,
  Sparkles,
  Play
} from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import Chatbot from '../components/Chatbot';

// --- Utility for tailwind classes ---
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// --- Mock Data ---
const CLASSES = [
  {
    id: 1,
    course: 'CS 101: Data Structures',
    color: 'from-[#00F5D4]/10 to-transparent',
    borderColor: 'border-[#00F5D4]/20',
    tasks: [
      { id: '1a', text: 'Agent Scheduled: Read Ch. 4 tonight (2 hours)', done: false, urgent: true },
      { id: '1b', text: 'Homework 3 due in 2 days', done: false, urgent: true },
    ],
  },
  {
    id: 2,
    course: 'BIO 200: Genetics',
    color: 'from-[#6D4AFF]/10 to-transparent',
    borderColor: 'border-[#6D4AFF]/20',
    tasks: [
      { id: '2a', text: 'Review mitosis vs meiosis flashcards', done: true, urgent: false },
      { id: '2b', text: 'Lab Report 2 draft due Friday', done: false, urgent: true },
    ],
  },
  {
    id: 3,
    course: 'MATH 220: Linear Algebra',
    color: 'from-white/5 to-transparent',
    borderColor: 'border-white/10',
    tasks: [
      { id: '3a', text: 'Agent: Re-watch lecture on Eigenvectors', done: false, urgent: false },
    ],
  },
];

const LOGS = [
  { time: '10:05 AM', text: 'Extracted 3 deadlines from Biology Syllabus PDF', icon: <FileUp size={14} /> },
  { time: '11:30 AM', text: 'Cross-referenced deadlines with Google Calendar', icon: <RefreshCw size={14} /> },
  { time: '1:15 PM', text: 'Drafted study plan for CS 101 Midterm', icon: <Sparkles size={14} /> },
  { time: '2:00 PM', text: "Rearranged CS 101 study schedule because you missed yesterday's session.", icon: <Calendar size={14} />, alert: true },
  { time: 'Just now', text: 'Waiting for math lecture notes to upload.', icon: <Bot size={14} />, active: true },
];

export default function GradePilotDashboard() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  return (
    <div
      className="relative min-h-screen w-full overflow-hidden text-[#F8FAFC] font-sans selection:bg-[#00F5D4]/30"
      style={{ background: 'radial-gradient(circle at 50% 30%, #141B3A 0%, #0B0F2A 70%)' }}
    >
      {/* subtle decorative background elements */}
      <div className="absolute top-[20%] left-[10%] w-[30%] h-[30%] bg-[#6D4AFF]/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-[#00F5D4]/5 rounded-full blur-[150px] mix-blend-screen pointer-events-none" />

      {/* Main Layout Container */}
      <div className="relative z-10 flex h-screen w-full max-w-[1800px] mx-auto p-4 gap-6">

        {/* =========================================================
            LEFT SIDEBAR (Input & Communication)
        ========================================================= */}
        <motion.aside
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col w-[320px] shrink-0 gap-6 glass-panel p-5"
        >
          {/* Brand */}
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl shadow-lg shadow-[#00F5D4]/20" style={{ background: 'linear-gradient(135deg, #6D4AFF, #00F5D4)' }}>
              <Bot className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#94A3B8]">
                GradePilot
              </h1>
              <p className="text-xs text-[#00F5D4] drop-shadow-[0_0_8px_rgba(0,245,212,0.5)]">Autonomous Agent</p>
            </div>
          </div>

          {/* Sync GCal Button */}
          <button
            onClick={handleSync}
            className="group relative flex items-center justify-between w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="bg-[#00F5D4]/10 p-2 rounded-lg text-[#00F5D4] group-hover:scale-110 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-[#F8FAFC]">Sync Google Calendar</span>
            </div>
            <RefreshCw className={cn("w-4 h-4 text-[#94A3B8]", syncing && "animate-spin text-[#00F5D4]")} />
          </button>

          {/* Upload Hub */}
          <div className="flex-1 flex flex-col">
            <h2 className="text-sm font-semibold text-[#94A3B8] mb-3 flex items-center gap-2">
              <FileUp className="w-4 h-4 text-[#00F5D4]" />
              Upload Hub
            </h2>
            <div className="relative flex-1 rounded-2xl border-2 border-dashed border-white/10 hover:border-[#00F5D4]/50 bg-white/[0.02] hover:bg-[#00F5D4]/[0.02] transition-colors flex flex-col items-center justify-center p-6 text-center group cursor-pointer">
              <div className="w-12 h-12 mb-4 rounded-full bg-black/40 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#00F5D4]/20 transition-all duration-300">
                <FileUp className="w-6 h-6 text-[#94A3B8] group-hover:text-[#00F5D4]" />
              </div>
              <p className="text-sm font-medium text-[#F8FAFC] mb-1">
                Drag & Drop to Pilot
              </p>
              <p className="text-xs text-[#94A3B8]">
                Syllabi, PDFs, or Notes
              </p>
              <div className="absolute inset-x-0 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#00F5D4] bg-[#00F5D4]/10 px-3 py-1 rounded-full">Automated parsing</span>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <Chatbot />
        </motion.aside>

        {/* =========================================================
            MAIN CONTENT (Structured Output)
        ========================================================= */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          className="flex-1 flex flex-col glass-panel p-8 overflow-y-auto custom-scrollbar"
        >
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-[#F8FAFC] mb-1">
                Your Active Plan
              </h2>
              <p className="text-[#94A3B8] text-sm">Organized autonomously by GradePilot</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium px-4 py-2 bg-[#00F5D4]/10 text-[#00F5D4] rounded-full border border-[#00F5D4]/20 shadow-[0_0_15px_rgba(0,245,212,0.15)]">
              <Sparkles className="w-3.5 h-3.5" />
              Optimum Schedule Generated
            </div>
          </header>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-6">
            {CLASSES.map((cls, idx) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + idx * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={cn(
                  "relative flex flex-col p-6 rounded-3xl border bg-[#141B3A]/50 overflow-hidden backdrop-blur-md group",
                  cls.borderColor
                )}
              >
                {/* Glow behind the card header */}
                <div className={cn("absolute top-0 left-0 right-0 h-32 bg-gradient-to-b opacity-40 pointer-events-none", cls.color)} />

                <h3 className="text-xl font-semibold mb-4 z-10 text-[#F8FAFC]">{cls.course}</h3>

                <div className="flex flex-col gap-3 mb-6 z-10 flex-1">
                  {cls.tasks.map(task => (
                    <div key={task.id} className="flex items-start gap-3 group/task">
                      <div className="mt-0.5 relative flex-shrink-0">
                        <div className={cn(
                          "w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer",
                          task.done
                            ? "bg-[#22C55E] border-[#22C55E] text-[#0B0F2A]"
                            : "border-[#94A3B8]/50 text-transparent hover:border-[#00F5D4]"
                        )}>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <p className={cn(
                          "text-sm font-medium transition-colors",
                          task.done ? "text-[#94A3B8] line-through" : "text-[#F8FAFC]"
                        )}>
                          {task.text}
                        </p>
                        {task.urgent && !task.done && (
                          <span className="text-[10px] uppercase font-bold text-[#FF4D6D] mt-1 flex items-center gap-1 drop-shadow-[0_0_5px_rgba(255,77,109,0.3)]">
                            <Clock className="w-3 h-3" /> Action Required
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="z-10 mt-auto">
                  <button
                    className="w-full py-3.5 rounded-xl font-bold text-sm text-[#0B0F2A] shadow-[0_4px_20px_rgba(0,245,212,0.2)] hover:shadow-[0_4px_25px_rgba(0,245,212,0.4)] transition-all flex items-center justify-center gap-2 group/btn"
                    style={{ background: 'linear-gradient(135deg, #6D4AFF, #00F5D4)' }}
                  >
                    <Play className="w-4 h-4 fill-current group-hover/btn:scale-110 transition-transform" />
                    Start Study Session
                  </button>
                </div>
              </motion.div>
            ))}

            {/* Empty State / Add more */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex items-center justify-center p-6 rounded-3xl border-2 border-dashed border-white/5 hover:border-[#00F5D4]/20 hover:bg-[#00F5D4]/[0.02] transition-colors cursor-pointer min-h-[250px]"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                  <LayoutDashboard className="w-5 h-5 text-[#94A3B8]" />
                </div>
                <p className="text-sm font-medium text-[#94A3B8]">Agent is waiting for more classes</p>
              </div>
            </motion.div>
          </div>
        </motion.main>

        {/* =========================================================
            RIGHT SIDEBAR (Autonomous Agent Activity)
        ========================================================= */}
        <motion.aside
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          className="flex flex-col w-[340px] shrink-0 gap-6 glass-panel p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-[#F8FAFC] flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#00F5D4]" />
              Live Agent Activity
            </h2>
            <div className="w-2 h-2 rounded-full bg-[#00F5D4] animate-pulse shadow-[0_0_8px_rgba(0,245,212,0.8)]" />
          </div>

          {/* Scrolling Feed */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative">
            <div className="absolute left-[11px] top-4 bottom-4 w-px bg-white/5" />

            <div className="flex flex-col gap-6 pt-4">
              {LOGS.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="relative flex gap-4 items-start"
                >
                  <div className={cn(
                    "relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 mt-0.5",
                    log.alert
                      ? "bg-[#FF4D6D]/20 border-[#FF4D6D] text-[#FF4D6D]"
                      : log.active
                        ? "bg-[#00F5D4]/20 border-[#00F5D4] text-[#00F5D4] shadow-[0_0_10px_rgba(0,245,212,0.3)]"
                        : "bg-[#0B0F2A] border-[#94A3B8]/30 text-[#94A3B8]"
                  )}>
                    {log.icon}
                  </div>
                  <div className="flex flex-col flex-1 pt-0.5">
                    <span className="text-[10px] font-bold tracking-wider text-[#94A3B8] mb-1">{log.time}</span>
                    <p className={cn(
                      "text-sm",
                      log.alert ? "text-[#FF4D6D] font-medium" : "text-[#F8FAFC]"
                    )}>
                      {log.text}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Mini Calendar Widget */}
          <div className="mt-4 p-4 rounded-2xl bg-black/30 border border-white/5 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">Upcoming Blocks</h3>
              <Settings className="w-3.5 h-3.5 text-[#94A3B8] cursor-pointer hover:text-[#00F5D4] transition-colors" />
            </div>

            <div className="flex flex-col gap-2">
              {[
                { time: '3:00 PM', title: 'Deep Work: CS 101', dur: '2h', color: 'bg-[#00F5D4]/10 text-[#00F5D4] border-[#00F5D4]/20' },
                { time: '6:30 PM', title: 'Review BIO 200', dur: '45m', color: 'bg-[#6D4AFF]/10 text-[#6D4AFF] border-[#6D4AFF]/20' },
                { time: '8:00 PM', title: 'Free Time Guarded', dur: 'End', color: 'bg-white/5 text-[#94A3B8] border-white/5' },
              ].map((ev, i) => (
                <div key={i} className={cn("flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium", ev.color)}>
                  <div className="flex items-center gap-3">
                    <span className="opacity-80 w-12">{ev.time}</span>
                    <span>{ev.title}</span>
                  </div>
                  <span className="opacity-60">{ev.dur}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.aside>
      </div>

      {/* Global generic styles for glassmorphism shared classes */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .glass-panel {
          background: #141B3A;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 4px;
        }
      `}} />
    </div>
  );
}

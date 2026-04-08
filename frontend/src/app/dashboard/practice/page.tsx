'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronDown, Eye, EyeOff } from 'lucide-react';
import { listClasses, generatePractice, type ClassOut, type PracticeQuestion } from '@/lib/backend';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const QUESTION_COUNTS = [3, 5, 10];

export default function PracticePage() {
  const [classes, setClasses] = useState<ClassOut[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [allRevealed, setAllRevealed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  useEffect(() => {
    listClasses()
      .then(setClasses)
      .finally(() => setLoadingClasses(false));
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim() || !selectedClassId) return;
    setGenerating(true);
    setRevealed(new Set());
    setAllRevealed(false);
    setGenError(null);
    try {
      const data = await generatePractice(selectedClassId, topic.trim(), count, difficulty);
      setQuestions(data.questions);
    } catch (e: any) {
      setGenError(e?.message ?? 'Failed to generate questions');
    } finally {
      setGenerating(false);
    }
  };

  const toggleReveal = (i: number) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleShowAll = () => {
    if (allRevealed) {
      setRevealed(new Set());
      setAllRevealed(false);
    } else {
      setRevealed(new Set(questions.map((_, i) => i)));
      setAllRevealed(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pt-3 pb-12 px-2 max-w-[860px] mx-auto w-full"
    >
      <header className="mb-8 pl-2">
        <h1 className="text-[28px] font-extrabold tracking-tight text-white mb-2 leading-none">
          Practice Generator
        </h1>
        <p className="text-slate-400 text-xs font-semibold tracking-wide">
          Select a class, enter a topic, and generate a practice set
        </p>
      </header>

      <div className="bg-[#141B3A]/50 backdrop-blur-xl border border-white/5 rounded-[1.25rem] p-6 mb-6 shadow-[0_10px_40px_rgba(0,0,0,0.3)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Class */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Class</label>
            <div className="relative">
              <select
                value={selectedClassId}
                onChange={(e) => { setSelectedClassId(e.target.value); setQuestions([]); }}
                disabled={loadingClasses}
                className="w-full appearance-none bg-black/30 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#00F5D4] focus:border-[#00F5D4] transition-all cursor-pointer disabled:opacity-50"
              >
                <option value="">{loadingClasses ? 'Loading...' : 'Select a class...'}</option>
                {classes.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Topic */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Topic</label>
            <input
              value={topic}
              onChange={(e) => { setTopic(e.target.value); setQuestions([]); }}
              placeholder='e.g. "Sorting Algorithms"'
              className="w-full bg-black/30 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-[#00F5D4] focus:border-[#00F5D4] transition-all"
            />
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Difficulty</label>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    difficulty === d
                      ? 'border-[#00F5D4]/50 bg-[#00F5D4]/10 text-[#00F5D4]'
                      : 'border-white/10 bg-black/20 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* # Questions */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2 block">Questions</label>
            <div className="flex gap-2">
              {QUESTION_COUNTS.map((n) => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    count === n
                      ? 'border-[#6D4AFF]/50 bg-[#6D4AFF]/10 text-[#a78bfa]'
                      : 'border-white/10 bg-black/20 text-slate-400 hover:text-white hover:border-white/20'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || !selectedClassId || !topic.trim()}
          className="w-full py-3.5 rounded-xl font-extrabold text-sm text-[#0B0F2A] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_4px_20px_rgba(109,74,255,0.3)]"
          style={{ background: 'linear-gradient(135deg, #6D4AFF, #00F5D4)' }}
        >
          {generating ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Generating...
            </span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Practice Set
            </>
          )}
        </button>
      </div>

      {genError && (
        <div className="mb-4 px-4 py-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-sm text-rose-300">
          {genError}
        </div>
      )}

      <AnimatePresence>
        {questions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4 pl-1">
              <p className="text-slate-400 text-xs font-semibold tracking-wide">
                {questions.length} question{questions.length !== 1 ? 's' : ''} · {topic} · {difficulty}
              </p>
              <button
                onClick={handleShowAll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all"
              >
                {allRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {allRevealed ? 'Hide all answers' : 'Show all answers'}
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {questions.map((q, i) => (
                <motion.div
                  key={`${topic}-${i}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="bg-[#141B3A]/50 backdrop-blur-xl border border-white/5 rounded-[1.25rem] overflow-hidden"
                >
                  <button
                    onClick={() => toggleReveal(i)}
                    className="w-full flex items-start gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors group"
                  >
                    <span
                      className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold text-[#0B0F2A] mt-0.5"
                      style={{ background: 'linear-gradient(135deg, #6D4AFF, #00F5D4)' }}
                    >
                      {i + 1}
                    </span>
                    <p className="flex-1 text-sm font-semibold text-white leading-relaxed">{q.q}</p>
                    <span className={`shrink-0 mt-0.5 transition-transform duration-200 ${revealed.has(i) ? 'rotate-180' : ''}`}>
                      <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-white" />
                    </span>
                  </button>

                  <AnimatePresence>
                    {revealed.has(i) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-0 ml-11 border-t border-white/5">
                          <p className="text-[11px] font-bold uppercase tracking-widest text-[#00F5D4] mb-2 mt-3">Answer</p>
                          <p className="text-sm text-slate-300 leading-relaxed">{q.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

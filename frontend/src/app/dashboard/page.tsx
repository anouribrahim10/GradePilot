"use client";

import React from "react";
import { motion } from "framer-motion";

export default function DashboardPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
      className="h-full flex flex-col pt-3 pb-8 px-2 max-w-[1000px] mx-auto w-full z-10 relative"
    >
      <header className="flex items-center justify-between mb-10 pl-2">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-tight text-white mb-2 leading-none">Your Active Plan</h1>
          <p className="text-slate-400 text-xs font-semibold tracking-wide">
            Organized autonomously by GradePilot
          </p>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold shadow-inner shadow-emerald-500/10 backdrop-blur-md">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          Optimum Schedule Generated
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch pb-6">
        {/* Mock Card 1 */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.2 }}
           whileHover={{ y: -4, transition: { duration: 0.2 } }}
           className="bg-[#141B3A]/50 backdrop-blur-xl border border-white/5 rounded-[1.25rem] p-7 shadow-[0_10px_40px_rgba(0,0,0,0.3)] group hover:border-[#7364d9]/40 transition-all duration-300 flex flex-col relative overflow-hidden min-h-[280px]"
        >
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#7364d9]/10 to-transparent pointer-events-none opacity-40"></div>
          
          <h2 className="text-lg font-extrabold text-white mb-6 tracking-wide relative z-10">CS 101: Data Structures</h2>
          
          <div className="space-y-5 mb-8 flex-1 relative z-10">
            <label className="flex items-start gap-3.5 cursor-pointer group/item">
              <input type="checkbox" className="mt-0.5 w-4 h-4 rounded appearance-none border border-white/20 bg-black/30 checked:bg-[#7364d9] checked:border-[#7364d9] transition-colors cursor-pointer shrink-0" />
              <div>
                <span className="text-[13px] font-semibold text-slate-200 block group-hover/item:text-white transition-colors leading-tight">Agent Scheduled: Read Ch. 4 tonight <span className="text-slate-500 font-medium">(2 hours)</span></span>
                <span className="text-[9px] uppercase font-bold text-[#FF4D6D] mt-2 flex items-center gap-1.5 tracking-wider drop-shadow-[0_0_5px_rgba(255,77,109,0.3)]">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 
                  Action Required
                </span>
              </div>
            </label>
            <label className="flex items-start gap-3.5 cursor-pointer group/item">
              <input type="checkbox" className="mt-0.5 w-4 h-4 rounded appearance-none border border-white/20 bg-black/30 checked:bg-[#7364d9] checked:border-[#7364d9] transition-colors cursor-pointer shrink-0" />
              <div>
                <span className="text-[13px] font-semibold text-slate-200 block group-hover/item:text-white transition-colors leading-tight">Homework 3 due in 2 days</span>
                <span className="text-[9px] uppercase font-bold text-[#FF4D6D] mt-2 flex items-center gap-1.5 tracking-wider drop-shadow-[0_0_5px_rgba(255,77,109,0.3)]">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 
                  Action Required
                </span>
              </div>
            </label>
          </div>
          
          <button className="relative z-10 w-full mt-auto py-3.5 rounded-xl bg-gradient-to-r from-[#7364d9] to-[#62EBD0] text-black font-extrabold text-sm shadow-[0_4px_20px_rgba(54,211,183,0.2)] hover:shadow-[0_4px_25px_rgba(54,211,183,0.4)] transition-all flex items-center justify-center gap-2 group/btn">
            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
            Start Study Session
          </button>
        </motion.div>

        {/* Mock Card 2 */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.3 }}
           whileHover={{ y: -4, transition: { duration: 0.2 } }}
           className="bg-[#141B3A]/50 backdrop-blur-xl border border-white/5 rounded-[1.25rem] p-7 shadow-[0_10px_40px_rgba(0,0,0,0.3)] group hover:border-[#7364d9]/40 transition-all duration-300 flex flex-col relative overflow-hidden min-h-[280px]"
        >
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#36d3b7]/10 to-transparent pointer-events-none opacity-40"></div>
          
          <h2 className="text-lg font-extrabold text-white mb-6 tracking-wide relative z-10">BIO 200: Genetics</h2>
          
          <div className="space-y-5 mb-8 flex-1 relative z-10">
            <label className="flex items-start gap-3.5 cursor-pointer opacity-50 relative group/item">
              <input type="checkbox" defaultChecked className="mt-0.5 w-4 h-4 rounded bg-[#36d3b7] appearance-none flex items-center justify-center border-none shrink-0" />
              <svg className="absolute w-4 h-4 text-[#141B3A] left-0 top-0.5 pointer-events-none p-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              <div>
                <span className="text-[13px] font-semibold text-slate-300 block line-through leading-tight">Review mitosis vs meiosis flashcards</span>
              </div>
            </label>
            <label className="flex items-start gap-3.5 cursor-pointer group/item">
              <input type="checkbox" className="mt-0.5 w-4 h-4 rounded appearance-none border border-white/20 bg-black/30 checked:bg-[#7364d9] checked:border-[#7364d9] transition-colors cursor-pointer shrink-0" />
              <div>
                <span className="text-[13px] font-semibold text-slate-200 block group-hover/item:text-white transition-colors leading-tight">Lab Report 2 draft due Friday</span>
                <span className="text-[9px] uppercase font-bold text-[#FF4D6D] mt-2 flex items-center gap-1.5 tracking-wider drop-shadow-[0_0_5px_rgba(255,77,109,0.3)]">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> 
                  Action Required
                </span>
              </div>
            </label>
          </div>
          
          <button className="relative z-10 w-full mt-auto py-3.5 rounded-xl bg-gradient-to-r from-[#7364d9] to-[#62EBD0] text-black font-extrabold text-sm shadow-[0_4px_20px_rgba(54,211,183,0.2)] hover:shadow-[0_4px_25px_rgba(54,211,183,0.4)] transition-all flex items-center justify-center gap-2 group/btn">
            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
            Start Study Session
          </button>
        </motion.div>
        
        {/* Mock Card 3 */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.5, delay: 0.4 }}
           whileHover={{ y: -4, transition: { duration: 0.2 } }}
           className="bg-[#141B3A]/50 backdrop-blur-xl border border-white/5 rounded-[1.25rem] p-7 shadow-[0_10px_40px_rgba(0,0,0,0.3)] group hover:border-[#7364d9]/40 transition-all duration-300 flex flex-col relative overflow-hidden min-h-[280px]"
        >
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none opacity-40"></div>
          
          <h2 className="text-lg font-extrabold text-white mb-6 tracking-wide relative z-10">MATH 220: Linear Algebra</h2>
          
          <div className="space-y-4 mb-8 flex-1 relative z-10">
            <label className="flex items-start gap-3.5 cursor-pointer group/item">
              <input type="checkbox" className="mt-0.5 w-4 h-4 rounded appearance-none border border-white/20 bg-black/30 checked:bg-[#7364d9] checked:border-[#7364d9] transition-colors cursor-pointer shrink-0" />
              <div>
                <span className="text-[13px] font-semibold text-slate-200 block group-hover/item:text-white transition-colors leading-tight">Agent: Re-watch lecture on Eigenvectors</span>
              </div>
            </label>
          </div>
          
          <button className="relative z-10 w-full mt-auto py-3.5 rounded-xl bg-gradient-to-r from-[#7364d9] to-[#62EBD0] text-black font-extrabold text-sm shadow-[0_4px_20px_rgba(54,211,183,0.2)] hover:shadow-[0_4px_25px_rgba(54,211,183,0.4)] transition-all flex items-center justify-center gap-2 group/btn">
            <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" /></svg>
            Start Study Session
          </button>
        </motion.div>

        {/* Empty State / Wait Card */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.5, delay: 0.6 }}
           className="bg-transparent border-2 border-dashed border-white/5 hover:border-[#36d3b7]/20 hover:bg-[#36d3b7]/[0.02] transition-colors rounded-[1.25rem] p-7 flex flex-col items-center justify-center gap-4 text-center min-h-[280px] cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full border border-white/5 bg-white/5 flex items-center justify-center">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
          </div>
          <p className="text-slate-500 text-[11px] uppercase tracking-widest font-bold">Agent is waiting for more classes</p>
        </motion.div>

      </div>
    </motion.div>
  );
}

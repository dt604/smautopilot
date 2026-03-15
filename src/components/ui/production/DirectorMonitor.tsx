"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, CheckCircle, AlertCircle, Rocket, Tv, RefreshCcw, Download, Share2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ProductionStatus = "idle" | "preparing" | "rendering" | "finalizing" | "completed" | "error";

interface LogEntry {
  id: string;
  message: string;
  status: "pending" | "done" | "active";
}

export default function DirectorMonitor() {
  const [status, setStatus] = useState<ProductionStatus>("idle");
  const [progress, setProgress] = useState(0);

  const STEPS: LogEntry[] = [
    { id: "1", message: "Synchronizing Brand Identity & Script", status: progress > 10 ? "done" : progress > 0 ? "active" : "pending" },
    { id: "2", message: "HeyGen Avatar Handshake", status: progress > 40 ? "done" : progress > 15 ? "active" : "pending" },
    { id: "3", message: "AI Voice Synthesis & Lip Sync", status: progress > 70 ? "done" : progress > 45 ? "active" : "pending" },
    { id: "4", message: "UGC Background & Overlay Compositing", status: progress > 90 ? "done" : progress > 75 ? "active" : "pending" },
    { id: "5", message: "Final Video Export", status: progress === 100 ? "done" : progress > 95 ? "active" : "pending" },
  ];

  const startProduction = () => {
    setStatus("preparing");
    setProgress(0);
  };

  useEffect(() => {
    if (status === "preparing" || status === "rendering") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setStatus("completed");
            clearInterval(interval);
            return 100;
          }
          return prev + 1;
        });
      }, 150);
      return () => clearInterval(interval);
    }
  }, [status]);

  return (
    <div className="glass rounded-3xl overflow-hidden border-white/5 flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-500 border border-emerald-500/20 glow-sm">
            <Tv size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Director&apos;s Monitor</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Live Feed</p>
          </div>
        </div>

        {status === "completed" && (
           <motion.div 
             initial={{ opacity: 0, scale: 0.8 }}
             animate={{ opacity: 1, scale: 1 }}
             className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-3 py-1.5 rounded-full border border-emerald-500/20"
           >
             <CheckCircle size={12} />
             PRODUCTION READY
           </motion.div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-6 gap-8">
        {/* Monitor Wrapper */}
        <div className="relative aspect-video bg-black/40 rounded-2xl overflow-hidden border border-white/5 group shadow-2xl">
          <AnimatePresence mode="wait">
            {status === "idle" ? (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-4"
              >
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/20 animate-pulse border border-white/5">
                   <Play size={40} />
                </div>
                <div>
                   <p className="text-sm font-bold text-muted-foreground">Monitor Standby</p>
                   <p className="text-xs text-muted-foreground/50 mt-1">Select an Actor and Approved Script to start production.</p>
                </div>
                <button 
                  onClick={startProduction}
                  className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:scale-[1.05] active:scale-95 transition-all glow-md shadow-2xl shadow-primary/20"
                >
                  START PRODUCTION
                </button>
              </motion.div>
            ) : status === "completed" ? (
              <motion.div 
                key="completed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-10"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
                <img 
                  src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop" 
                  className="w-full h-full object-cover"
                  alt="Final Preview"
                />
                
                {/* Completion UI Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 space-y-6">
                   <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-2xl animate-bounce">
                      <Download size={24} strokeWidth={3} />
                   </div>
                   <div className="text-center">
                      <h4 className="text-2xl font-black text-white">Video Rendered!</h4>
                      <p className="text-sm text-white/60">Export complete: 00:45s (9:16 aspect)</p>
                   </div>
                   
                   <div className="flex gap-4">
                      <button className="flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold hover:bg-white/20 transition-all border border-white/20">
                         <Share2 size={14} /> Send to TikTok
                      </button>
                      <button 
                         onClick={() => setStatus("idle")}
                         className="flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold hover:bg-white/20 transition-all border border-white/20"
                      >
                         <RefreshCcw size={14} /> New Production
                      </button>
                   </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center space-y-6"
              >
                 <div className="relative">
                    <Loader2 className="w-20 h-20 text-emerald-500 animate-spin opacity-50" />
                    <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                       <Rocket size={32} />
                    </div>
                 </div>
                 
                 <div className="w-64 space-y-2 text-center">
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                       <motion.div 
                         className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 glow-sm"
                         initial={{ width: 0 }}
                         animate={{ width: `${progress}%` }}
                       />
                    </div>
                    <p className="text-[10px] font-black italic text-emerald-500 uppercase tracking-widest">
                       {progress < 20 ? "INITIATING HANDSHAKE" : 
                        progress < 50 ? "SYNCING LIP MOVEMENTS" : 
                        progress < 80 ? "COMPOSITING SCENE" : 
                        "EXPORTING MASTER"} {progress}%
                    </p>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Static Scanlines Effect */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%] border-noise" />
        </div>

        {/* Step Log */}
        <div className="space-y-3">
          {STEPS.map((step) => (
            <div 
              key={step.id} 
              className={cn(
                "flex items-center gap-3 transition-all duration-500",
                step.status === "pending" ? "opacity-20 translate-x-1" :
                step.status === "active" ? "opacity-100 translate-x-1 text-emerald-400" :
                "opacity-60 grayscale-[0.5]"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full",
                step.status === "pending" ? "bg-white/20" :
                step.status === "active" ? "bg-emerald-500 animate-pulse glow-sm" :
                "bg-emerald-500"
              )} />
              <span className="text-[11px] font-medium tracking-tight">
                {step.message}
              </span>
              {step.status === "done" && <CheckCircle size={10} className="text-emerald-500" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

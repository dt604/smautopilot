"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Loader2, CheckCircle, Rocket, Tv, RefreshCcw, Download, Share2, AlertCircle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "sonner";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ProductionStatus = "idle" | "preparing" | "rendering" | "completed" | "error";

interface LogEntry {
  id: string;
  message: string;
  status: "pending" | "done" | "active";
}

interface DirectorMonitorProps {
  scriptId?: string;
  avatarId?: string;
}

export default function DirectorMonitor({ scriptId, avatarId }: DirectorMonitorProps) {
  const [status, setStatus] = useState<ProductionStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [videoId, setVideoId] = useState<string | null>(null);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const STEPS: LogEntry[] = [
    { id: "1", message: "Synchronizing Brand Identity & Script", status: progress > 10 ? "done" : progress > 0 ? "active" : "pending" },
    { id: "2", message: "HeyGen Avatar Handshake", status: progress > 40 ? "done" : progress > 15 ? "active" : "pending" },
    { id: "3", message: "AI Voice Synthesis & Lip Sync", status: progress > 70 ? "done" : progress > 45 ? "active" : "pending" },
    { id: "4", message: "UGC Background & Overlay Compositing", status: progress > 90 ? "done" : progress > 75 ? "active" : "pending" },
    { id: "5", message: "Final Video Export", status: status === "completed" ? "done" : progress > 95 ? "active" : "pending" },
  ];

  const startProduction = async () => {
    if (!scriptId || !avatarId) {
      toast.error("Please select both a script and an actor first.");
      return;
    }

    setStatus("preparing");
    setProgress(5);
    setErrorStatus(null);

    try {
      const response = await fetch("/api/render-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script_id: scriptId,
          avatar_id: avatarId
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to start render.");

      setVideoId(result.video_id);
      setStatus("rendering");
      startPolling(result.video_id);
    } catch (err: any) {
      setErrorStatus(err.message);
      setStatus("error");
      toast.error(err.message);
    }
  };

  const startPolling = (vid: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/render-video/status?video_id=${vid}`);
        const result = await response.json();

        if (result.status === "completed") {
          setFinalVideoUrl(result.video_url);
          setProgress(100);
          setStatus("completed");
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          toast.success("Video production complete!");
        } else if (result.status === "failed") {
          throw new Error("HeyGen rendering failed.");
        } else {
          // Increment progress artificially based on real state if possible
          // For now, let's just nudge it up slowly
          setProgress(prev => Math.min(prev + 2, 98));
        }
      } catch (err: any) {
        setErrorStatus(err.message);
        setStatus("error");
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      }
    }, 5000); // Poll every 5 seconds
  };

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, []);

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
            {(status === "idle" || status === "error") ? (
              <motion.div 
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 space-y-4"
              >
                <div className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center animate-pulse border border-white/5",
                  status === "error" ? "bg-red-500/10 text-red-500" : "bg-white/5 text-muted-foreground/20"
                )}>
                   {status === "error" ? <AlertCircle size={40} /> : <Play size={40} />}
                </div>
                <div>
                   <p className="text-sm font-bold text-muted-foreground">
                     {status === "error" ? "Production Interrupted" : "Monitor Standby"}
                   </p>
                   <p className="text-xs text-muted-foreground/50 mt-1">
                     {status === "error" ? errorStatus : "Select an Approved Script and Actor to start production."}
                   </p>
                </div>
                <button 
                  onClick={startProduction}
                  disabled={!scriptId || !avatarId}
                  className="px-8 py-3 bg-primary text-white text-sm font-bold rounded-xl hover:scale-[1.05] active:scale-95 transition-all glow-md shadow-2xl shadow-primary/20 disabled:opacity-30"
                >
                  {status === "error" ? "RETRY PRODUCTION" : "START PRODUCTION"}
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
                
                {/* Real Preview or Placeholder */}
                {finalVideoUrl ? (
                  <video 
                    src={finalVideoUrl} 
                    className="w-full h-full object-cover" 
                    controls 
                    autoPlay
                  />
                ) : (
                  <img 
                    src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop" 
                    className="w-full h-full object-cover"
                    alt="Final Preview"
                  />
                )}
                
                {/* Completion UI Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 space-y-6 pointer-events-none">
                   <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-black shadow-2xl animate-bounce pointer-events-auto cursor-pointer" onClick={() => window.open(finalVideoUrl!, '_blank')}>
                      <Download size={24} strokeWidth={3} />
                   </div>
                   <div className="text-center">
                      <h4 className="text-2xl font-black text-white">Video Rendered!</h4>
                      <p className="text-sm text-white/60">Final cut ready for distribution.</p>
                   </div>
                   
                   <div className="flex gap-4 pointer-events-auto">
                      <button className="flex items-center gap-2 px-6 py-2 bg-white/10 backdrop-blur-md rounded-xl text-xs font-bold hover:bg-white/20 transition-all border border-white/20">
                         <Share2 size={14} /> Send to TikTok
                      </button>
                      <button 
                         onClick={() => { setStatus("idle"); setProgress(0); setVideoId(null); setFinalVideoUrl(null); }}
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
                        progress < 85 ? "COMPOSITING SCENE" : 
                        "UPLOADING MASTER"} {Math.round(progress)}%
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

"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileEdit, Sparkles, Wand2, Copy, Check, ChevronLeft, ChevronRight, Play, Loader2, Clock, Zap } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { GeneratedScript } from "@/lib/engine/types";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ScriptLabProps {
  businessId?: string;
  voiceMemoId?: string;
  onScriptsGenerated?: (scripts: GeneratedScript[]) => void;
}

export default function ScriptLab({ businessId, voiceMemoId, onScriptsGenerated }: ScriptLabProps) {
  const [scripts, setScripts] = useState<GeneratedScript[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"hook" | "body" | "cta">("hook");
  const [isCopied, setIsCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateScripts = async () => {
    if (!businessId) return;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-scripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: businessId,
          voice_memo_id: voiceMemoId,
          count: 4
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to generate scripts.");

      setScripts(result.data.parsed);
      setCurrentIndex(0);
      onScriptsGenerated?.(result.data.parsed);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const script = scripts[currentIndex];

  const handleCopy = () => {
    if (!script) return;
    const text = `${script.hook}\n\n${script.body}\n\n${script.cta}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="glass rounded-3xl overflow-hidden border-white/5 flex flex-col h-[500px]">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 glow-sm">
            <Wand2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Script Lab</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Drafting Workspace</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!isLoading && scripts.length === 0 && businessId && (
            <button
              onClick={generateScripts}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:scale-[1.02] active:scale-95 transition-all glow-sm flex items-center gap-2"
            >
              <Sparkles size={14} />
              Draft Scripts
            </button>
          )}

          {scripts.length > 0 && (
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0 || isLoading}
                className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-20 transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-xs font-mono font-bold bg-white/5 px-3 py-1 rounded-full">
                {currentIndex + 1} / {scripts.length}
              </span>
              <button 
                onClick={() => setCurrentIndex(Math.min(scripts.length - 1, currentIndex + 1))}
                disabled={currentIndex === scripts.length - 1 || isLoading}
                className="p-2 hover:bg-white/5 rounded-lg disabled:opacity-20 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 relative">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
            <div className="relative">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            </div>
            <p className="text-sm font-medium text-muted-foreground animate-pulse">Gemini is drafting viral angles...</p>
          </div>
        ) : scripts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground/30">
              <Zap size={32} />
            </div>
            <div>
              <p className="text-sm font-medium">Ready to start the session?</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
                {businessId 
                  ? "Click 'Draft Scripts' to generate creative UGC concepts based on your Brand Brain." 
                  : "Complete your Brand Brain first to enable script generation."}
              </p>
            </div>
            {businessId && (
              <button
                onClick={generateScripts}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold rounded-xl transition-all border border-white/5"
              >
                Draft First Batch
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Sidebar Tabs */}
            <div className="w-full md:w-32 border-b md:border-b-0 md:border-r border-white/5 p-2 flex md:flex-col gap-2 bg-white/[0.01]">
              {(["hook", "body", "cta"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 md:flex-none py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-tight transition-all text-center md:text-left",
                    activeTab === tab 
                      ? "bg-primary text-white glow-sm" 
                      : "hover:bg-white/5 text-muted-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-8 flex flex-col relative group overflow-hidden">
               <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${script.title}-${activeTab}`}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-xl md:text-2xl font-medium leading-relaxed italic text-white/90"
                  >
                    &ldquo;{script[activeTab]}&rdquo;
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">Angle: {script.angle}</span>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock size={12} />
                      <span className="text-[10px] font-mono">{script.estimated_duration_seconds}s avg</span>
                    </div>
                  </div>
                  <button className="p-2 hover:text-primary transition-colors">
                    <FileEdit size={16} />
                  </button>
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-xs font-bold hover:bg-white/10 transition-all border border-white/5"
                  >
                    {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                    {isCopied ? "Copied" : "Copy All"}
                  </button>
                  <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold hover:scale-[1.02] transition-all active:scale-95 shadow-lg shadow-emerald-500/20">
                    <Play size={14} fill="currentColor" />
                    Send to HeyGen
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border-t border-red-500/20 p-3 text-[10px] text-red-500 text-center font-bold uppercase tracking-wider">
          Error: {error}
        </div>
      )}
    </div>
  );
}

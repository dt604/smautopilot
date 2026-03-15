"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Link as LinkIcon, FileText, X, Globe, Instagram, Facebook, Youtube, CheckCircle2, Loader2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Source {
  id: string;
  type: "url" | "file";
  value: string | File;
  platform?: "tiktok" | "facebook" | "instagram" | "youtube" | "web";
  status: "pending" | "processing" | "ready";
}

export default function UniversalIngester() {
  const [sources, setSources] = useState<Source[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const detectPlatform = (url: string): Source["platform"] => {
    if (url.includes("tiktok.com")) return "tiktok";
    if (url.includes("facebook.com")) return "facebook";
    if (url.includes("instagram.com")) return "instagram";
    if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
    return "web";
  };

  const addUrl = () => {
    if (!inputValue) return;
    const newSource: Source = {
      id: Math.random().toString(36).substr(2, 9),
      type: "url",
      value: inputValue,
      platform: detectPlatform(inputValue),
      status: "pending",
    };
    setSources([...sources, newSource]);
    setInputValue("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newSources: Source[] = Array.from(files).map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      type: "file",
      value: file,
      status: "pending",
    }));

    setSources([...sources, ...newSources]);
  };

  const removeSource = (id: string) => {
    setSources(sources.filter((s) => s.id !== id));
  };

  const startAnalysis = async () => {
    if (sources.length === 0) return;
    
    setIsUploading(true);
    
    try {
      const urls = sources
        .filter(s => s.type === "url")
        .map(s => s.value as string);

      const response = await fetch("/api/extract-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls,
          user_id: "00000000-0000-0000-0000-000000000001" // Placeholder until auth is wired
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to analyze brand.");
      }

      // Handle success - broadcast event for dashboard to pick up
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent("brand-analysis-complete", { detail: result.data }));
      }

    } catch (err: any) {
      console.error("Analysis error:", err);
      // We'll use a proper toast later, for now just alert
      alert(err.message || "An error occurred during analysis.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="glass p-6 rounded-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -z-10 group-hover:bg-primary/20 transition-all duration-700" />
        
        <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <span className="text-gradient">Feed the Brain</span>
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Add your website, social profiles, product videos, or sales decks. The more you give, the smarter the scripts.
        </p>

        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Paste any URL (TikTok, Website, FB...)"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/50"
              onKeyDown={(e) => e.key === "Enter" && addUrl()}
            />
          </div>
          <button
            onClick={addUrl}
            className="bg-primary hover:bg-accent text-white px-4 py-2 rounded-xl font-medium transition-all active:scale-95 glow"
          >
            Add
          </button>
        </div>

        <div className="relative mb-6">
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-8 cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-all group">
            <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
            <span className="text-sm font-medium">Upload Assets</span>
            <span className="text-xs text-muted-foreground mt-1">MP4, JPG, PDF, or Doc</span>
            <input type="file" multiple className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        <AnimatePresence>
          {sources.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1 uppercase tracking-wider">
                <span>Stacked Sources</span>
                <span>{sources.length}</span>
              </div>
              <div className="space-y-2">
                {sources.map((source) => (
                  <motion.div
                    key={source.id}
                    layoutId={source.id}
                    className="flex items-center gap-3 glass p-3 rounded-xl border-white/5 group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                      {source.type === "url" ? (
                        <>
                          {source.platform === "tiktok" && <span className="font-bold text-[10px]">TT</span>}
                          {source.platform === "instagram" && <Instagram size={14} className="text-pink-500" />}
                          {source.platform === "facebook" && <Facebook size={14} className="text-blue-500" />}
                          {source.platform === "youtube" && <Youtube size={14} className="text-red-500" />}
                          {source.platform === "web" && <Globe size={14} className="text-emerald-500" />}
                        </>
                      ) : (
                        <FileText size={14} className="text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {typeof source.value === "string" ? source.value : (source.value as File).name}
                      </p>
                    </div>
                    <button
                      onClick={() => removeSource(source.id)}
                      className="p-1 hover:bg-red-500/20 hover:text-red-500 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={startAnalysis}
                disabled={isUploading}
                className="w-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_auto] animate-gradient-x py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Analyzing Assets...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Confirm & Build Brain
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import UniversalIngester from "@/components/ui/ingester/UniversalIngester";
import BrandIdentityReview from "@/components/ui/ingester/BrandIdentityReview";
import TrendingPulse from "@/components/ui/ingester/TrendingPulse";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BrainCircuit, Rocket, CheckCircle, Info, Zap, Wand2, Tv, Video, UserPlus } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Dynamically import browser-only components
const VoiceMemoRecorder = dynamic(
  () => import("@/components/ui/ingester/VoiceMemoRecorder"),
  { ssr: false, loading: () => <div className="glass p-6 rounded-2xl h-[240px] animate-pulse bg-white/5" /> }
);

const ScriptLab = dynamic(
  () => import("@/components/ui/ingester/ScriptLab"),
  { ssr: false, loading: () => <div className="glass rounded-3xl h-[500px] animate-pulse bg-white/5" /> }
);

const ActorGallery = dynamic(
  () => import("@/components/ui/production/ActorGallery"),
  { ssr: false, loading: () => <div className="glass p-6 rounded-3xl h-[400px] animate-pulse bg-white/5" /> }
);

const DirectorMonitor = dynamic(
  () => import("@/components/ui/production/DirectorMonitor"),
  { ssr: false, loading: () => <div className="glass rounded-3xl h-[500px] animate-pulse bg-white/5" /> }
);

export default function DashboardPage() {
  const [activePhase, setActivePhase] = useState<"inception" | "creation" | "production">("inception");
  const [brandData, setBrandData] = useState<any>(null);
  const [businessRecord, setBusinessRecord] = useState<any>(null);
  const [voiceMemoRecord, setVoiceMemoRecord] = useState<any>(null);
  
  // Production State
  const [selectedScriptId, setSelectedScriptId] = useState<string | undefined>(undefined);
  const [selectedActorId, setSelectedActorId] = useState<string | undefined>(undefined);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string | undefined>(undefined);

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const handleAnalysisComplete = (e: any) => {
      setBrandData(e.detail.brandBrain);
      setBusinessRecord(e.detail.business);
      setIsSuccess(true);
      toast.success("Brand DNA Extracted!");
      setTimeout(() => setIsSuccess(false), 5000);
      setActivePhase("creation");
    };

    window.addEventListener("brand-analysis-complete", handleAnalysisComplete);
    return () => window.removeEventListener("brand-analysis-complete", handleAnalysisComplete);
  }, []);

  const handleVoiceComplete = (result: any) => {
    setVoiceMemoRecord(result);
    toast.success("Founder Nuance Extracted!");
  };

  const handleScriptApproved = (script: any) => {
    setSelectedScriptId(script.id);
    setActivePhase("production");
  };

  return (
    <div className="space-y-12 pb-20 max-w-[1600px] mx-auto min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-8 px-4">
        <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-primary/20 blur-[120px] rounded-full" />
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary font-bold tracking-widest text-[10px] uppercase mb-4"
          >
            <Sparkles size={14} />
            The Intelligence Engine
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black mb-6 leading-[1.1]">
            Automate Your <span className="text-gradient">Viral Presence.</span>
          </h1>
          
          {/* Phase Navigation */}
          <div className="flex gap-4 mt-8">
            {(["inception", "creation", "production"] as const).map((phase, idx) => (
              <button
                key={phase}
                onClick={() => setActivePhase(phase)}
                className={cn(
                  "flex items-center gap-2 px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all border",
                  activePhase === phase 
                    ? "bg-primary text-white border-primary glow-sm" 
                    : "bg-white/5 text-muted-foreground border-white/5 hover:bg-white/10"
                )}
              >
                <span className="opacity-40">{idx + 1}.</span>
                {phase}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Phase Views */}
      <AnimatePresence mode="wait">
        {activePhase === "inception" && (
          <motion.div
            key="inception"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 items-start"
          >
            <div className="lg:col-span-8 space-y-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <UniversalIngester />
                  <div className="space-y-8">
                    <VoiceMemoRecorder 
                      businessId={businessRecord?.id} 
                      onComplete={handleVoiceComplete}
                    />
                    {!businessRecord && (
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center text-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                           <Info size={18} />
                         </div>
                         <p className="text-xs text-muted-foreground leading-relaxed px-4">
                           Complete the brand analysis above to unlock founder nuance recording.
                         </p>
                      </div>
                    )}
                  </div>
               </div>
            </div>
            <div className="lg:col-span-4 space-y-8">
               <BrandIdentityReview data={brandData} />
            </div>
          </motion.div>
        )}

        {activePhase === "creation" && (
          <motion.div
            key="creation"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 items-start"
          >
             <div className="lg:col-span-8 space-y-8">
                <ScriptLab 
                   businessId={businessRecord?.id} 
                   voiceMemoId={voiceMemoRecord?.id} 
                   onScriptApproved={handleScriptApproved}
                />
             </div>
             <div className="lg:col-span-4 space-y-8">
                <TrendingPulse />
             </div>
          </motion.div>
        )}

        {activePhase === "production" && (
           <motion.div
             key="production"
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: -20 }}
             className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 items-start"
           >
              <div className="lg:col-span-8 space-y-8">
                 <ActorGallery onSelect={(selection) => {
                    setSelectedActorId(selection.avatarId);
                    setSelectedVoiceId(selection.voiceId);
                 }} />
                 <div className="glass p-8 rounded-3xl border-dashed border-white/10 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground">
                      <Video size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold">Scene Settings</h4>
                      <p className="text-xs text-muted-foreground mt-1">Configure lighting, captions, and brand overlays.</p>
                    </div>
                 </div>
              </div>
              <div className="lg:col-span-4 space-y-8">
                 <DirectorMonitor 
                    scriptId={selectedScriptId}
                    avatarId={selectedActorId}
                    voiceId={selectedVoiceId}
                 />
              </div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

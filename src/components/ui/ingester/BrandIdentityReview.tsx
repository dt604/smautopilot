"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Target, Palette, Volume2, Sparkles, AlertCircle } from "lucide-react";

interface BrandData {
  name: string;
  brand_voice: string;
  target_audience: string;
  colors: { primary: string; secondary: string };
  value_props: string[];
  status: "draft" | "merging" | "ready";
}

export default function BrandIdentityReview({ data }: { data: BrandData | null }) {
  if (!data) {
    return (
      <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 border-dashed border-white/10">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-muted-foreground">
          <AlertCircle size={24} />
        </div>
        <div>
          <h3 className="font-bold text-lg">Brain Offline</h3>
          <p className="text-sm text-muted-foreground">Incorporate your sources to define your brand identity.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Brand Voice Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-6 rounded-2xl space-y-4 border-white/5"
      >
        <div className="flex items-center gap-2 text-primary">
          <Volume2 size={18} />
          <span className="text-xs font-bold uppercase tracking-widest">Brand Voice</span>
        </div>
        <p className="text-lg font-medium leading-relaxed italic border-l-2 border-primary/50 pl-4 py-1">
          &quot;{data.brand_voice}&quot;
        </p>
      </motion.div>

      {/* Target Audience Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass p-6 rounded-2xl space-y-4 border-white/5"
      >
        <div className="flex items-center gap-2 text-pink-500">
          <Target size={18} />
          <span className="text-xs font-bold uppercase tracking-widest text-pink-500">Ideal User</span>
        </div>
        <p className="text-lg font-bold">{data.target_audience}</p>
      </motion.div>

      {/* Brand Assets */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass p-6 rounded-2xl space-y-6 md:col-span-2 border-white/5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-500">
            <Palette size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Visual DNA</span>
          </div>
          <div className="flex gap-2">
            <div 
              className="w-6 h-6 rounded-full border border-white/10 glow" 
              style={{ backgroundColor: data.colors.primary }}
              title="Primary Color"
            />
            <div 
              className="w-6 h-6 rounded-full border border-white/10" 
              style={{ backgroundColor: data.colors.secondary }}
              title="Secondary Color"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase opacity-50">Core Value Props</h4>
            <div className="space-y-2">
              {data.value_props.map((prop, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <ShieldCheck size={14} className="text-primary shrink-0" />
                  <span>{prop}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center p-6 bg-white/5 rounded-xl border border-white/5">
            <Sparkles className="text-primary mb-2" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">AI Ready Status</p>
            <p className="text-xl font-black">98% CALIBRATED</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Music, TrendingUp, Hash, Zap, Play } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const TRENDS = [
  {
    id: 1,
    type: "sound",
    title: "Elevator Jazz (Lo-Fi Remix)",
    growth: "+145%",
    genre: "Aesthetic / Chill",
  },
  {
    id: 2,
    type: "topic",
    title: "The '3-Step' Morning Routine",
    growth: "+88%",
    genre: "Productivity",
  },
  {
    id: 3,
    type: "hook",
    title: "Stop doing [Common Mistake]...",
    growth: "+210%",
    genre: "Education",
  },
];

export default function TrendingPulse() {
  return (
    <div className="glass p-6 rounded-2xl relative overflow-hidden h-full">
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl -z-10" />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Zap className="text-emerald-500 fill-emerald-500" size={18} />
            Daily Pulse
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Market trends for your niche.</p>
        </div>
        <div className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
          Live
        </div>
      </div>

      <div className="space-y-4">
        {TRENDS.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-white/5"
          >
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
              item.type === "sound" ? "bg-blue-500/10 text-blue-500" :
              item.type === "topic" ? "bg-purple-500/10 text-purple-500" :
              "bg-amber-500/10 text-amber-500"
            )}>
              {item.type === "sound" && <Music size={18} />}
              {item.type === "topic" && <TrendingUp size={18} />}
              {item.type === "hook" && <Hash size={18} />}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
                {item.title}
              </h4>
              <p className="text-[10px] text-muted-foreground">{item.genre}</p>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-500">{item.growth}</span>
              <div className="flex justify-end mt-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-0.5 h-2 bg-emerald-500/30 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full mt-6 py-2 text-xs font-bold text-muted-foreground hover:text-white transition-colors border-t border-white/5 pt-4">
        View Viral Heatmap &rarr;
      </button>
    </div>
  );
}

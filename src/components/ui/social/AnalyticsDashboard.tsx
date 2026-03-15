"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, Eye, BarChart3, ArrowUpRight, ArrowDownRight, Share2, MessageCircle, Heart } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

function StatCard({ title, value, change, isPositive, icon }: StatCardProps) {
  return (
    <div className="glass p-6 rounded-3xl border-white/5 space-y-4 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
        <div className={cn(
          "flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-full border",
          isPositive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
        )}>
          {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{title}</p>
        <h4 className="text-2xl font-black mt-1">{value}</h4>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-black tracking-tight">Performance Pilot</h2>
          <p className="text-muted-foreground text-sm mt-1">Real-time engagement across your social empire.</p>
        </div>
        
        <div className="flex gap-2">
           <select className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs font-bold focus:outline-none focus:ring-2 ring-primary/50">
             <option>Last 7 Days</option>
             <option>Last 30 Days</option>
             <option>All Time</option>
           </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Views" value="2.4M" change="+12.5%" isPositive={true} icon={<Eye size={20} />} />
        <StatCard title="Follower Growth" value="12,402" change="+8.2%" isPositive={true} icon={<Users size={20} />} />
        <StatCard title="Avg. Engagement" value="4.8%" change="-0.4%" isPositive={false} icon={<TrendingUp size={20} />} />
        <StatCard title="Posts Generatd" value="142" change="+24" isPositive={true} icon={<BarChart3 size={20} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart Card */}
        <div className="lg:col-span-8 glass p-8 rounded-[2rem] border-white/5 bg-white/[0.01]">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold flex items-center gap-2">
                 <TrendingUp className="text-primary" size={20} />
                 Engagement Pulse
              </h3>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary glow-sm" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Tiktok</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-pink-500" />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Instagram</span>
                 </div>
              </div>
           </div>

           {/* Placeholder for SVG Chart */}
           <div className="relative h-[300px] w-full mt-4 flex items-end gap-2 px-2">
              {[40, 70, 45, 90, 65, 80, 55, 100, 75, 40, 60, 85].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                   <div className="relative w-full overflow-hidden rounded-t-lg bg-white/[0.03] flex items-end h-[240px]">
                      <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, duration: 1, ease: "easeOut" }}
                        className={cn(
                          "w-full bg-gradient-to-t from-primary/20 to-primary glow-xs group-hover:from-primary/40 group-hover:to-primary group-hover:scale-x-105 transition-all",
                          i % 2 === 0 ? "from-primary/20 to-primary" : "from-pink-500/20 to-pink-500"
                        )}
                      />
                   </div>
                   <span className="text-[8px] font-bold text-muted-foreground/30">DAY {i + 1}</span>
                </div>
              ))}
           </div>
        </div>

        {/* Top Posts */}
        <div className="lg:col-span-4 glass p-8 rounded-[2rem] border-white/5 bg-white/[0.01] flex flex-col">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Hall of Fame</h3>
              <button className="text-[10px] font-black text-primary uppercase hover:underline">View All</button>
           </div>

           <div className="space-y-4 flex-1">
              {[
                { title: "Secrets of the Kitchen", views: "1.2M", hearts: "142k", thumb: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2670&auto=format&fit=crop" },
                { title: "Menu Hacks 2026", views: "840k", hearts: "92k", thumb: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2670&auto=format&fit=crop" },
                { title: "Friday Night Vibe", views: "410k", hearts: "31k", thumb: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=2574&auto=format&fit=crop" }
              ].map((post, i) => (
                <div key={i} className="flex gap-4 group cursor-pointer">
                   <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/5 relative flex-shrink-0">
                      <img src={post.thumb} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <TrendingUp size={16} className="text-white" />
                      </div>
                   </div>
                   <div className="flex flex-col justify-center gap-1">
                      <h5 className="text-xs font-bold leading-tight line-clamp-1">{post.title}</h5>
                      <div className="flex items-center gap-3">
                         <div className="flex items-center gap-1 text-white/40">
                            <Eye size={10} />
                            <span className="text-[10px] font-bold">{post.views}</span>
                         </div>
                         <div className="flex items-center gap-1 text-white/40">
                            <Heart size={10} />
                            <span className="text-[10px] font-bold">{post.hearts}</span>
                         </div>
                      </div>
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-8 pt-6 border-t border-white/5">
              <div className="bg-primary/10 rounded-2xl p-4 border border-primary/20 flex items-center justify-between">
                 <div>
                    <p className="text-[10px] font-black text-primary uppercase">Prediction</p>
                    <p className="text-xs font-bold text-white/80 mt-1">Growth +15% by Friday</p>
                 </div>
                 <Sparkles className="text-primary fill-primary/20" size={20} />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function Sparkles(props: any) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}

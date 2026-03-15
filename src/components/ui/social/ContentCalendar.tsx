"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Video, Instagram, Youtube, Clock, CheckCircle2, MoreHorizontal } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ScheduledPost {
  id: string;
  title: string;
  platform: "tiktok" | "instagram" | "youtube";
  status: "scheduled" | "draft" | "posted";
  time: string;
  date: number; // Day of month
  thumbnail?: string;
}

const MOCK_POSTS: ScheduledPost[] = [
  { id: "p1", title: "Why your menu is losing money", platform: "tiktok", status: "scheduled", time: "18:00", date: 15, thumbnail: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2670&auto=format&fit=crop" },
  { id: "p2", title: "Secret Pasta Sauce Reveal", platform: "instagram", status: "scheduled", time: "12:30", date: 16, thumbnail: "https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=2574&auto=format&fit=crop" },
  { id: "p3", title: "Behind the Scenes: Kitchen Chaos", platform: "youtube", status: "posted", time: "09:00", date: 14, thumbnail: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=2670&auto=format&fit=crop" },
  { id: "p4", title: "Late Night Burger Hack", platform: "tiktok", status: "draft", time: "21:00", date: 18 },
];

export default function ContentCalendar() {
  const [currentDate] = useState(new Date());
  const [posts, setPosts] = useState<ScheduledPost[]>(MOCK_POSTS);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch real posts from Supabase
  React.useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch("/api/social/posts"); // Note: I might need to create this or use supabase directly
        const json = await response.json();
        if (json.success) {
          // Map DB rows to ScheduledPost shape
          const mapped: ScheduledPost[] = json.data.map((p: any) => ({
            id: p.id,
            title: p.caption,
            platform: p.platform,
            status: p.status,
            time: p.scheduled_at ? new Date(p.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "NOW",
            date: p.scheduled_at ? new Date(p.scheduled_at).getDate() : new Date(p.created_at).getDate(),
            thumbnail: p.videos?.video_url
          }));
          setPosts(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch calendar posts:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const daysInMonth = 31; // Simplified
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="glass rounded-3xl overflow-hidden border-white/5 flex flex-col h-full bg-white/[0.02]">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 glow-sm">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Content Calendar</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Manage Your Viral Queue</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex items-center gap-1 bg-white/5 rounded-lg p-1 border border-white/5">
              <button className="p-1.5 hover:bg-white/10 rounded-md transition-all text-muted-foreground">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-bold px-3">March 2026</span>
              <button className="p-1.5 hover:bg-white/10 rounded-md transition-all text-muted-foreground">
                <ChevronRight size={16} />
              </button>
           </div>
           
           <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:scale-[1.05] active:scale-95 transition-all glow-sm">
              <Plus size={14} /> NEW POST
           </button>
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
         <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-2xl overflow-hidden">
            {/* Weekdays */}
            {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(day => (
              <div key={day} className="bg-black/20 p-3 text-center text-[10px] font-black text-muted-foreground tracking-tighter">
                {day}
              </div>
            ))}
            
            {/* Day Slots */}
            {days.map(day => {
              const postsForDay = posts.filter(p => p.date === day);
              
              return (
                <div 
                  key={day} 
                  className={cn(
                    "min-h-[140px] bg-black/40 p-2 border border-white/5 hover:bg-white/[0.02] transition-colors",
                    day === 15 && "bg-primary/[0.03]" // Highlight today
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={cn(
                      "text-xs font-bold",
                      day === 15 ? "text-primary" : "text-muted-foreground/40"
                    )}>{day}</span>
                    <Plus size={12} className="text-muted-foreground/20 cursor-pointer hover:text-white transition-colors" />
                  </div>
                  
                  <div className="space-y-1.5">
                    {postsForDay.map(post => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={post.id}
                        className={cn(
                          "group relative p-2 rounded-xl border flex flex-col gap-1 cursor-pointer transition-all",
                          post.status === "posted" ? "bg-emerald-500/10 border-emerald-500/20" :
                          post.status === "draft" ? "bg-white/5 border-white/10 opacity-60" :
                          "bg-primary/10 border-primary/20 glow-xs"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {post.platform === "tiktok" && <div className="w-1.5 h-1.5 rounded-full bg-black border border-white/20" />}
                            {post.platform === "instagram" && <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-amber-500 to-pink-500" />}
                            {post.platform === "youtube" && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                          </div>
                          <span className="text-[8px] font-bold text-white/40">{post.time}</span>
                        </div>
                        
                        <p className="text-[10px] font-medium leading-tight line-clamp-2 text-white/80">
                          {post.title}
                        </p>

                        {post.thumbnail && (
                          <div className="mt-1 aspect-video rounded-md overflow-hidden bg-black/40 border border-white/5">
                            <img src={post.thumbnail} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" />
                          </div>
                        )}
                        
                        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal size={12} className="text-white/40" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
         </div>
      </div>

      {/* Footer / Stats */}
      <div className="p-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
         <div className="flex gap-6">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-primary glow-sm" />
               <span className="text-[10px] font-bold text-muted-foreground uppercase">Scheduled: 12</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500" />
               <span className="text-[10px] font-bold text-muted-foreground uppercase">Posted: 45</span>
            </div>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-white/20" />
               <span className="text-[10px] font-bold text-muted-foreground uppercase">Drafts: 3</span>
            </div>
         </div>
         
         <div className="flex items-center gap-2 text-[10px] font-bold text-primary">
            <Clock size={12} />
            NEXT POST IN 4H 20M
         </div>
      </div>
    </div>
  );
}

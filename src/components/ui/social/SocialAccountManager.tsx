"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Link as LinkIcon, Check, Plus, AlertCircle, Instagram, Youtube, Video, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  status: "connected" | "disconnected" | "pending";
  username?: string;
  followers?: string;
  color: string;
}

export default function SocialAccountManager() {
  const [platforms, setPlatforms] = useState<SocialPlatform[]>([
    { id: "tiktok", name: "TikTok", icon: <Video size={20} />, status: "disconnected", color: "bg-black" },
    { id: "instagram", name: "Instagram", icon: <Instagram size={20} />, status: "disconnected", color: "bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-500" },
    { id: "youtube", name: "YouTube", icon: <Youtube size={20} />, status: "disconnected", color: "bg-red-600" },
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState<string | null>(null);

  React.useEffect(() => {
    async function fetchPlatforms() {
      try {
        const res = await fetch("/api/social/platforms");
        const json = await res.json();
        if (json.success) {
          setPlatforms(prev => prev.map(p => {
            const remote = json.data.platforms.find((r: any) => r.platform === p.id);
            return {
              ...p,
              status: remote?.connected ? "connected" : "disconnected",
              username: remote?.username
            };
          }));
        }
      } catch (err) {
        console.error("Failed to fetch social platforms:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPlatforms();
  }, []);

  const handleConnect = (id: string) => {
    // In a real app, this would redirect to Ayrshare's Max Social Link or a custom OAuth flow.
    // For now, we simulate the handshake.
    toast.info(`Redirecting to ${id} authentication...`);
    setIsConnecting(id);
    setTimeout(() => {
      handleConnectMock(id);
    }, 2000);
  };

  const handleConnectMock = (id: string) => {
    setPlatforms(prev => prev.map(p => 
      p.id === id ? { ...p, status: "connected", username: "@verified_brand" } : p
    ));
    setIsConnecting(null);
    toast.success(`${id} connected successfully!`);
  };

  return (
    <div className="glass p-8 rounded-[2rem] border-white/5 bg-white/[0.01] space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Share2 className="text-primary" size={20} />
            Social Pilot
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Connect your platforms to enable automated posting.</p>
        </div>
        
        <div className="flex -space-x-2">
           {[1, 2, 3].map(i => (
             <div key={i} className="w-8 h-8 rounded-full border-2 border-[#121212] bg-white/5 flex items-center justify-center text-[10px] font-bold">
               {i}
             </div>
           ))}
           <div className="w-8 h-8 rounded-full border-2 border-[#121212] bg-primary flex items-center justify-center text-white">
             <Plus size={14} />
           </div>
        </div>
      </div>

      <div className="space-y-4">
        {platforms.map((platform) => (
          <div 
            key={platform.id}
            className="group relative glass p-5 rounded-2xl border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
               <div className={cn(
                 "w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-xl",
                 platform.color
               )}>
                  {platform.icon}
               </div>
               <div>
                  <h4 className="font-bold text-sm">{platform.name}</h4>
                  {platform.status === "connected" ? (
                    <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-0.5">
                       <Check size={10} strokeWidth={3} />
                       Linked as {platform.username}
                    </p>
                  ) : platform.status === "pending" ? (
                    <p className="text-[10px] text-amber-500 font-bold animate-pulse mt-0.5">
                       Verifying Account...
                    </p>
                  ) : (
                    <p className="text-[10px] text-muted-foreground mt-0.5">Not linked</p>
                  )}
               </div>
            </div>

            <div className="flex items-center gap-4">
               {platform.status === "connected" && (
                 <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Followers</p>
                    <p className="text-xs font-bold">{platform.followers || "N/A"}</p>
                 </div>
               )}
               
               <button 
                 onClick={() => platform.status === "disconnected" && handleConnect(platform.id)}
                 disabled={platform.status !== "disconnected" || isConnecting === platform.id}
                 className={cn(
                   "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                   platform.status === "connected" ? "bg-white/5 text-muted-foreground/50 border border-white/5" :
                   platform.status === "pending" ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                   "bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.05] active:scale-95"
                 )}
               >
                 {isConnecting === platform.id ? "Connecting..." : 
                  platform.status === "connected" ? "Account Active" : 
                  "Connect Link"}
               </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex gap-4">
         <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
            <AlertCircle size={20} />
         </div>
         <div>
            <h5 className="text-xs font-bold text-primary">Ayrshare Connection</h5>
            <p className="text-[10px] text-primary/60 mt-1 leading-relaxed">
              We use Ayrshare to securely manage your social postings. None of your passwords are saved on our servers.
            </p>
         </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Check, Play, Filter } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Actor {
  id: string;
  name: string;
  style: string;
  tags: string[];
  thumbnail: string;
  energy: "High" | "Calm" | "Professional";
  heygen_avatar_id: string;
  default_voice_id: string;
}

export interface ActorSelection {
  avatarId: string;
  voiceId: string;
}

const MOCK_ACTORS: Actor[] = [
  {
    id: "a1",
    name: "Jordan",
    style: "Lifestyle / UGC",
    tags: ["Energetic", "Fast-paced", "Relatable"],
    thumbnail: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=2662&auto=format&fit=crop",
    energy: "High",
    heygen_avatar_id: "abc6fd65312c4cd2b6e4432e35907b3a",
    default_voice_id: "dfe9d7b19b0342a0a5f475ec35240948",
  },
  {
    id: "a2",
    name: "Elena",
    style: "Corporate / Tech",
    tags: ["Clean", "Professional", "Trustworthy"],
    thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2576&auto=format&fit=crop",
    energy: "Professional",
    heygen_avatar_id: "c5cf8995a21f4f828e5be429177b986e",
    default_voice_id: "6c417ccc9d63481ab08699c325d7dccd",
  },
  {
    id: "a3",
    name: "Marcus",
    style: "Fitness / Motivation",
    tags: ["Authoritative", "Bold", "Direct"],
    thumbnail: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=2574&auto=format&fit=crop",
    energy: "High",
    heygen_avatar_id: "bd3a37b07456488e87757da1f9f0673d",
    default_voice_id: "c65bd88dd28f4ae2b6cb6d8676a41c03",
  },
  {
    id: "a4",
    name: "Sarah",
    style: "Soft / Natural",
    tags: ["Gentle", "Storyteller", "Warm"],
    thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2574&auto=format&fit=crop",
    energy: "Calm",
    heygen_avatar_id: "1727071993",
    default_voice_id: "a3c2199a45074765a2aaef907f2b0b30",
  }
];

export default function ActorGallery({ onSelect }: { onSelect?: (selection: ActorSelection) => void }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleSelect = (actor: Actor) => {
    setSelectedId(actor.id);
    onSelect?.({ avatarId: actor.heygen_avatar_id, voiceId: actor.default_voice_id });
  };

  return (
    <div className="glass p-6 rounded-3xl border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <User className="text-primary" size={18} />
            Cast Your Hero
          </h3>
          <p className="text-xs text-muted-foreground mt-1">Select the AI Digital Twin to represent your brand.</p>
        </div>

        <div className="flex gap-2">
          <button className="p-2 hover:bg-white/5 rounded-lg border border-white/5 transition-all text-muted-foreground">
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_ACTORS.map((actor) => (
          <motion.div
            key={actor.id}
            onClick={() => handleSelect(actor)}
            onMouseEnter={() => setHoveredId(actor.id)}
            onMouseLeave={() => setHoveredId(null)}
            className={cn(
              "group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 border-2",
              selectedId === actor.id
                ? "border-primary shadow-2xl shadow-primary/20 scale-[0.98]"
                : "border-transparent hover:border-white/10"
            )}
          >
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent z-10" />

            {/* Background Image */}
            <img
              src={actor.thumbnail}
              alt={actor.name}
              className={cn(
                "absolute inset-0 w-full h-full object-cover transition-transform duration-700",
                hoveredId === actor.id ? "scale-110" : "scale-105"
              )}
            />

            {/* Selection Status */}
            <AnimatePresence>
              {selectedId === actor.id && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white glow-sm shadow-xl"
                >
                  <Check size={16} strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hover Play Button */}
            <AnimatePresence>
              {hoveredId === actor.id && selectedId !== actor.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute inset-0 z-20 flex items-center justify-center"
                >
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
                    <Play size={20} fill="currentColor" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Info Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-4 z-20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-white">{actor.name}</span>
                <span className={cn(
                  "text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border",
                  actor.energy === "High" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                    actor.energy === "Professional" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                      "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                )}>
                  {actor.energy}
                </span>
              </div>
              <p className="text-[10px] text-white/60 font-medium truncate">{actor.style}</p>

              <div className="flex flex-wrap gap-1 mt-2">
                {actor.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="text-[8px] text-white/40 border border-white/10 px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

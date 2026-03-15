"use client";

import React, { useState, useRef, useEffect } from "react";
import { useReactMediaRecorder } from "react-media-recorder-2";
import { Mic, Square, Trash2, Play, Pause, ChevronRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import WaveSurfer from "wavesurfer.js";

interface VoiceMemoRecorderProps {
  /** UUID of the business this memo belongs to. Required to enable upload. */
  businessId?: string;
  onComplete?: (result: { id: string; transcript: string; extracted_intent: string }) => void;
}

export default function VoiceMemoRecorder({ businessId, onComplete }: VoiceMemoRecorderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    clearBlobUrl,
  } = useReactMediaRecorder({ audio: true });

  useEffect(() => {
    if (mediaBlobUrl && waveformRef.current) {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }

      wavesurfer.current = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: "#4f46e5",
        progressColor: "#818cf8",
        cursorColor: "#6366f1",
        barWidth: 2,
        barRadius: 3,
        height: 60,
        normalize: true,
      });

      wavesurfer.current.load(mediaBlobUrl);
      wavesurfer.current.on("play", () => setIsPlaying(true));
      wavesurfer.current.on("pause", () => setIsPlaying(false));
      wavesurfer.current.on("finish", () => setIsPlaying(false));
    }

    return () => {
      if (wavesurfer.current) {
        wavesurfer.current.destroy();
      }
    };
  }, [mediaBlobUrl]);

  const togglePlay = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause();
    }
  };

  const handleUpload = async () => {
    if (!mediaBlobUrl) return;
    if (!businessId) {
      setError('No business selected. Please complete brand setup first.');
      return;
    }
    setIsProcessing(true);
    setError(null);

    try {
      // Fetch the blob URL to get the actual audio file
      const audioBlob = await fetch(mediaBlobUrl).then(r => r.blob());
      const audioFile = new File([audioBlob], 'voice-memo.webm', { type: audioBlob.type || 'audio/webm' });

      const form = new FormData();
      form.append('audio', audioFile);
      form.append('business_id', businessId);

      const res = await fetch('/api/voice-memo', { method: 'POST', body: form });
      const json = await res.json();

      if (!res.ok) throw new Error(json.error ?? 'Upload failed');

      onComplete?.(json.data);
      clearBlobUrl();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass p-6 rounded-2xl relative overflow-hidden group">
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 blur-3xl -z-10 group-hover:bg-purple-500/20 transition-all duration-700" />
      
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gradient">Voice Memo</h3>
          <p className="text-xs text-muted-foreground mt-1">Record your marketing nuance.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            status === "recording" ? "bg-red-500 animate-pulse" : "bg-white/10"
          )} />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {status}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center space-y-6">
        <AnimatePresence mode="wait">
          {!mediaBlobUrl ? (
            <motion.button
              key="record"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={status === "recording" ? stopRecording : startRecording}
              className={cn(
                "w-20 h-20 rounded-full flex items-center justify-center transition-all glow",
                status === "recording" 
                  ? "bg-red-500/20 border-2 border-red-500 text-red-500" 
                  : "bg-primary text-white"
              )}
            >
              {status === "recording" ? <Square size={32} /> : <Mic size={32} />}
            </motion.button>
          ) : (
            <motion.div
              key="preview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-4"
            >
              <div 
                ref={waveformRef} 
                className="w-full bg-white/5 rounded-xl p-4 min-h-[60px]"
              />
              
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all"
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                
                <button
                  onClick={handleUpload}
                  disabled={isProcessing}
                  className="flex-1 bg-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all text-sm disabled:opacity-50"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Analyze Nuance <ChevronRight size={16} /></>
                  )}
                </button>

                <button
                  onClick={clearBlobUrl}
                  className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!mediaBlobUrl && (
          <p className="text-[10px] text-muted-foreground text-center max-w-[200px]">
            {status === "recording"
              ? "Recording... Tap to stop"
              : "Tap to record your brand story, specific slang, or campaign ideas."}
          </p>
        )}

        {error && (
          <p className="text-[10px] text-red-400 text-center max-w-[240px]">{error}</p>
        )}
      </div>
    </div>
  );
}

// Utility function for conditional classes
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

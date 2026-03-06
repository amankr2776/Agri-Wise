
'use client';

import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  FlaskConical, 
  X, 
  BellRing,
  ArrowRight,
  Volume2
} from "lucide-react";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function NotificationBar() {
  const { activeAlert, setActiveAlert } = useAppState();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (activeAlert) {
      // Play 'Ping' sound for farmer attention
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }

      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setActiveAlert(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [activeAlert, setActiveAlert]);

  return (
    <>
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3" preload="auto" />
      
      <AnimatePresence>
        {activeAlert && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] p-4 flex justify-center pointer-events-none"
          >
            <div className={cn(
              "max-w-2xl w-full pointer-events-auto shadow-2xl rounded-[2rem] border-b-4 overflow-hidden flex items-center gap-6 p-6 backdrop-blur-xl",
              activeAlert.type === 'update' 
                ? "bg-green-600/95 border-green-700 text-white" 
                : "bg-blue-600/95 border-blue-700 text-white"
            )}>
              <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center shrink-0 animate-pulse">
                {activeAlert.type === 'update' ? (
                  <ShieldCheck className="h-8 w-8 text-white" />
                ) : (
                  <FlaskConical className="h-8 w-8 text-white" />
                )}
              </div>

              <div className="flex-1 space-y-1">
                <h4 className="text-lg font-black tracking-tight flex items-center gap-2">
                  <BellRing className="h-4 w-4" />
                  {activeAlert.title}
                </h4>
                <p className="text-sm font-bold text-white/90 leading-snug">
                  {activeAlert.message}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="rounded-xl h-10 px-4 font-black bg-white/10 hover:bg-white/20 text-white gap-2"
                  onClick={() => setActiveAlert(null)}
                >
                  View Details <ArrowRight className="h-4 w-4" />
                </Button>
                <button 
                  onClick={() => setActiveAlert(null)}
                  className="h-10 w-10 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

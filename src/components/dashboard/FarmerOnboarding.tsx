
'use client';

import React, { useState, useRef, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  TrendingUp, 
  Truck, 
  Megaphone,
  Volume2,
  CheckCircle2,
  Sparkles,
  X,
  Play
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function FarmerOnboarding() {
  const { t } = useTranslation();
  const { langCode, language } = useAppState();
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  const playAudio = async (text: string) => {
    if (isSpeaking) return;
    setIsSpeaking(true);
    try {
      const response = await fetch('/api/bhashini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, langCode })
      });
      const data = await response.json();
      if (data.audioContent && audioRef.current) {
        audioRef.current.src = `data:audio/wav;base64,${data.audioContent}`;
        audioRef.current.onended = () => setIsSpeaking(false);
        await audioRef.current.play();
      } else {
        // Fallback to browser TTS if Bhashini is busy
        const ut = new SpeechSynthesisUtterance(text);
        ut.lang = langCode === 'hi' ? 'hi-IN' : 'en-IN';
        ut.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(ut);
      }
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  const onboardingSteps = [
    {
      id: "disease",
      title: t("step_disease_title"),
      desc: t("step_disease_desc"),
      icon: Search,
      color: "text-green-600",
      bg: "bg-green-50",
      accent: "bg-green-600",
      border: "border-green-200"
    },
    {
      id: "market",
      title: t("step_market_title"),
      desc: t("step_market_desc"),
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50",
      accent: "bg-blue-600",
      border: "border-blue-200"
    },
    {
      id: "mandi",
      title: t("step_mandi_title"),
      desc: t("step_mandi_desc"),
      icon: Truck,
      color: "text-amber-600",
      bg: "bg-amber-50",
      accent: "bg-amber-600",
      border: "border-amber-200"
    },
    {
      id: "community",
      title: t("step_community_title"),
      desc: t("step_community_desc"),
      icon: Megaphone,
      color: "text-red-600",
      bg: "bg-red-50",
      accent: "bg-red-600",
      border: "border-red-200"
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          className="rounded-[2rem] h-16 px-10 font-black text-xl gap-3 bg-slate-900 text-white shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 group"
        >
          <BookOpen className="h-7 w-7 text-primary group-hover:rotate-12 transition-transform" />
          {t("rulebook_title")}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[3rem] sm:max-w-3xl p-0 border-none shadow-2xl overflow-hidden bg-white">
        <div className="bg-slate-900 p-8 md:p-12 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="h-32 w-32 rotate-12" />
          </div>
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-14 w-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg">
                <BookOpen className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-4xl font-black tracking-tight">{t("rulebook_title")}</DialogTitle>
                <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-xs">{t("rulebook_desc")}</DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <p className="text-sm font-black text-primary uppercase tracking-wider">{t("onboarding_expert_verified")}</p>
            </div>
          </DialogHeader>
        </div>

        <div className="p-8 md:p-12 space-y-6 bg-muted/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {onboardingSteps.map((step) => (
              <Card 
                key={step.id} 
                className={cn(
                  "border-4 transition-all duration-300 rounded-[2.5rem] overflow-hidden group cursor-default",
                  step.border,
                  step.bg
                )}
              >
                <CardContent className="p-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className={cn("h-16 w-16 rounded-3xl flex items-center justify-center shadow-xl bg-white", step.color)}>
                      <step.icon className="h-9 w-9" />
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost"
                      onClick={() => playAudio(`${step.title}. ${step.desc}`)}
                      className={cn(
                        "h-12 w-12 rounded-full transition-all bg-white shadow-sm border",
                        isSpeaking ? "animate-pulse border-primary text-primary" : "hover:bg-primary hover:text-white"
                      )}
                    >
                      <Volume2 className="h-6 w-6" />
                    </Button>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className={cn("text-2xl font-black tracking-tight", step.color)}>{step.title}</h3>
                    <p className="text-lg font-bold text-slate-700 leading-tight italic">
                      "{step.desc}"
                    </p>
                  </div>

                  <div className={cn("h-1.5 w-full rounded-full bg-white/50 overflow-hidden")}>
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className={cn("h-full", step.accent)} 
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="p-8 bg-white border-t flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-slate-400">
            <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.2em]">National Agricultural Intelligence Grid v4.2</p>
          </div>
          <Button onClick={() => document.querySelector('[data-radix-collection-item]')?.dispatchEvent(new MouseEvent('click', {bubbles:true}))} className="w-full max-w-sm h-14 rounded-2xl font-black text-lg">
            I Understand the Protocol
          </Button>
        </div>
      </DialogContent>
      <audio ref={audioRef} className="hidden" aria-hidden="true" />
    </Dialog>
  );
}

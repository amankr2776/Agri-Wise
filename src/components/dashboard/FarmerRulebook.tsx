
'use client';

import React from "react";
import { 
  BookOpen, 
  Camera, 
  TrendingUp, 
  ShieldAlert, 
  PhoneCall, 
  ChevronRight,
  Sparkles
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription 
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";

export function FarmerRulebook() {
  const { t } = useTranslation();

  const rules = [
    {
      id: "diagnose",
      title: t("how_to_diagnose"),
      step: t("how_to_diagnose_step"),
      icon: Camera,
      color: "text-blue-500",
      bg: "bg-blue-50"
    },
    {
      id: "market",
      title: t("market_watch"),
      step: t("market_watch_step"),
      icon: TrendingUp,
      color: "text-green-500",
      bg: "bg-green-50"
    },
    {
      id: "safety",
      title: t("community_safety"),
      step: t("community_safety_step"),
      icon: ShieldAlert,
      color: "text-amber-500",
      bg: "bg-amber-50"
    },
    {
      id: "emergency",
      title: t("emergency"),
      step: t("emergency_step"),
      icon: PhoneCall,
      color: "text-destructive",
      bg: "bg-destructive/5"
    }
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          className="rounded-[2rem] h-16 px-10 font-black text-lg gap-3 bg-slate-900 text-white shadow-2xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 group"
        >
          <BookOpen className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform" />
          {t("rulebook_title")}
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-[3rem] sm:max-w-xl p-10 border-none shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5">
          <BookOpen className="h-48 w-48 rotate-12" />
        </div>
        <DialogHeader className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black tracking-tight">{t("rulebook_title")}</DialogTitle>
              <DialogDescription className="text-slate-500 font-medium italic">{t("rulebook_desc")}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-8 relative z-10">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {rules.map((rule) => (
              <AccordionItem key={rule.id} value={rule.id} className="border-none">
                <AccordionTrigger className={cn(
                  "p-6 rounded-3xl hover:no-underline transition-all group",
                  rule.bg
                )}>
                  <div className="flex items-center gap-6 text-left">
                    <div className={cn("h-14 w-14 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform", rule.color)}>
                      <rule.icon className="h-8 w-8" />
                    </div>
                    <span className="text-xl font-black tracking-tight text-slate-900">{rule.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="p-8 pt-2">
                  <div className="pl-20">
                    <p className="text-lg font-medium text-slate-600 leading-relaxed italic border-l-4 border-primary/20 pl-6">
                      "{rule.step}"
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-10 pt-8 border-t flex items-center justify-center gap-2 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">
          <ShieldAlert className="h-3 w-3" /> Official Grid Protocol v2.1
        </div>
      </DialogContent>
    </Dialog>
  );
}

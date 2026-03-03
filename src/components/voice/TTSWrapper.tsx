'use client';

import React from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppState } from "@/lib/app-state";

interface TTSWrapperProps {
  text: string;
  children: React.ReactNode;
}

const LANG_MAP: Record<string, string> = {
  "English": "en-IN",
  "Hindi": "hi-IN",
  "Punjabi": "pa-IN",
  "Bengali": "bn-IN",
};

export function TTSWrapper({ text, children }: TTSWrapperProps) {
  const { language } = useAppState();

  const speak = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = LANG_MAP[language] || "en-IN";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="relative group inline-block w-full">
      {children}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-accent text-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
        onClick={(e) => {
          e.stopPropagation();
          speak();
        }}
        title={`Read aloud in ${language}`}
      >
        <Volume2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

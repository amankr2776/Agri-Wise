
"use client";

import React from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TTSWrapperProps {
  text: string;
  children: React.ReactNode;
}

export function TTSWrapper({ text, children }: TTSWrapperProps) {
  const speak = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="relative group">
      {children}
      <Button
        variant="ghost"
        size="icon"
        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-accent text-accent-foreground opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          speak();
        }}
        title="Read aloud"
      >
        <Volume2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

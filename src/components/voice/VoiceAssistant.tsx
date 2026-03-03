'use client';

import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Send, User, Bot, Loader2, Volume2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { voiceAssistantGuidance } from "@/ai/flows/voice-assistant-guidance";
import { useAppState } from "@/lib/app-state";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "bot";
  text: string;
  audioUri?: string;
}

const LANG_MAP: Record<string, string> = {
  "English": "en-IN",
  "Hindi": "hi-IN",
  "Punjabi": "pa-IN",
  "Bengali": "bn-IN",
};

export function VoiceAssistant() {
  const { language } = useAppState();
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Namaste! I am your AgriWise assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (queryText?: string) => {
    const query = queryText || input;
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await voiceAssistantGuidance({ 
        query, 
        language 
      });
      
      setMessages((prev) => [...prev, { 
        role: "bot", 
        text: response.text, 
        audioUri: response.audioDataUri 
      }]);
      
      if (response.audioDataUri && audioRef.current) {
        audioRef.current.src = response.audioDataUri;
        audioRef.current.play();
      }
    } catch (error) {
      setMessages((prev) => [...prev, { 
        role: "bot", 
        text: "Sorry, I encountered an error. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    const recognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (!recognitionClass) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new recognitionClass();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = LANG_MAP[language] || "en-IN";

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const playAudio = (uri: string) => {
    if (audioRef.current) {
      audioRef.current.src = uri;
      audioRef.current.play();
    }
  };

  return (
    <Card className="w-full shadow-2xl border-primary/20 flex flex-col h-[500px] overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground p-4 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5" />
          AgriWise Assistant
        </CardTitle>
        <div className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
          {language}
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden relative bg-muted/5">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4 pb-4">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex w-full", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] p-3 rounded-2xl shadow-sm relative group",
                  m.role === "user" 
                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                    : "bg-white border border-border rounded-tl-none"
                )}>
                  <div className="flex items-start gap-2">
                    {m.role === "bot" && <Bot className="h-4 w-4 mt-1 text-primary shrink-0" />}
                    <div className="space-y-2">
                      <p className="text-sm leading-relaxed">{m.text}</p>
                      {m.audioUri && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-[10px] gap-1 px-2 bg-muted hover:bg-muted/80"
                          onClick={() => playAudio(m.audioUri!)}
                        >
                          <Volume2 className="h-3 w-3" /> Replay Audio
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-border p-3 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground italic">Thinking in {language}...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t gap-2 bg-white">
        <Button
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          onClick={toggleListening}
          className={cn("rounded-full h-10 w-10 shrink-0", isListening && "animate-pulse")}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        <Input
          placeholder={`Ask in ${language}...`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          className="rounded-full bg-muted/30 border-none focus-visible:ring-primary"
        />
        <Button 
          size="icon" 
          onClick={() => handleSend()} 
          disabled={isLoading || !input.trim()}
          className="rounded-full h-10 w-10 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
        <audio ref={audioRef} className="hidden" />
      </CardFooter>
    </Card>
  );
}

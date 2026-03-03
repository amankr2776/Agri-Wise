
"use client";

import React, { useState, useRef } from "react";
import { Mic, MicOff, Send, Volume2, User, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { voiceAssistantGuidance } from "@/ai/flows/voice-assistant-guidance";

interface Message {
  role: "user" | "bot";
  text: string;
}

export function VoiceAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Namaste! I am your AgriWise assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSend = async (queryText?: string) => {
    const query = queryText || input;
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: query }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await voiceAssistantGuidance({ query });
      
      // In a real app, the flow would provide text too, but our flow returns audio URI
      // Let's assume the flow handled the verbal delivery
      setMessages((prev) => [...prev, { role: "bot", text: "Verbal response delivered." }]);
      
      if (response.audioDataUri) {
        if (audioRef.current) {
          audioRef.current.src = response.audioDataUri;
          audioRef.current.play();
        }
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "bot", text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN"; // Defaulting but could be dynamic

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
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

  return (
    <Card className="w-full max-w-md shadow-lg border-primary/20">
      <CardHeader className="bg-primary text-primary-foreground rounded-t-lg">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5" />
          Kisan Voice Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-3 rounded-lg flex items-start gap-2 ${m.role === "user" ? "bg-accent text-accent-foreground" : "bg-muted"}`}>
                  {m.role === "bot" ? <Bot className="h-4 w-4 mt-1" /> : <User className="h-4 w-4 mt-1" />}
                  <span className="text-sm">{m.text}</span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="p-4 border-t gap-2">
        <Button
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          onClick={toggleListening}
          className="rounded-full"
        >
          {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>
        <Input
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <Button size="icon" onClick={() => handleSend()} disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
        <audio ref={audioRef} className="hidden" />
      </CardFooter>
    </Card>
  );
}


'use client';

import React, { useState, useRef, useEffect } from "react";
import { 
  Mic, 
  MicOff, 
  Send, 
  Camera, 
  Loader2, 
  Bot, 
  User, 
  X, 
  ImageIcon, 
  Zap,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { analyzeFarmData } from "@/ai/flows/farm-analysis-flow";
import { useAppState } from "@/lib/app-state";
import { useFirestore, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "bot";
  text: string;
  image?: string | null;
  suggestedAction?: string;
}

export function AIAssistant() {
  const { language, name: userName } = useAppState();
  const { user } = useUser();
  const firestore = useFirestore();
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: `Namaste ${userName}! I am your specialized Farm Assistant. How can I help you today?` }
  ]);
  const [input, setInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAiLoading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const toggleListening = () => {
    const recognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!recognitionClass) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new recognitionClass();
    recognition.lang = language === 'Hindi' ? 'hi-IN' : 'en-IN';
    
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    if (isListening) recognition.stop();
    else recognition.start();
  };

  const handleSend = async () => {
    if (!input.trim() && !previewImage) return;

    const userPrompt = input;
    const userImage = previewImage;
    
    // Optimistic Update
    setMessages(prev => [...prev, { role: "user", text: userPrompt, image: userImage }]);
    setInput("");
    setPreviewImage(null);
    setIsAiLoading(true);

    try {
      const response = await analyzeFarmData({
        prompt: userPrompt || "Analyze this context.",
        photoDataUri: userImage || undefined,
        language
      });

      const botMessage: ChatMessage = {
        role: "bot",
        text: response.answer,
        suggestedAction: response.suggestedAction
      };

      setMessages(prev => [...prev, botMessage]);

      // Persist to Firestore History
      if (user && firestore) {
        addDocumentNonBlocking(collection(firestore, "users", user.uid, "conversations"), {
          userId: user.uid,
          prompt: userPrompt,
          answer: response.answer,
          suggestedAction: response.suggestedAction,
          imageUrl: userImage,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: "bot", text: "I encountered an error connecting to the National Grid. Please try again." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-[650px] border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
      <CardHeader className="bg-slate-900 text-white p-6 md:p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-primary/20 rounded-2xl flex items-center justify-center">
              <Bot className="h-7 w-7 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl font-black tracking-tight">Kisan Assistant</CardTitle>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">National Grid Active</p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="border-white/10 text-slate-400 font-bold text-[9px] uppercase">{language} Node</Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 relative bg-muted/5">
        <ScrollArea className="h-full p-6 md:p-8">
          <div className="space-y-8">
            <AnimatePresence mode="popLayout">
              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn("flex w-full", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div className={cn(
                    "max-w-[85%] p-5 rounded-[1.8rem] shadow-sm relative",
                    m.role === "user" 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-white border border-border/50 rounded-tl-none"
                  )}>
                    <div className="space-y-4">
                      {m.image && (
                        <div className="rounded-xl overflow-hidden shadow-md border-2 border-white/20">
                          <img src={m.image} alt="Farm Context" className="w-full h-auto" />
                        </div>
                      )}
                      <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                      
                      {m.suggestedAction && (
                        <div className="pt-4 border-t border-slate-100 mt-2">
                          <p className="text-[9px] font-black uppercase text-primary tracking-widest mb-2 flex items-center gap-1">
                            <Zap className="h-3 w-3" /> Recommended Action
                          </p>
                          <div className="bg-primary/5 p-3 rounded-xl flex items-center justify-between group cursor-pointer hover:bg-primary/10 transition-colors">
                            <span className="text-xs font-bold text-slate-900">{m.suggestedAction}</span>
                            <ChevronRight className="h-4 w-4 text-primary opacity-40 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="bg-white border p-5 rounded-[1.8rem] rounded-tl-none flex items-center gap-3 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-xs text-muted-foreground font-bold italic">Consulting Senior Agronomist...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-6 md:p-8 bg-white border-t border-border/50 flex flex-col gap-4">
        {previewImage && (
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary shadow-xl animate-in zoom-in-95">
            <img src={previewImage} className="w-full h-full object-cover" alt="Preview" />
            <button 
              onClick={() => setPreviewImage(null)}
              className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 shadow-lg"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
        
        <div className="flex items-center gap-3 w-full">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleImageUpload} 
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-12 w-12 rounded-2xl bg-muted/50 hover:bg-primary/10 hover:text-primary shrink-0 transition-all"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-6 w-6" />
          </Button>
          
          <div className="relative flex-1">
            <Input 
              placeholder={`Ask in ${language}...`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              className="rounded-2xl h-12 bg-muted/30 border-none font-medium pr-12 focus-visible:ring-primary shadow-inner"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleListening}
              className={cn(
                "absolute right-1 top-1 h-10 w-10 rounded-xl transition-all",
                isListening ? "text-destructive animate-pulse" : "text-muted-foreground hover:text-primary"
              )}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
          </div>

          <Button 
            onClick={handleSend}
            disabled={isAiLoading || (!input.trim() && !previewImage)}
            className="h-12 w-12 rounded-2xl shadow-lg shadow-primary/20 shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center justify-between px-2">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" /> Powered by Gemini 2.5 Flash
          </p>
          <span className="text-[8px] font-bold text-muted-foreground">Regional Neural Engine Ready</span>
        </div>
      </CardFooter>
    </Card>
  );
}

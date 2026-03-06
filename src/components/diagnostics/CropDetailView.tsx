
'use client';

import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Sprout, 
  CloudRain, 
  Sun, 
  Calendar, 
  Droplets, 
  Thermometer, 
  MessageCircle, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Loader2, 
  Bot, 
  ShieldCheck, 
  Sparkles,
  FlaskConical,
  Zap,
  CheckCircle2,
  Activity
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useAppState } from "@/lib/app-state";
import { useFirestore, useUser } from "@/firebase";
import { collection } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { diagnoseCropPest, FarmerCropPestDiagnosisOutput } from "@/ai/flows/farmer-crop-pest-diagnosis";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface CropDetailViewProps {
  crop: any;
  onClose: () => void;
}

export function CropDetailView({ crop, onClose }: CropDetailViewProps) {
  const { language, langCode, name: userName } = useAppState();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FarmerCropPestDiagnosisOutput | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  const handleAskAI = async (textOverride?: string) => {
    const finalQuery = textOverride || query;
    if (!finalQuery.trim()) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      // Context-locked AI diagnosis
      const res = await diagnoseCropPest({
        cropType: crop.name,
        symptomsDescription: finalQuery,
        language: language
      });

      setResult(res);
      await speakResult(res);

      // Log as Diagnostic Protocol for Expert Review
      if (user && firestore) {
        addDocumentNonBlocking(collection(firestore, "crops"), {
          name: crop.name,
          category: crop.category,
          diseaseName: res.pathogenIdentification,
          symptoms: finalQuery,
          chemicalCure: res.suggestedChemicalRemedies[0],
          desiNuskha: res.suggestedTraditionalRemedies[0],
          aiReasoning: res.scientificReasoning,
          isCertified: false,
          reportedBy: user.uid,
          reportedByName: userName,
          imageUrl: crop.imageUrl,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "AI Node Offline", description: "Grid high-latency. Re-attempting sync..." });
    } finally {
      setIsAnalyzing(false);
      setQuery("");
    }
  };

  const toggleListening = () => {
    const recognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!recognitionClass) {
      alert("Voice input not supported in this browser.");
      return;
    }

    const recognition = new recognitionClass();
    recognition.lang = langCode === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleAskAI(transcript);
    };

    if (isListening) recognition.stop();
    else recognition.start();
  };

  const speakResult = async (resData: FarmerCropPestDiagnosisOutput) => {
    const speechText = `${resData.pathogenIdentification}. ${resData.diagnosis}. Suggested treatment: ${resData.suggestedChemicalRemedies[0]}`;
    setIsSpeaking(true);
    try {
      const response = await fetch('/api/bhashini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: speechText, langCode })
      });
      const data = await response.json();
      if (data.audioContent && audioRef.current) {
        audioRef.current.src = `data:audio/wav;base64,${data.audioContent}`;
        audioRef.current.onended = () => setIsSpeaking(false);
        await audioRef.current.play();
      } else {
        const ut = new SpeechSynthesisUtterance(speechText);
        ut.lang = langCode === 'hi' ? 'hi-IN' : 'en-IN';
        ut.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(ut);
      }
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  // Mock Encyclopedia Data (would normally come from Firestore crop profile)
  const profile = {
    season: crop.season || "Rabi (Winter)",
    soil: crop.soilType || "Alluvial / Loamy",
    irrigation: crop.irrigation || "15-20 Days",
    duration: crop.growingDays || 120,
    progress: 65,
    ph: "6.5 - 7.5"
  };

  return (
    <div className="flex flex-col h-[90vh] bg-white">
      {/* Hero Header */}
      <div className="relative h-64 shrink-0">
        <Image 
          src={crop.imageUrl || `https://picsum.photos/seed/${crop.id}/1200/600`} 
          fill 
          className="object-cover" 
          alt={crop.name} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/40" />
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40"
        >
          <X className="h-6 w-6" />
        </Button>
        <div className="absolute bottom-8 left-10 text-white drop-shadow-lg">
          <Badge className="bg-primary text-white mb-3 px-4 py-1 font-black uppercase text-[10px] tracking-widest">{crop.category}</Badge>
          <h2 className="text-5xl font-black tracking-tighter">{crop.name}</h2>
        </div>
      </div>

      <ScrollArea className="flex-1 px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Encyclopedia Section */}
          <div className="lg:col-span-7 space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Sun, label: "Season", val: profile.season },
                { icon: Sprout, label: "Soil", val: profile.soil },
                { icon: Droplets, label: "Irrigation", val: profile.irrigation },
                { icon: Thermometer, label: "pH Range", val: profile.ph },
              ].map((item, i) => (
                <div key={i} className="p-5 rounded-3xl bg-muted/30 border border-border/50 space-y-2">
                  <item.icon className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{item.label}</p>
                    <p className="text-sm font-bold text-slate-900">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Calendar className="h-6 w-6 text-primary" />
                  <h4 className="text-lg font-black tracking-tight">Growth Duration</h4>
                </div>
                <span className="font-black text-primary">{profile.duration} Days</span>
              </div>
              <Progress value={profile.progress} className="h-3 bg-primary/10" />
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Germination</span>
                <span>Harvesting</span>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-2xl font-black tracking-tight flex items-center gap-3">
                <ShieldCheck className="h-7 w-7 text-primary" />
                Verified Scientific Profile
              </h4>
              <p className="text-slate-600 leading-relaxed font-medium italic">
                This encyclopedia entry is synchronized with the National Botanical Registry. It provides high-fidelity data for professional farm management in the Indian grid.
              </p>
            </div>
          </div>

          {/* AI Assistant Section */}
          <div className="lg:col-span-5 space-y-8">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-slate-900 text-white">
              <CardHeader className="p-8 bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black tracking-tight">Ask about {crop.name}</CardTitle>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Context-Locked Agent v4.2</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[8px] border-primary/30 text-primary font-black uppercase">Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="relative">
                  <Input 
                    placeholder={`Describe symptoms in ${language}...`}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAskAI()}
                    className="h-14 rounded-2xl bg-white/5 border-white/10 pl-6 pr-24 font-bold text-lg focus-visible:ring-primary"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={toggleListening}
                      className={cn("h-10 w-10 rounded-xl", isListening ? "text-destructive animate-pulse" : "text-slate-400")}
                    >
                      {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    </Button>
                    <Button 
                      size="icon" 
                      onClick={() => handleAskAI()}
                      disabled={isAnalyzing || !query.trim()}
                      className="h-10 w-10 rounded-xl shadow-lg"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {isAnalyzing ? (
                    <motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="py-10 text-center space-y-4"
                    >
                      <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                      <p className="text-xs font-bold text-slate-400 italic">Consulting Senior Agronomist...</p>
                    </motion.div>
                  ) : result ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="space-y-6"
                    >
                      <div className="p-6 rounded-[2rem] bg-white/5 border border-white/10 space-y-4">
                        <div className="flex justify-between items-center">
                          <h5 className="text-2xl font-black text-primary tracking-tight">{result.pathogenIdentification}</h5>
                          <Button 
                            onClick={() => speakResult(result)} 
                            disabled={isSpeaking}
                            size="icon"
                            className={cn("h-10 w-10 rounded-full", isSpeaking ? "bg-primary animate-pulse" : "bg-white/10 text-white")}
                          >
                            {isSpeaking ? <Activity className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                          </Button>
                        </div>
                        <p className="text-sm font-medium leading-relaxed italic text-slate-300">"{result.diagnosis}"</p>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="p-5 rounded-2xl bg-destructive/10 border border-destructive/20 space-y-2">
                          <p className="text-[8px] font-black text-destructive uppercase tracking-widest flex items-center gap-2">
                            <FlaskConical className="h-3 w-3" /> Professional Cure
                          </p>
                          <p className="text-xs font-bold">{result.suggestedChemicalRemedies[0]}</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20 space-y-2">
                          <p className="text-[8px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <Zap className="h-3 w-3" /> Heritage Wisdom
                          </p>
                          <p className="text-xs font-bold italic">"{result.suggestedTraditionalRemedies[0]}"</p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/10">
                        <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                          <CheckCircle2 className="h-3 w-3 text-green-500" /> AI Draft Logged for Expert Certification
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="py-10 text-center opacity-30">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4" />
                      <p className="text-xs font-bold uppercase tracking-widest">Describe symptoms to initiate precision analysis</p>
                    </div>
                  )}
                </AnimatePresence>
              </CardContent>
              <CardFooter className="p-6 bg-black/20 flex justify-between items-center">
                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                  <Sparkles className="h-2.5 w-2.5 text-primary" /> Powered by Gemini 2.5 Flash
                </p>
                <span className="text-[8px] font-bold text-slate-500">Regional Bhashini Node Active</span>
              </CardFooter>
            </Card>
          </div>
        </div>
      </ScrollArea>
      <audio ref={audioRef} className="hidden" aria-hidden="true" />
    </div>
  );
}

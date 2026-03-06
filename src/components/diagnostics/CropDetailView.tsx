
'use client';

import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Sprout, 
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
  Activity,
  Award,
  Info,
  History,
  UserCheck
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useAppState } from "@/lib/app-state";
import { useFirestore, useUser, useDoc, useMemoFirebase } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { diagnoseCropPest, FarmerCropPestDiagnosisOutput } from "@/ai/flows/farmer-crop-pest-diagnosis";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { getRegistryMatch } from "@/lib/botanical-registry";

interface CropDetailViewProps {
  crop: any;
  onClose: () => void;
}

export function CropDetailView({ crop: initialCrop, onClose }: CropDetailViewProps) {
  const { language, langCode, name: userName, searchCount, incrementSearchCount } = useAppState();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [query, setQuery] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<FarmerCropPestDiagnosisOutput | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cropRef = useMemoFirebase(() => {
    if (!firestore || !initialCrop.id) return null;
    return doc(firestore, "crops", initialCrop.id);
  }, [firestore, initialCrop.id]);
  const { data: liveCrop } = useDoc(cropRef);

  const crop = liveCrop || initialCrop;

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

  const handleAskAI = async (textOverride?: string) => {
    const finalQuery = textOverride || query;
    if (!finalQuery.trim()) return;

    setIsAnalyzing(true);
    setAiResult(null);
    incrementSearchCount();

    try {
      const res = await diagnoseCropPest({
        cropType: crop.name,
        symptomsDescription: finalQuery,
        language: language
      });

      setAiResult(res);
      await speakResult(res);

      if (user && firestore) {
        addDocumentNonBlocking(collection(firestore, "crops"), {
          name: crop.name,
          category: crop.category,
          diseaseName: res.pathogenIdentification,
          symptoms: finalQuery,
          solutions: res.solutions,
          isCertified: false,
          status: "pending_expert_review",
          assignedExpertId: "AMAN_EXP_01",
          reportedBy: user.uid,
          reportedByName: userName,
          imageUrl: crop.imageUrl || `https://picsum.photos/seed/${crop.id}/800/600`,
          createdAt: new Date().toISOString()
        });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "AI Node Offline", description: "Grid connection unstable." });
    } finally {
      setIsAnalyzing(false);
      setQuery("");
    }
  };

  const toggleListening = () => {
    const recognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!recognitionClass) return;
    const recognition = new recognitionClass();
    recognition.lang = langCode === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => handleAskAI(event.results[0][0].transcript);
    if (isListening) recognition.stop();
    else recognition.start();
  };

  const speakResult = async (resData: any) => {
    const activeSol = resData.pinnedSolution || (resData.solutions ? resData.solutions[searchCount % resData.solutions.length] : null);
    const text = activeSol ? `${resData.pathogenIdentification}. treatment: ${activeSol.chemicalCure}` : resData.diagnosis;
    
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
        const ut = new SpeechSynthesisUtterance(text);
        ut.lang = langCode === 'hi' ? 'hi-IN' : 'en-IN';
        ut.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(ut);
      }
    } catch (e) {
      setIsSpeaking(false);
    }
  };

  // Logic: Expert Pinned Solution > AI Rotation Solution
  const activeSolution = crop.isCertified && crop.pinnedSolution 
    ? crop.pinnedSolution 
    : (aiResult?.solutions ? aiResult.solutions[searchCount % aiResult.solutions.length] : 
       (crop.solutions ? crop.solutions[searchCount % crop.solutions.length] : null));

  return (
    <div className="flex flex-col h-[90vh] bg-white">
      <div className="relative h-64 shrink-0">
        <Image src={crop.imageUrl || `https://picsum.photos/seed/${crop.id}/1200/600`} width={1200} height={600} className="object-cover w-full h-full" alt={crop.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/40" />
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute top-6 right-6 h-12 w-12 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40">
          <X className="h-6 w-6" />
        </Button>
        <div className="absolute bottom-8 left-10 text-white drop-shadow-lg">
          <Badge className="bg-primary text-white mb-3 px-4 py-1 font-black uppercase text-[10px] tracking-widest">{crop.category}</Badge>
          <div className="flex items-center gap-3">
            <h2 className="text-5xl font-black tracking-tighter">{crop.name}</h2>
            {crop.isCertified && (
              <Badge className="bg-amber-500 text-white border-none font-black text-[10px] uppercase tracking-widest gap-1 shadow-lg animate-in zoom-in">
                <UserCheck className="h-3 w-3" /> Certified Protocol
              </Badge>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 px-10 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: Sun, label: "Season", val: crop.season || "Rabi" },
                { icon: Sprout, label: "Soil", val: crop.soilType || "Loamy" },
                { icon: Droplets, label: "Irrigation", val: crop.irrigation || "15-20 Days" },
                { icon: Thermometer, label: "pH Range", val: "6.5 - 7.5" },
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

            <div className="space-y-6">
              <h4 className="text-2xl font-black tracking-tight flex items-center gap-3 text-slate-900">
                <ShieldCheck className="h-7 w-7 text-primary" />
                Scientific Command Hub
              </h4>
              
              <AnimatePresence mode="wait">
                {crop.isCertified ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-10 rounded-[3rem] bg-amber-50 border-4 border-amber-200 shadow-2xl space-y-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10"><Award className="h-48 w-48 rotate-12" /></div>
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3 text-amber-700 font-black uppercase text-xs tracking-[0.2em]">
                        <UserCheck className="h-5 w-5" /> Professional Expert Pinned
                      </div>
                      <Button variant="outline" size="sm" onClick={() => speakResult(crop)} className="rounded-full h-10 px-4 gap-2 bg-white/50 border-amber-200 text-amber-700 font-black text-[10px] uppercase">
                        <Volume2 className="h-4 w-4" /> Listen to POV
                      </Button>
                    </div>
                    <p className="text-2xl font-black text-amber-900 leading-relaxed italic relative z-10">
                      "{crop.expertNotes || `Protocol certified by Dr. ${crop.verifiedByName}. This path overrides rotation.`}"
                    </p>
                    <div className="flex items-center gap-4 pt-4 border-t border-amber-200/50">
                      <div className="flex items-center gap-2">
                        <History className="h-3 w-3 text-amber-600" />
                        <p className="text-[10px] font-black text-amber-600 uppercase">Verified: {new Date(crop.verifiedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </motion.div>
                ) : crop.status === "pending_expert_review" ? (
                  <div className="p-8 rounded-[2.5rem] bg-blue-50 border-2 border-blue-200 flex flex-col gap-4 animate-pulse">
                    <div className="flex items-center gap-4">
                      <Activity className="h-6 w-6 text-blue-500" />
                      <p className="text-sm font-black text-blue-700 uppercase tracking-widest italic">Scientist Audit in Progress...</p>
                    </div>
                    <p className="text-xs text-blue-600 font-medium ml-10">Rotation active until expert pins a protocol.</p>
                  </div>
                ) : (
                  <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-200 flex items-start gap-4">
                    <Info className="h-6 w-6 text-slate-400 mt-1 shrink-0" />
                    <p className="text-sm text-slate-500 font-medium italic leading-relaxed">Advice rotates every scan to ensure comprehensive coverage. Expert certification will pin one solution.</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-slate-900 text-white">
              <CardHeader className="p-8 bg-slate-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                      <Bot className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black tracking-tight">Solution Protocol</CardTitle>
                      {!crop.isCertified && <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Rotation Node Active</p>}
                    </div>
                  </div>
                  <Badge variant={crop.isCertified ? "default" : "outline"} className={cn("text-[8px] font-black uppercase", crop.isCertified ? "bg-amber-500" : "text-primary border-primary/30")}>
                    {crop.isCertified ? "Expert Pinned" : `AI Path ${searchCount % (crop.solutions?.length || 3) + 1}`}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-10">
                {activeSolution ? (
                  <>
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-destructive uppercase tracking-[0.2em] flex items-center gap-2"><FlaskConical className="h-4 w-4" /> Professional Neutralizer</h5>
                      <div className="p-6 rounded-3xl bg-destructive/10 border border-destructive/20 text-xl font-black leading-relaxed text-white shadow-inner">
                        {activeSolution.chemicalCure}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h5 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2"><Zap className="h-4 w-4" /> Heritage Wisdom</h5>
                      <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 text-xl font-bold italic leading-relaxed text-slate-200 shadow-inner">
                        "{activeSolution.traditionalRemedy}"
                      </div>
                    </div>
                    {activeSolution.detailedSteps && (
                      <div className="space-y-4 pt-6 border-t border-white/10">
                        <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol Steps</h5>
                        <div className="space-y-3">
                          {activeSolution.detailedSteps.map((step: string, i: number) => (
                            <div key={i} className="flex gap-3 text-sm font-bold text-slate-300">
                              <span className="text-primary">{i+1}.</span>
                              <p className="leading-relaxed">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-10 text-center opacity-40 italic font-black">Waiting for diagnostic sync...</div>
                )}

                {!crop.isCertified && (
                  <div className="pt-8 border-t border-white/10 space-y-6">
                    <div className="relative">
                      <Input placeholder={`Ask Grid...`} value={query} onChange={(e) => setQuery(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAskAI()} className="h-14 rounded-2xl bg-white/5 border-white/10 pl-6 pr-24 font-bold text-lg" />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                        <Button variant="ghost" size="icon" onClick={toggleListening} className={cn("h-10 w-10 rounded-xl", isListening ? "text-destructive animate-pulse" : "text-slate-400")}>
                          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </Button>
                        <Button size="icon" onClick={() => handleAskAI()} disabled={isAnalyzing || !query.trim()} className="h-10 w-10 rounded-xl shadow-lg">
                          <Send className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                    {isAnalyzing && (
                      <div className="py-6 text-center space-y-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                        <p className="text-xs font-bold text-slate-400 italic">Rotating Scientific Paths...</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
              <CardFooter className="p-6 bg-black/20 flex justify-between items-center text-[8px] font-black text-slate-500 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Sparkles className="h-2.5 w-2.5 text-primary" /> Powered by Gemini 2.5 Flash</span>
                <span>Rotation Count: {searchCount}</span>
              </CardFooter>
            </Card>
          </div>
        </div>
      </ScrollArea>
      <audio ref={audioRef} className="hidden" aria-hidden="true" />
    </div>
  );
}

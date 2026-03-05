'use client';

import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  ArrowLeft, 
  PlusCircle, 
  Droplets, 
  ShieldCheck, 
  FlaskConical,
  Loader2,
  Tag,
  Zap,
  Mic2,
  ChevronRight,
  Calendar,
  Mountain,
  Edit2,
  Save,
  Info,
  TrendingUp,
  Volume2,
  UserCheck,
  Microscope,
  Bot,
  Sparkles,
  Camera,
  Send,
  X,
  ImageIcon,
  Mic,
  MicOff
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { query, collection, doc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { useAppState } from "@/lib/app-state";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { voiceAssistantGuidance } from "@/ai/flows/voice-assistant-guidance";

const CATEGORIES = ["Plant", "Seed", "Vegetable", "Fruit", "Grain"];

const SoundWave = () => (
  <div className="flex items-center gap-0.5 h-4">
    {[1, 2, 3, 4].map((i) => (
      <motion.div
        key={i}
        animate={{
          height: [4, 16, 4],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          delay: i * 0.1,
        }}
        className="w-1 bg-primary rounded-full"
      />
    ))}
  </div>
);

export function CropDiagnostics() {
  const { t } = useTranslation();
  const { role, langCode, language, name: userName } = useAppState();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState<string>("Grain");
  const [activeView, setActiveView] = useState<'gallery' | 'detail'>('gallery');
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  
  // AI Assistant State
  const [chatInput, setInput] = useState("");
  const [chatMessages, setMessages] = useState<any[]>([
    { role: 'bot', text: `Namaste ${userName}! I am KisanMitra, your National Grid Assistant. Ask me anything about your crops, logistics, or even general topics. You can even upload a photo!` }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const cropsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"));
  }, [firestore]);

  const { data: allCrops, isLoading } = useCollection(cropsQuery);

  const filteredCrops = useMemo(() => {
    if (!allCrops) return [];
    return allCrops.filter(crop => crop.category === selectedCategory);
  }, [allCrops, selectedCategory]);

  const handleAiSend = async (queryText?: string) => {
    const finalQuery = queryText || chatInput;
    if (!finalQuery.trim() && !photo) return;

    const userMsg = { role: 'user', text: finalQuery, image: photo };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    const currentPhoto = photo;
    setPhoto(null);
    setIsAiLoading(true);

    try {
      const response = await voiceAssistantGuidance({
        query: finalQuery || "Analyze this image.",
        language: language,
        photoDataUri: currentPhoto || undefined
      });

      setMessages(prev => [...prev, { 
        role: 'bot', 
        text: response.text, 
        audioUri: response.audioDataUri 
      }]);

      if (response.audioDataUri && audioRef.current) {
        try {
          audioRef.current.src = response.audioDataUri;
          await audioRef.current.play();
          setIsSpeaking(true);
          audioRef.current.onended = () => setIsSpeaking(false);
        } catch (playError) {
          console.warn("Audio playback blocked or invalid source:", playError);
          setIsSpeaking(false);
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'bot', text: "I encountered an error connecting to the National Grid. Please try again." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleListening = () => {
    const recognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!recognitionClass) {
      toast({ variant: "destructive", title: "Voice Not Supported", description: "Please use a modern browser like Chrome." });
      return;
    }
    const recognition = new recognitionClass();
    recognition.lang = langCode === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleAiSend(transcript);
    };
    if (isListening) recognition.stop();
    else recognition.start();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleManualReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;
    const formData = new FormData(e.currentTarget);
    addDocumentNonBlocking(collection(firestore, "crops"), {
      name: formData.get("cropName"),
      diseaseName: formData.get("diseaseName") || "Unidentified Pathogen",
      category: selectedCategory,
      symptoms: formData.get("symptoms"),
      isCertified: false,
      severity: "Warning",
      createdAt: new Date().toISOString(),
      imageUrl: `https://picsum.photos/seed/report-${Date.now()}/800/600`
    });
    setIsReportOpen(false);
    toast({ title: "Issue Reported", description: "Sent to the professional expert queue for verification." });
  };

  if (activeView === 'detail' && selectedCrop) {
    const liveCrop = allCrops?.find(c => c.id === selectedCrop.id) || selectedCrop;

    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
        <Button variant="ghost" onClick={() => setActiveView('gallery')} className="rounded-full gap-2 font-black text-xs uppercase tracking-widest text-slate-500 hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Gallery
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <Card className="rounded-[3rem] overflow-hidden border-none shadow-2xl sticky top-24">
              <div className="relative aspect-square">
                <Image 
                  src={liveCrop.imageUrl || `https://picsum.photos/seed/${liveCrop.id}/800/800`} 
                  fill
                  className="object-cover" 
                  alt={liveCrop.name}
                  data-ai-hint="crop diagnosis"
                />
              </div>
              <div className="absolute top-6 left-6 flex gap-2">
                <Badge className="bg-primary/90 text-white border-none px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">
                  {liveCrop.category}
                </Badge>
                {liveCrop.isCertified && (
                  <Badge className="bg-amber-500/90 text-white border-none px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Expert-Verified
                  </Badge>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-10">
            <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] shadow-xl">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-6xl font-black tracking-tighter text-slate-900">{liveCrop.name}</h2>
                  {liveCrop.isCertified && <UserCheck className="h-8 w-8 text-amber-500 animate-in zoom-in" />}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="font-black uppercase text-[10px] px-3">{liveCrop.diseaseName}</Badge>
                  {isSpeaking && <SoundWave />}
                </div>
              </div>
            </div>

            {liveCrop.expertNotes && (
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-blue-50/50 p-8 border-l-8 border-blue-500 animate-in slide-in-from-right-4">
                <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Microscope className="h-4 w-4" /> Official Scientist Viewpoint
                </h4>
                <p className="text-lg font-bold text-blue-900 leading-relaxed italic">
                  "{liveCrop.expertNotes}"
                </p>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <Droplets className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('irrigation')}</span>
                </div>
                <p className="text-xl font-black">Every {liveCrop.irrigationInterval || 7} Days</p>
                <Progress value={70} className="h-1.5 bg-blue-100" />
              </div>
              <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100 space-y-2">
                <div className="flex items-center gap-2 text-amber-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Season</span>
                </div>
                <p className="text-xl font-black">{liveCrop.sowingSeason || "Kharif"}</p>
              </div>
              <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-2 relative">
                <div className="flex items-center gap-2 text-primary">
                  <Tag className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('mandi_price')}</span>
                </div>
                <p className="text-2xl font-black text-primary">₹{liveCrop.estimatedMarketPrice?.toLocaleString()}</p>
              </div>
            </div>

            <Tabs defaultValue="diagnosis" className="w-full">
              <TabsList className="bg-muted rounded-full p-1.5 h-14 w-full md:w-fit mb-8">
                <TabsTrigger value="diagnosis" className="rounded-full px-8 font-black text-[10px] uppercase tracking-widest">Pathogen Intel</TabsTrigger>
                <TabsTrigger value="cure" className="rounded-full px-8 font-black text-[10px] uppercase tracking-widest">Professional Cure</TabsTrigger>
                <TabsTrigger value="natural" className="rounded-full px-8 font-black text-[10px] uppercase tracking-widest">Heritage Wisdom</TabsTrigger>
              </TabsList>
              <TabsContent value="diagnosis" className="glass-card p-10 rounded-[3rem] border-none shadow-2xl">
                <h4 className="text-xl font-black mb-4 flex items-center gap-2 text-slate-900"><Info className="h-5 w-5 text-primary" /> Diagnosis Summary</h4>
                <p className="text-lg text-slate-600 leading-relaxed font-medium italic">
                  {liveCrop.symptoms || "Intelligence analysis suggests regional onset based on historical vector paths."}
                </p>
              </TabsContent>
              <TabsContent value="cure" className="glass-card p-10 rounded-[3rem] border-none shadow-2xl">
                <h4 className="text-xl font-black mb-4 flex items-center gap-2 text-destructive"><FlaskConical className="h-5 w-5" /> Chemical Neutralization</h4>
                <p className="text-2xl font-black text-destructive">{liveCrop.chemicalCure}</p>
                <p className="text-sm font-bold text-muted-foreground mt-2 uppercase tracking-widest">Certified Protocols Active</p>
              </TabsContent>
              <TabsContent value="natural" className="glass-card p-10 rounded-[3rem] border-none shadow-2xl">
                <h4 className="text-xl font-black mb-4 flex items-center gap-2 text-primary"><Zap className="h-5 w-5" /> Desi Nuskha (Natural)</h4>
                <p className="text-xl font-medium text-primary italic leading-relaxed">
                  "{liveCrop.desiNuskha || "Use heritage neem-based soil application for systemic immunity."}"
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <audio ref={audioRef} className="hidden" aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-8 space-y-12">
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-wrap gap-2 p-1.5 bg-muted/50 rounded-2xl">
              {CATEGORIES.map(cat => (
                <Button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  variant={selectedCategory === cat ? "default" : "ghost"}
                  className={cn(
                    "rounded-xl font-black text-xs uppercase tracking-widest px-6 h-11 transition-all",
                    selectedCategory === cat ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                  )}
                >
                  {cat}s
                </Button>
              ))}
            </div>
            <Button 
              onClick={() => setIsReportOpen(true)}
              className="rounded-2xl h-14 px-8 font-black gap-2 bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="h-5 w-5" /> {t("report_issue")}
            </Button>
          </div>

          {isLoading ? (
            <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredCrops.map((crop) => (
                  <motion.div
                    key={crop.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => { setSelectedCrop(crop); setActiveView('detail'); }}
                    className="group cursor-pointer"
                  >
                    <Card className="glass-card rounded-[2.5rem] overflow-hidden border-none shadow-xl h-[350px] relative">
                      <Image 
                        src={crop.imageUrl || `https://picsum.photos/seed/${crop.id}/800/600`} 
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110" 
                        alt={crop.name} 
                        data-ai-hint="crop plant"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-6 right-6">
                        {crop.isCertified ? (
                          <Badge className="bg-amber-500 text-white border-none font-black text-[8px] uppercase tracking-widest px-2 shadow-lg">Verified</Badge>
                        ) : (
                          <Badge className="bg-white/20 backdrop-blur-md text-white border-white/20 font-black text-[8px] uppercase tracking-widest px-2">AI Draft</Badge>
                        )}
                      </div>
                      <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end">
                        <div className="space-y-1">
                          <Badge className="bg-primary/20 text-primary border-none font-black text-[9px] uppercase tracking-widest mb-2">
                            {crop.category}
                          </Badge>
                          <h3 className="text-3xl font-black text-white tracking-tighter">{crop.name}</h3>
                          <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{crop.diseaseName}</p>
                        </div>
                        <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white group-hover:bg-primary group-hover:text-white transition-all">
                          <ChevronRight className="h-5 w-5" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant Sidebar Panel */}
      <div className="lg:col-span-4 space-y-8">
        <Card className="border-none shadow-2xl rounded-[3rem] bg-white flex flex-col h-[700px] overflow-hidden sticky top-24">
          <CardHeader className="bg-slate-900 text-white p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Bot className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-black">Kisan Assistant</CardTitle>
                  <CardDescription className="text-slate-400 font-medium italic text-xs">National Grid Intelligence</CardDescription>
                </div>
              </div>
              {isSpeaking && <SoundWave />}
            </div>
          </CardHeader>

          <CardContent className="flex-1 p-6 overflow-hidden bg-muted/5">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-6 pb-4">
                {chatMessages.map((m, i) => (
                  <div key={i} className={cn("flex w-full", m.role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-[85%] p-4 rounded-[1.5rem] shadow-sm relative group",
                      m.role === "user" 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-white border border-border rounded-tl-none"
                    )}>
                      <div className="space-y-3">
                        {m.image && (
                          <div className="relative aspect-video rounded-xl overflow-hidden shadow-md">
                            <img src={m.image} alt="Uploaded context" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <p className="text-sm font-medium leading-relaxed">{m.text}</p>
                        {m.audioUri && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 text-[10px] gap-2 px-3 bg-muted/50 hover:bg-muted font-bold rounded-full"
                            onClick={async () => {
                              if (audioRef.current) {
                                try {
                                  audioRef.current.src = m.audioUri!;
                                  await audioRef.current.play();
                                } catch (e) {
                                  console.warn("Manual audio replay failed", e);
                                }
                              }
                            }}
                          >
                            <Volume2 className="h-3 w-3" /> REPLAY
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isAiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-border p-4 rounded-[1.5rem] rounded-tl-none flex items-center gap-3 shadow-sm">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground font-bold italic">Consulting National Grid...</span>
                    </div>
                  </div>
                )}
                <div ref={chatScrollRef} />
              </div>
            </ScrollArea>
          </CardContent>

          <div className="p-6 bg-white border-t space-y-4">
            {photo && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border shadow-lg animate-in zoom-in">
                <img src={photo} className="w-full h-full object-cover" alt="Context preview" />
                <button onClick={() => setPhoto(null)} className="absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder={`Ask anything in ${language}...`}
                  value={chatInput}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAiSend()}
                  className="rounded-2xl h-12 bg-muted/30 border-none font-medium pr-10 focus-visible:ring-primary shadow-inner"
                />
                <label className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-primary transition-colors">
                  <ImageIcon className="h-5 w-5" />
                  <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </label>
              </div>
              <Button 
                onClick={toggleListening}
                variant={isListening ? "destructive" : "secondary"}
                size="icon"
                className={cn("rounded-2xl h-12 w-12 shrink-0 transition-all", isListening && "animate-pulse")}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button 
                onClick={() => handleAiSend()} 
                disabled={isAiLoading || (!chatInput.trim() && !photo)}
                className="rounded-2xl h-12 w-12 shrink-0 shadow-lg shadow-primary/20"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center justify-between px-2">
              <Badge variant="outline" className="text-[8px] border-primary/20 text-primary font-black uppercase tracking-widest">
                Multimodal Input Active
              </Badge>
              <span className="text-[8px] font-bold text-muted-foreground uppercase">{language} Neural Bridge</span>
            </div>
          </div>
        </Card>
      </div>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="rounded-[3rem] sm:max-w-[600px] p-10">
          <DialogHeader>
            <DialogTitle className="text-3xl font-black tracking-tighter">Manual Field Report</DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium italic">Describe the observed symptoms. Experts will review and certify.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleManualReport} className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Crop Affected</Label>
              <Input name="cropName" placeholder="e.g. Wheat, Tomato" required className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Observed Pathogen Name (Optional)</Label>
              <Input name="diseaseName" placeholder="e.g. Yellow Rust" className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Symptom Description</Label>
              <Textarea name="symptoms" placeholder="Describe spots, curls, or pest behavior..." required className="rounded-xl bg-muted/30 border-none min-h-[120px] font-medium" />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg">Submit for Expert Review</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <audio ref={audioRef} className="hidden" aria-hidden="true" />
    </div>
  );
}

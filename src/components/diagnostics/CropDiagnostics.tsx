
'use client';

import React, { useState, useMemo, useRef } from "react";
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
  Volume2
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { query, collection, doc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { useAppState } from "@/lib/app-state";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DiagnosticTool } from "./DiagnosticTool";

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
  const { t, language } = useTranslation();
  const { role, langCode } = useAppState();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState<string>("Grain");
  const [activeView, setActiveView] = useState<'gallery' | 'detail'>('gallery');
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [newPrice, setNewPrice] = useState("");
  
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const cropsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"));
  }, [firestore]);

  const { data: allCrops, isLoading } = useCollection(cropsQuery);

  const filteredCrops = useMemo(() => {
    if (!allCrops) return [];
    return allCrops.filter(crop => crop.category === selectedCategory);
  }, [allCrops, selectedCategory]);

  const speakCropDetails = async (crop: any) => {
    const text = `${crop.name}. ${t('irrigation')}: ${crop.irrigationInterval || 7} din. ${t('mandi_price')}: ${crop.estimatedMarketPrice} rupaye. Diagnosis: ${crop.diseaseName}. ${crop.symptoms || ""}`;
    
    setIsSpeaking(true);
    
    try {
      const response = await fetch('/api/bhashini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, langCode })
      });

      const data = await response.json();

      if (data.audioContent) {
        if (!audioRef.current) audioRef.current = new Audio();
        audioRef.current.src = `data:audio/wav;base64,${data.audioContent}`;
        audioRef.current.onended = () => setIsSpeaking(false);
        audioRef.current.play();
      } else if (data.simulated) {
        // Fallback to browser TTS if Bhashini endpoint is in demo mode
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode === 'hi' ? 'hi-IN' : 'en-IN';
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.error(err);
      setIsSpeaking(false);
    }
  };

  const handleUpdatePrice = () => {
    if (!firestore || !selectedCrop || !newPrice) return;
    updateDocumentNonBlocking(doc(firestore, "crops", selectedCrop.id), {
      estimatedMarketPrice: Number(newPrice)
    });
    setSelectedCrop({ ...selectedCrop, estimatedMarketPrice: Number(newPrice) });
    setEditingPrice(false);
    toast({ title: "Price Updated", description: "The global market registry has been updated." });
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
      imageUrl: "https://picsum.photos/seed/report/800/600"
    });
    setIsReportOpen(false);
    toast({ title: "Issue Reported", description: "Sent to the professional expert queue for verification." });
  };

  if (activeView === 'detail' && selectedCrop) {
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
                  src={selectedCrop.imageUrl || `https://picsum.photos/seed/${selectedCrop.id}/800/800`} 
                  fill
                  className="object-cover" 
                  alt={selectedCrop.name}
                  data-ai-hint="crop diagnosis"
                />
              </div>
              <div className="absolute top-6 left-6 flex gap-2">
                <Badge className="bg-primary/90 text-white border-none px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">
                  {selectedCrop.category}
                </Badge>
                {selectedCrop.isCertified && (
                  <Badge className="bg-amber-500/90 text-white border-none px-4 py-1.5 font-black uppercase tracking-widest text-[10px]">
                    <ShieldCheck className="h-3 w-3 mr-1" /> Verified
                  </Badge>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-7 space-y-10">
            <div className="flex justify-between items-center bg-white p-8 rounded-[3rem] shadow-xl">
              <div className="space-y-2">
                <h2 className="text-6xl font-black tracking-tighter text-slate-900">{selectedCrop.name}</h2>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="font-black uppercase text-[10px] px-3">{selectedCrop.diseaseName}</Badge>
                  {isSpeaking && <SoundWave />}
                </div>
              </div>
              <Button 
                onClick={() => speakCropDetails(selectedCrop)} 
                disabled={isSpeaking}
                className={cn(
                  "h-20 w-20 rounded-[2rem] shadow-xl transition-all active:scale-95",
                  isSpeaking ? "bg-primary/20 text-primary" : "bg-primary text-white hover:bg-primary/90"
                )}
              >
                {isSpeaking ? <Loader2 className="h-8 w-8 animate-spin" /> : <Volume2 className="h-10 w-10" />}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-2">
                <div className="flex items-center gap-2 text-blue-600">
                  <Droplets className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('irrigation')}</span>
                </div>
                <p className="text-xl font-black">Every {selectedCrop.irrigationInterval || 7} Days</p>
                <Progress value={70} className="h-1.5 bg-blue-100" />
              </div>
              <div className="p-6 bg-amber-50/50 rounded-3xl border border-amber-100 space-y-2">
                <div className="flex items-center gap-2 text-amber-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Season</span>
                </div>
                <p className="text-xl font-black">{selectedCrop.sowingSeason || "Kharif"}</p>
              </div>
              <div className="p-6 bg-primary/5 rounded-3xl border border-primary/10 space-y-2 relative">
                <div className="flex items-center gap-2 text-primary">
                  <Tag className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('mandi_price')}</span>
                </div>
                {editingPrice ? (
                  <div className="flex gap-1">
                    <Input value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="h-8 w-24 bg-white font-bold" />
                    <Button size="icon" className="h-8 w-8" onClick={handleUpdatePrice}><Save className="h-4 w-4"/></Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-black text-primary">₹{selectedCrop.estimatedMarketPrice?.toLocaleString()}</p>
                    {role === 'Authority' && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingPrice(true); setNewPrice(selectedCrop.estimatedMarketPrice.toString()); }}><Edit2 className="h-3 w-3"/></Button>}
                  </div>
                )}
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
                  {selectedCrop.symptoms || "Intelligence analysis suggests regional onset based on historical vector paths."}
                </p>
              </TabsContent>
              <TabsContent value="cure" className="glass-card p-10 rounded-[3rem] border-none shadow-2xl">
                <h4 className="text-xl font-black mb-4 flex items-center gap-2 text-destructive"><FlaskConical className="h-5 w-5" /> Chemical Neutralization</h4>
                <p className="text-2xl font-black text-destructive">{selectedCrop.chemicalCure}</p>
                <p className="text-sm font-bold text-muted-foreground mt-2 uppercase tracking-widest">Dosage: {selectedCrop.chemicalDosage}</p>
              </TabsContent>
              <TabsContent value="natural" className="glass-card p-10 rounded-[3rem] border-none shadow-2xl">
                <h4 className="text-xl font-black mb-4 flex items-center gap-2 text-primary"><Zap className="h-5 w-5" /> Desi Nuskha (Natural)</h4>
                <p className="text-xl font-medium text-primary italic leading-relaxed">
                  "{selectedCrop.desiNuskha || "Use heritage neem-based soil application for systemic immunity."}"
                </p>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <h2 className="text-4xl font-black tracking-tighter flex items-center gap-3">
          <Zap className="h-10 w-10 text-primary" /> {t("ai_scan")}
        </h2>
        <DiagnosticTool />
      </div>

      <div className="space-y-8 pt-10 border-t">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                  <Card className="glass-card rounded-[2.5rem] overflow-hidden border-none shadow-xl h-[400px] relative">
                    <Image 
                      src={crop.imageUrl || `https://picsum.photos/seed/${crop.id}/800/600`} 
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                      alt={crop.name} 
                      data-ai-hint="crop plant"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
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
    </div>
  );
}

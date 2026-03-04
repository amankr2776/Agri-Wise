'use client';

import React, { useState, useMemo } from "react";
import { 
  ArrowLeft, 
  PlusCircle, 
  Volume2, 
  Bug, 
  Droplets, 
  TrendingUp, 
  ShieldCheck, 
  LayoutGrid, 
  FlaskConical,
  Loader2,
  Tag,
  RefreshCw,
  Zap,
  Camera
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { query, collection } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DiagnosticTool } from "./DiagnosticTool";

const CATEGORIES = ["All", "Plant", "Seed", "Vegetable", "Fruit", "Grain"];

export function CropDiagnostics() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const cropsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"));
  }, [firestore]);

  const { data: crops, isLoading } = useCollection(cropsQuery);

  const filteredCrops = useMemo(() => {
    if (!crops) return [];
    return crops.filter(c => {
      const category = c.category || "";
      return selectedCategory === "All" || category === selectedCategory;
    });
  }, [crops, selectedCategory]);

  const selectedCrop = useMemo(() => {
    return crops?.find(c => c.id === selectedCropId) || null;
  }, [crops, selectedCropId]);

  const handleManualReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;
    setIsSubmittingReport(true);

    const formData = new FormData(e.currentTarget);
    const reportData = {
      name: formData.get("cropName") as string,
      diseaseName: formData.get("diseaseName") as string,
      symptoms: formData.get("symptoms") as string,
      category: "User Submitted",
      isCertified: false,
      severity: "Warning",
      imageUrl: `https://picsum.photos/seed/${Date.now()}/800/400`,
      createdAt: new Date().toISOString()
    };

    addDocumentNonBlocking(collection(firestore, "crops"), reportData);
    setIsReportOpen(false);
    setIsSubmittingReport(false);
    toast({ 
      title: "Issue Reported", 
      description: "Your manual report has been sent to the expert verification queue." 
    });
  };

  const speakDetail = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-64 rounded-[2rem]" />)}
      </div>
    );
  }

  return (
    <div className="space-y-12 relative">
      <AnimatePresence mode="wait">
        {!selectedCropId ? (
          <motion.div 
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-16"
          >
            {/* AI Scanning Hero */}
            <div className="space-y-8">
              <div className="flex flex-col gap-2">
                <h2 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
                  <Zap className="h-10 w-10 text-primary" />
                  Multimodal AI Field Scan
                </h2>
                <p className="text-muted-foreground font-medium max-w-2xl">
                  Upload a photo of your crop or symptoms. Our AI will identify the pathogen and provide heritage wisdom + certified protocols.
                </p>
              </div>
              <DiagnosticTool />
            </div>

            <div className="space-y-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-t pt-12">
                <div className="space-y-1">
                  <h3 className="text-2xl font-black tracking-tight">Verified Protocol Registry</h3>
                  <p className="text-sm text-muted-foreground font-medium">Browse expert-certified diagnostic profiles</p>
                </div>
                <div className="flex gap-2 p-1 bg-muted rounded-full w-fit overflow-x-auto scrollbar-hide max-w-full glass-card">
                  {CATEGORIES.map((cat) => (
                    <Button
                      key={cat}
                      variant={selectedCategory === cat ? "default" : "ghost"}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "rounded-full px-6 h-10 font-black text-[10px] uppercase tracking-widest whitespace-nowrap",
                        selectedCategory === cat ? "shadow-lg shadow-primary/20" : "text-muted-foreground"
                      )}
                    >
                      {cat}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                  <DialogTrigger asChild>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="group relative h-80 rounded-[2.5rem] border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-4 bg-primary/5 hover:bg-primary/10 transition-all shadow-sm"
                    >
                      <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center text-primary shadow-xl shadow-primary/10 group-hover:scale-110 transition-transform">
                        <PlusCircle className="h-10 w-10" />
                      </div>
                      <div className="text-center px-4">
                        <p className="font-black text-lg text-primary">Report New Issue</p>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Manual Disease Entry</p>
                      </div>
                    </motion.button>
                  </DialogTrigger>
                  <DialogContent className="rounded-[2.5rem] sm:max-w-[500px] p-10">
                    <DialogHeader>
                      <DialogTitle className="text-3xl font-black tracking-tight">Manual Field Report</DialogTitle>
                      <DialogDescription className="font-medium italic">Describe symptoms and observations for expert verification.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleManualReport} className="space-y-6 pt-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Crop / Species Name</Label>
                        <Input name="cropName" placeholder="e.g. Paddy, Mango" required className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Suspected Disease</Label>
                        <Input name="diseaseName" placeholder="e.g. Unusual Leaf Spots" className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Observations</Label>
                        <Textarea name="symptoms" placeholder="Describe the symptoms in detail..." required className="rounded-xl bg-muted/30 border-none min-h-[100px] font-medium" />
                      </div>
                      <Button type="submit" disabled={isSubmittingReport} className="w-full h-14 rounded-2xl font-black text-lg">
                        {isSubmittingReport ? <Loader2 className="animate-spin" /> : "Submit for Verification"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                {filteredCrops.map((crop) => (
                  <motion.div
                    key={crop.id}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setSelectedCropId(crop.id)}
                    className="group relative h-80 rounded-[2.5rem] overflow-hidden shadow-xl cursor-pointer bg-slate-900"
                  >
                    <img 
                      src={crop.imageUrl || `https://picsum.photos/seed/${crop.id}/800/800`} 
                      alt={crop.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <Badge className="bg-white/20 backdrop-blur-md text-white border-none text-[8px] font-black uppercase tracking-widest px-3">
                            {crop.category}
                          </Badge>
                          <h2 className="text-3xl font-black text-white tracking-tighter">{crop.name}</h2>
                        </div>
                        <div className="h-10 w-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                          <LayoutGrid className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="min-h-screen pb-20"
          >
            <div className="max-w-6xl mx-auto space-y-10">
              <Button 
                variant="ghost" 
                onClick={() => setSelectedCropId(null)}
                className="rounded-full gap-2 font-black text-xs uppercase tracking-widest text-primary hover:bg-primary/5"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Gallery
              </Button>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-5 space-y-8">
                  <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl">
                    <img 
                      src={selectedCrop?.imageUrl || `https://picsum.photos/seed/${selectedCrop?.id}/800/1000`} 
                      className="w-full h-full object-cover"
                      alt={selectedCrop?.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-10 left-10">
                      <Badge className="bg-primary text-white border-none px-4 py-1 font-black uppercase text-[10px] tracking-widest mb-2">
                        {selectedCrop?.category}
                      </Badge>
                      <h1 className="text-5xl font-black text-white tracking-tighter">{selectedCrop?.name}</h1>
                    </div>
                  </div>

                  <Card className="glass-card rounded-[2.5rem] p-8 border-none">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" /> Agronomy Summary
                      </h3>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-full" 
                        onClick={() => speakDetail(`${selectedCrop?.name} identification. Common season is ${selectedCrop?.sowingSeason || "Kharif"}. Thrives in ${selectedCrop?.soilType || "Alluvial"} soil.`)}
                      >
                        <Volume2 className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">Target Soil</p>
                        <p className="text-lg font-bold text-slate-800">{selectedCrop?.soilType || "Alluvial"}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-muted-foreground uppercase">Optimum Season</p>
                        <p className="text-lg font-bold text-slate-800">{selectedCrop?.sowingSeason || "Kharif"}</p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="lg:col-span-7 space-y-8">
                  <Card className="glass-card rounded-[2.5rem] p-10 border-none space-y-8 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                      <Bug className="h-40 w-40" />
                    </div>
                    <div className="flex justify-between items-start relative z-10">
                      <div className="space-y-1">
                        <h3 className="text-3xl font-black tracking-tight text-slate-900">Pathogen Intelligence</h3>
                        <p className="text-muted-foreground font-medium italic">Active diagnostic data for {selectedCrop?.name}</p>
                      </div>
                      <Badge variant={selectedCrop?.severity === 'Critical' ? 'destructive' : 'default'} className="rounded-full px-4 py-1 font-black uppercase text-[10px]">
                        {selectedCrop?.severity || "Standard"} Risk Level
                      </Badge>
                    </div>

                    <div className="p-8 bg-destructive/5 rounded-3xl border border-destructive/10">
                      <p className="text-[10px] font-black text-destructive uppercase tracking-widest mb-2">Detected Issue</p>
                      <p className="text-2xl font-black text-slate-800">{selectedCrop?.diseaseName || "No Pathogens Detected"}</p>
                    </div>

                    <Tabs defaultValue="diagnosis" className="w-full">
                      <TabsList className="bg-muted rounded-full p-1 h-12 mb-6 w-full sm:w-fit">
                        <TabsTrigger value="diagnosis" className="rounded-full px-8 font-black text-[10px] uppercase h-10 data-[state=active]:bg-white">Diagnosis</TabsTrigger>
                        <TabsTrigger value="remedy" className="rounded-full px-8 font-black text-[10px] uppercase h-10 data-[state=active]:bg-white">Professional Cure</TabsTrigger>
                        <TabsTrigger value="desi" className="rounded-full px-8 font-black text-[10px] uppercase h-10 data-[state=active]:bg-white">Heritage Wisdom</TabsTrigger>
                      </TabsList>
                      <div className="min-h-[120px]">
                        <TabsContent value="diagnosis" className="space-y-4">
                          <p className="text-lg font-medium text-slate-600 leading-relaxed italic border-l-4 border-primary/20 pl-6">
                            Standard pathogen indicators for {selectedCrop?.name} include localized lesions, foliage wilting, and nutrient transport disruption.
                          </p>
                        </TabsContent>
                        <TabsContent value="remedy">
                          <div className="p-6 rounded-2xl bg-slate-50 border space-y-3">
                            <div className="flex justify-between">
                              <span className="text-[10px] font-black uppercase text-muted-foreground">Certified Protocol</span>
                              <span className="text-xs font-bold text-primary">Scientist Verified</span>
                            </div>
                            <p className="text-xl font-black text-slate-800">
                              {selectedCrop?.chemicalCure || "Awaiting Update"} @ {selectedCrop?.chemicalDosage || "N/A"}
                            </p>
                          </div>
                        </TabsContent>
                        <TabsContent value="desi">
                          <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100 italic font-medium text-amber-900">
                            "{selectedCrop?.desiNuskha || "Standard organic mulching and neem-based pest control advised."}"
                          </div>
                        </TabsContent>
                      </div>
                    </Tabs>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="glass-card rounded-[3rem] p-8 border-none border-l-8 border-blue-500/50">
                      <div className="flex items-center gap-3 mb-6">
                        <Droplets className="h-6 w-6 text-blue-600" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-700">Irrigation Gauge</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <p className="text-3xl font-black text-blue-900">{selectedCrop?.irrigationInterval || "7"} Days</p>
                          <p className="text-[10px] font-bold text-blue-600 uppercase">Standard Interval</p>
                        </div>
                        <Progress value={75} className="h-2.5 bg-blue-200" />
                        <p className="text-xs font-medium text-blue-800/60 italic">Soil moisture sensor: Optimal</p>
                      </div>
                    </Card>

                    <Card className="glass-card rounded-[3rem] p-8 border-none border-l-8 border-primary/50">
                      <div className="flex items-center gap-3 mb-6">
                        <Tag className="h-6 w-6 text-primary" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Market Intelligence</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-end">
                          <p className="text-3xl font-black text-slate-900">₹{selectedCrop?.estimatedPrice || "2,150"}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Per Quintal</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 rounded-xl w-fit shadow-sm">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-[10px] font-black uppercase text-primary">Rising Momentum</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

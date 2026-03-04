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
  Zap,
  Mic2,
  ChevronRight
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
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { DiagnosticTool } from "./DiagnosticTool";

export function CropDiagnostics() {
  const { t, language } = useTranslation();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedCropId, setSelectedCropId] = useState<string | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const cropsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"));
  }, [firestore]);

  const { data: crops, isLoading } = useCollection(cropsQuery);

  const selectedCrop = useMemo(() => {
    return crops?.find(c => c.id === selectedCropId) || null;
  }, [crops, selectedCropId]);

  const speakSummary = () => {
    if (!selectedCrop) return;
    const text = `${selectedCrop.name}. ${t("diagnostics")}: ${selectedCrop.symptoms || selectedCrop.diseaseName}. ${t("heritage_wisdom")}: ${selectedCrop.desiNuskha}`;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'Hindi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleManualReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;
    const formData = new FormData(e.currentTarget);
    addDocumentNonBlocking(collection(firestore, "crops"), {
      name: formData.get("cropName"),
      diseaseName: formData.get("diseaseName"),
      symptoms: formData.get("symptoms"),
      category: "User Submitted",
      isCertified: false,
      createdAt: new Date().toISOString()
    });
    setIsReportOpen(false);
    toast({ title: t("report_issue"), description: "Sent to professional expert queue." });
  };

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="space-y-12">
      <AnimatePresence mode="wait">
        {!selectedCropId ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
            <div className="space-y-4">
              <h2 className="text-4xl font-black tracking-tighter flex items-center gap-3">
                <Zap className="h-10 w-10 text-primary" /> {t("ai_scan")}
              </h2>
              <DiagnosticTool />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
                <DialogTrigger asChild>
                  <button className="h-80 rounded-[3rem] border-2 border-dashed border-primary/30 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-all group">
                    <PlusCircle className="h-14 w-14 text-primary mb-4 group-hover:scale-110 transition-transform" />
                    <p className="font-black text-xl text-primary">{t("report_issue")}</p>
                  </button>
                </DialogTrigger>
                <DialogContent className="rounded-[3rem] p-10 border-none shadow-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-black">{t("report_issue")}</DialogTitle>
                    <DialogDescription>Submit field observations for scientist verification.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleManualReport} className="space-y-6 pt-6">
                    <Input name="cropName" placeholder="Crop Name (e.g. Paddy)" required className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                    <Input name="diseaseName" placeholder="Suspected Disease" className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                    <Textarea name="symptoms" placeholder="Describe symptoms..." required className="rounded-xl bg-muted/30 border-none min-h-[120px] font-medium" />
                    <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg">{t("publish")}</Button>
                  </form>
                </DialogContent>
              </Dialog>

              {crops?.map((crop) => (
                <motion.div
                  key={crop.id}
                  whileHover={{ scale: 1.05 }}
                  className="h-80 rounded-[3rem] overflow-hidden cursor-pointer glass-card relative group shadow-xl"
                  onClick={() => setSelectedCropId(crop.id)}
                >
                  <img src={crop.imageUrl || "https://picsum.photos/seed/crop/400/400"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-10 flex flex-col justify-end">
                    <Badge className="w-fit mb-3 bg-white/20 text-white border-none font-black uppercase text-[10px] tracking-widest">{crop.category}</Badge>
                    <h3 className="text-3xl font-black text-white tracking-tight">{crop.name}</h3>
                    <ChevronRight className="h-6 w-6 text-white/50 group-hover:text-white absolute bottom-10 right-10 transition-all" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            <Button variant="ghost" onClick={() => setSelectedCropId(null)} className="gap-2 font-black uppercase text-[10px] tracking-widest bg-muted/50 hover:bg-muted rounded-full px-6">
              <ArrowLeft className="h-4 w-4" /> {t("dashboard")}
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-5">
                <Card className="rounded-[3rem] overflow-hidden shadow-2xl border-none">
                  <img src={selectedCrop?.imageUrl} className="w-full aspect-[4/5] object-cover" />
                </Card>
              </div>
              <div className="lg:col-span-7 space-y-8">
                <Card className="glass-card p-12 rounded-[3rem] space-y-10 border-none">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-4">
                        <h3 className="text-4xl font-black tracking-tighter">{t("pathogen_intel")}</h3>
                        <Button variant="ghost" size="icon" onClick={speakSummary} className="h-10 w-10 bg-primary/10 text-primary rounded-full">
                          <Mic2 className="h-5 w-5" />
                        </Button>
                      </div>
                      <p className="text-destructive text-xl font-black uppercase tracking-tight">{selectedCrop?.diseaseName}</p>
                    </div>
                    <Badge variant="destructive" className="px-6 py-1.5 font-black uppercase tracking-widest text-[10px]">{selectedCrop?.severity}</Badge>
                  </div>
                  
                  <Tabs defaultValue="diagnosis" className="w-full">
                    <TabsList className="bg-muted rounded-full p-1.5 h-14 w-full justify-start gap-2">
                      <TabsTrigger value="diagnosis" className="rounded-full h-11 px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
                        {t("diagnostics")}
                      </TabsTrigger>
                      <TabsTrigger value="remedy" className="rounded-full h-11 px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
                        {t("chemical_cure")}
                      </TabsTrigger>
                      <TabsTrigger value="desi" className="rounded-full h-11 px-8 font-black text-xs uppercase tracking-widest data-[state=active]:bg-primary data-[state=active]:text-white">
                        {t("heritage_wisdom")}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="diagnosis" className="pt-6 text-lg italic font-medium leading-relaxed text-slate-600 border-l-4 border-primary/20 pl-6">
                      {selectedCrop?.symptoms || "Intelligence analysis confirmed by agricultural protocol."}
                    </TabsContent>
                    <TabsContent value="remedy" className="pt-6">
                      <div className="p-8 bg-slate-50 rounded-[2rem] font-black text-2xl text-slate-900 border shadow-inner">
                        {selectedCrop?.chemicalCure}
                      </div>
                    </TabsContent>
                    <TabsContent value="desi" className="pt-6">
                      <div className="p-8 bg-amber-50 rounded-[2rem] italic font-medium text-xl text-amber-900 border border-amber-100 shadow-inner">
                        "{selectedCrop?.desiNuskha}"
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>

                <div className="grid grid-cols-2 gap-8">
                  <Card className="glass-card p-10 rounded-[3rem] border-l-8 border-blue-500 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                      <Droplets className="h-20 w-20" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase text-blue-600 tracking-widest mb-6">{t("irrigation")}</h4>
                    <p className="text-4xl font-black">{selectedCrop?.irrigationInterval || 7} Days</p>
                    <Progress value={75} className="mt-6 h-2 bg-blue-100" />
                  </Card>
                  <Card className="glass-card p-10 rounded-[3rem] border-l-8 border-primary relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5">
                      <TrendingUp className="h-20 w-20" />
                    </div>
                    <h4 className="text-[10px] font-black uppercase text-primary tracking-widest mb-6">{t("market")}</h4>
                    <p className="text-4xl font-black">₹{selectedCrop?.estimatedPrice || 2150}</p>
                    <Badge className="mt-6 bg-primary/10 text-primary border-none font-black text-[10px] uppercase">{t("mandi_price")}</Badge>
                  </Card>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

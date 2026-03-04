
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
  Zap
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
  const { t } = useTranslation();
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
    toast({ title: t("report_issue"), description: "Sent to expert queue." });
  };

  if (isLoading) return <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto" /></div>;

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
                  <button className="h-80 rounded-[2.5rem] border-2 border-dashed border-primary/30 flex flex-col items-center justify-center bg-primary/5 hover:bg-primary/10 transition-all">
                    <PlusCircle className="h-12 w-12 text-primary mb-4" />
                    <p className="font-black text-lg text-primary">{t("report_issue")}</p>
                  </button>
                </DialogTrigger>
                <DialogContent className="rounded-[2.5rem]">
                  <DialogHeader>
                    <DialogTitle>{t("report_issue")}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleManualReport} className="space-y-6 pt-6">
                    <Input name="cropName" placeholder="Crop Name" required />
                    <Input name="diseaseName" placeholder="Suspected Disease" />
                    <Textarea name="symptoms" placeholder="Symptoms..." required />
                    <Button type="submit" className="w-full h-12">{t("publish")}</Button>
                  </form>
                </DialogContent>
              </Dialog>

              {crops?.map((crop) => (
                <Card key={crop.id} onClick={() => setSelectedCropId(crop.id)} className="h-80 rounded-[2.5rem] overflow-hidden cursor-pointer group shadow-xl">
                  <img src={crop.imageUrl || "https://picsum.photos/seed/crop/400/400"} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-8 flex flex-col justify-end">
                    <Badge className="w-fit mb-2">{crop.category}</Badge>
                    <h3 className="text-3xl font-black text-white">{crop.name}</h3>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
            <Button variant="ghost" onClick={() => setSelectedCropId(null)} className="gap-2 font-black uppercase text-[10px]">
              <ArrowLeft className="h-4 w-4" /> {t("dashboard")}
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-5">
                <Card className="rounded-[3rem] overflow-hidden shadow-2xl">
                  <img src={selectedCrop?.imageUrl} className="w-full aspect-[4/5] object-cover" />
                </Card>
              </div>
              <div className="lg:col-span-7 space-y-8">
                <Card className="glass-card p-10 rounded-[2.5rem] space-y-8">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-3xl font-black">{t("pathogen_intel")}</h3>
                      <p className="text-destructive font-bold">{selectedCrop?.diseaseName}</p>
                    </div>
                    <Badge variant="destructive">{selectedCrop?.severity}</Badge>
                  </div>
                  <Tabs defaultValue="diagnosis">
                    <TabsList className="bg-muted rounded-full p-1 mb-6">
                      <TabsTrigger value="diagnosis" className="rounded-full">{t("diagnostics")}</TabsTrigger>
                      <TabsTrigger value="remedy" className="rounded-full">{t("chemical_cure")}</TabsTrigger>
                      <TabsTrigger value="desi" className="rounded-full">{t("heritage_wisdom")}</TabsTrigger>
                    </TabsList>
                    <TabsContent value="diagnosis" className="italic text-lg">
                      {selectedCrop?.symptoms || "Pathogen identification confirmed by scientist protocol."}
                    </TabsContent>
                    <TabsContent value="remedy">
                      <div className="p-6 bg-slate-50 rounded-2xl font-black text-xl">
                        {selectedCrop?.chemicalCure}
                      </div>
                    </TabsContent>
                    <TabsContent value="desi">
                      <div className="p-6 bg-amber-50 rounded-2xl italic font-medium text-amber-900">
                        {selectedCrop?.desiNuskha}
                      </div>
                    </TabsContent>
                  </Tabs>
                </Card>
                <div className="grid grid-cols-2 gap-8">
                  <Card className="glass-card p-8 rounded-[2.5rem] border-l-8 border-blue-500">
                    <h4 className="text-[10px] font-black uppercase text-blue-600 mb-4">{t("irrigation")}</h4>
                    <p className="text-3xl font-black">{selectedCrop?.irrigationInterval || 7} Days</p>
                    <Progress value={75} className="mt-4" />
                  </Card>
                  <Card className="glass-card p-8 rounded-[2.5rem] border-l-8 border-primary">
                    <h4 className="text-[10px] font-black uppercase text-primary mb-4">{t("market")}</h4>
                    <p className="text-3xl font-black">₹{selectedCrop?.estimatedPrice || 2150}</p>
                    <Badge className="mt-4">{t("mandi_price")}</Badge>
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

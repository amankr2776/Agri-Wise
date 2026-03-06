
'use client';

import React, { useState, useMemo } from "react";
import { 
  PlusCircle, 
  Loader2,
  ChevronRight,
  FlaskConical,
  Library,
  ShieldCheck,
  Search,
  X,
  ArrowLeft,
  Sparkles,
  Zap,
  Bot,
  Lock
} from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { query, collection } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/hooks/use-translation";
import { useAppState } from "@/lib/app-state";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CropDetailView } from "./CropDetailView";
import { DiagnosticTool } from "./DiagnosticTool";

const CATEGORIES = ["Plant", "Seed", "Vegetable", "Fruit", "Grain"];

export function CropDiagnostics() {
  const { t } = useTranslation();
  const { role, name: userName, isAuthenticated } = useAppState();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState<string>("Grain");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedCropForDetail, setSelectedCropForDetail] = useState<any>(null);
  
  const cropsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"));
  }, [firestore]);

  const { data: allCrops, isLoading } = useCollection(cropsQuery);

  const filteredCrops = useMemo(() => {
    if (!allCrops) return [];
    return allCrops.filter(crop => crop.category === selectedCategory);
  }, [allCrops, selectedCategory]);

  const handleManualReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !user) return;
    const formData = new FormData(e.currentTarget);
    addDocumentNonBlocking(collection(firestore, "crops"), {
      name: formData.get("cropName"),
      diseaseName: formData.get("diseaseName") || "Unidentified Pathogen",
      category: selectedCategory,
      symptoms: formData.get("symptoms"),
      isCertified: false,
      severity: "Warning",
      reportedBy: user.uid,
      reportedByName: userName,
      createdAt: new Date().toISOString(),
      imageUrl: `https://picsum.photos/seed/report-${Date.now()}/800/600`
    });
    setIsReportOpen(false);
    toast({ title: "Issue Reported", description: "Sent to the professional expert queue for verification." });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
            <FlaskConical className="h-10 w-10 text-primary" />
            National Precision Lab
          </h2>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Diagnostic Protocols & Expert Surveillance</p>
        </div>
        
        <Button 
          onClick={() => setIsReportOpen(true)}
          className="rounded-2xl h-14 px-8 font-black gap-2 bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-105 active:scale-95"
        >
          <PlusCircle className="h-5 w-5" /> Manual Field Report
        </Button>
      </div>

      {/* Primary Detection Agent */}
      <section className="space-y-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Bot className="h-6 w-6" />
          </div>
          <h3 className="text-2xl font-black tracking-tight">AI Detection Agent</h3>
        </div>
        <DiagnosticTool />
      </section>

      {/* Solution Library */}
      <div className="space-y-8 pt-12 border-t">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Library className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-black tracking-tight">Verified Protocol Library</h3>
          </div>
          
          <div className="flex flex-wrap gap-2 p-1.5 bg-muted/50 rounded-2xl w-fit">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "rounded-xl font-black text-xs uppercase tracking-widest px-6 h-11 transition-all",
                  selectedCategory === cat ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-primary"
                )}
              >
                {cat}s
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredCrops.map((crop) => (
                <motion.div
                  key={crop.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setSelectedCropForDetail(crop)}
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
                        <p className="text-white/60 text-xs font-bold uppercase tracking-widest">{crop.diseaseName || 'Certified Profile'}</p>
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

      {/* Crop Detail Modal */}
      <Dialog open={!!selectedCropForDetail} onOpenChange={() => setSelectedCropForDetail(null)}>
        <DialogContent className="rounded-[3rem] sm:max-w-4xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedCropForDetail?.name || "Crop Details"}</DialogTitle>
            <DialogDescription>Detailed scientific profile and AI diagnostic tools for {selectedCropForDetail?.name}</DialogDescription>
          </DialogHeader>
          {selectedCropForDetail && (
            <CropDetailView 
              crop={selectedCropForDetail} 
              onClose={() => setSelectedCropForDetail(null)} 
            />
          )}
        </DialogContent>
      </Dialog>

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

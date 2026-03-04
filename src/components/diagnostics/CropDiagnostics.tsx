
'use client';

import React, { useState, useMemo } from "react";
import { 
  ArrowLeft, 
  PlusCircle, 
  Droplets, 
  TrendingUp, 
  TrendingDown,
  ShieldCheck, 
  FlaskConical,
  Loader2,
  Tag,
  Zap,
  Mic2,
  ChevronRight,
  Search,
  Settings2,
  Calendar,
  Mountain,
  Edit2,
  Save,
  X
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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

export function CropDiagnostics() {
  const { t, language } = useTranslation();
  const { role } = useAppState();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [selectedCategory, setSelectedCategory] = useState<string>("Plant");
  const [searchQuery, setSearchQuery] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState("");

  const cropsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"));
  }, [firestore]);

  const { data: allCrops, isLoading } = useCollection(cropsQuery);

  const filteredCrops = useMemo(() => {
    if (!allCrops) return [];
    return allCrops.filter(crop => {
      const matchesCategory = crop.category === selectedCategory;
      const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           (crop.diseaseName?.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [allCrops, selectedCategory, searchQuery]);

  const speakCropDetails = (crop: any) => {
    const text = `${crop.name}. Irrigation interval: Every ${crop.irrigationInterval} days. Estimated market price: ${crop.estimatedMarketPrice} rupees per quintal. Sowing season: ${crop.sowingSeason}. Recommended soil: ${crop.soilType}. Diagnosis: ${crop.symptoms || crop.diseaseName}.`;
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'Hindi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleUpdatePrice = (cropId: string) => {
    if (!firestore || !newPrice) return;
    updateDocumentNonBlocking(doc(firestore, "crops", cropId), {
      estimatedMarketPrice: Number(newPrice)
    });
    setEditingPriceId(null);
    toast({ title: "Price Updated", description: "The global market registry has been updated." });
  };

  const handleManualReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore) return;
    const formData = new FormData(e.currentTarget);
    addDocumentNonBlocking(collection(firestore, "crops"), {
      name: formData.get("cropName"),
      diseaseName: formData.get("diseaseName"),
      category: selectedCategory,
      symptoms: formData.get("symptoms"),
      isCertified: false,
      createdAt: new Date().toISOString()
    });
    setIsReportOpen(false);
    toast({ title: t("report_issue"), description: "Sent to professional expert queue." });
  };

  return (
    <div className="space-y-12">
      <div className="space-y-6">
        <h2 className="text-4xl font-black tracking-tighter flex items-center gap-3">
          <Zap className="h-10 w-10 text-primary" /> {t("ai_scan")}
        </h2>
        <DiagnosticTool />
      </div>

      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex flex-wrap gap-2 p-1.5 bg-muted/50 rounded-2xl">
            {CATEGORIES.map(cat => (
              <Button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                variant={selectedCategory === cat ? "default" : "ghost"}
                className={cn(
                  "rounded-xl font-black text-xs uppercase tracking-widest px-6 h-11",
                  selectedCategory === cat ? "bg-primary text-white shadow-lg" : "text-muted-foreground"
                )}
              >
                {cat}s
              </Button>
            ))}
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or pest..."
              className="pl-12 h-12 rounded-2xl bg-white/70 border-none shadow-sm font-bold"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
        ) : filteredCrops.length === 0 ? (
          <div className="p-20 text-center glass-card rounded-[3rem] space-y-4">
            <Search className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
            <h3 className="text-2xl font-black">No results found for "{searchQuery}"</h3>
            <Button variant="outline" onClick={() => setSearchQuery("")} className="rounded-xl">Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-10">
            <AnimatePresence mode="popLayout">
              {filteredCrops.map((crop) => (
                <motion.div
                  key={crop.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative"
                >
                  <Card className="glass-card rounded-[3rem] overflow-hidden border-none shadow-xl hover:shadow-2xl transition-all duration-500">
                    <div className="grid grid-cols-1 lg:grid-cols-12">
                      {/* Column 1: Image */}
                      <div className="lg:col-span-4 h-64 lg:h-auto relative overflow-hidden">
                        <img 
                          src={crop.imageUrl || "https://picsum.photos/seed/agri/800/800"} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-6 left-6 flex items-center gap-3">
                          <Button 
                            onClick={() => speakCropDetails(crop)} 
                            className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-primary transition-all"
                          >
                            <Mic2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>

                      {/* Column 2: Pest & Disease Info */}
                      <div className="lg:col-span-4 p-10 space-y-6 bg-white/50 border-r border-white/20">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <Badge className="bg-primary/20 text-primary border-none font-black text-[10px] uppercase tracking-widest">
                              {crop.category}
                            </Badge>
                            <Badge variant={crop.severity === 'Critical' ? 'destructive' : 'default'} className="font-black text-[10px] uppercase">
                              {crop.severity}
                            </Badge>
                          </div>
                          <h3 className="text-4xl font-black tracking-tighter">{crop.name}</h3>
                          <p className="text-destructive font-black uppercase text-xs tracking-tight">{crop.diseaseName}</p>
                        </div>

                        <Tabs defaultValue="diagnosis" className="w-full">
                          <TabsList className="bg-muted rounded-full p-1 h-10 w-full mb-4">
                            <TabsTrigger value="diagnosis" className="rounded-full text-[9px] uppercase font-black tracking-widest">Diagnosis</TabsTrigger>
                            <TabsTrigger value="cure" className="rounded-full text-[9px] uppercase font-black tracking-widest">Cure</TabsTrigger>
                            <TabsTrigger value="natural" className="rounded-full text-[9px] uppercase font-black tracking-widest">Natural</TabsTrigger>
                          </TabsList>
                          <TabsContent value="diagnosis" className="text-sm font-medium text-slate-600 leading-relaxed italic">
                            {crop.symptoms || "Intelligence analysis confirmed by agricultural protocol."}
                          </TabsContent>
                          <TabsContent value="cure" className="text-sm font-bold text-destructive">
                            {crop.chemicalCure} ({crop.chemicalDosage})
                          </TabsContent>
                          <TabsContent value="natural" className="text-sm font-bold text-primary italic">
                            {crop.desiNuskha}
                          </TabsContent>
                        </Tabs>
                      </div>

                      {/* Column 3: Smart Farming Summary */}
                      <div className="lg:col-span-4 p-10 space-y-8 bg-slate-50/50">
                        <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Smart Farming Summary</h4>
                        
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-blue-600">
                              <Droplets className="h-4 w-4" />
                              <span className="text-[10px] font-black uppercase">Irrigation</span>
                            </div>
                            <p className="text-lg font-black tracking-tight">Every {crop.irrigationInterval || 7} Days</p>
                            <Progress value={65} className="h-1 bg-blue-100" />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-amber-600">
                              <Calendar className="h-4 w-4" />
                              <span className="text-[10px] font-black uppercase">Season</span>
                            </div>
                            <p className="text-lg font-black tracking-tight">{crop.sowingSeason || "Kharif"}</p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Mountain className="h-4 w-4" />
                              <span className="text-[10px] font-black uppercase">Soil Type</span>
                            </div>
                            <p className="text-lg font-black tracking-tight">{crop.soilType || "Loamy"}</p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-primary">
                              <Tag className="h-4 w-4" />
                              <span className="text-[10px] font-black uppercase">Market Value</span>
                            </div>
                            {editingPriceId === crop.id ? (
                              <div className="flex gap-1 animate-in slide-in-from-right-2">
                                <Input 
                                  value={newPrice} 
                                  onChange={(e) => setNewPrice(e.target.value)}
                                  className="h-8 w-20 rounded-lg text-xs font-black"
                                  autoFocus
                                />
                                <Button size="icon" className="h-8 w-8 rounded-lg bg-primary" onClick={() => handleUpdatePrice(crop.id)}><Save className="h-4 w-4"/></Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => setEditingPriceId(null)}><X className="h-4 w-4"/></Button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="text-xl font-black text-primary">₹{crop.estimatedMarketPrice?.toLocaleString() || "2,150"}</p>
                                <TrendingUp className="h-4 w-4 text-primary animate-bounce" />
                                {role === 'Authority' && (
                                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={() => { setEditingPriceId(crop.id); setNewPrice(crop.estimatedMarketPrice?.toString() || ""); }}>
                                    <Edit2 className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="pt-6 border-t border-slate-200">
                          <Button className="w-full h-12 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/10">
                            Apply Optimized Protocol
                          </Button>
                        </div>
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
  );
}


'use client';

import React, { useState, useMemo } from "react";
import { 
  Search, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  ShieldCheck,
  Droplets,
  Tag,
  TrendingUp,
  TrendingDown,
  Info,
  Beaker,
  Leaf,
  Bug,
  LayoutGrid,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { query, collection, doc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppState } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { DiagnosticTool } from "./DiagnosticTool";

const CATEGORIES = ["All", "Plant", "Seed", "Vegetable", "Fruit", "Grain"];

export function CropDiagnostics() {
  const firestore = useFirestore();
  const { role } = useAppState();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  const cropsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"));
  }, [firestore]);

  const { data: crops, isLoading } = useCollection(cropsQuery);

  const filteredCrops = useMemo(() => {
    if (!crops) return [];
    return crops.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.diseaseName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [crops, search, selectedCategory]);

  const handleReadAloud = (crop: any) => {
    if ("speechSynthesis" in window) {
      if (isSpeaking === crop.id) {
        window.speechSynthesis.cancel();
        setIsSpeaking(null);
      } else {
        const text = `${crop.name} overview. Irrigation needed every ${crop.irrigationInterval} days. Current market price is ${crop.estimatedPrice} rupees per quintal. Soil type required is ${crop.soilType}.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(null);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(crop.id);
      }
    }
  };

  const handleUpdatePrice = (cropId: string, currentPrice: number) => {
    if (!firestore) return;
    const newPrice = prompt("Enter new market price (₹/q):", currentPrice.toString());
    if (newPrice && !isNaN(Number(newPrice))) {
      const docRef = doc(firestore, "crops", cropId);
      updateDocumentNonBlocking(docRef, { estimatedPrice: Number(newPrice) });
      toast({ title: "Price Updated", description: "Global market value has been adjusted." });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-96 rounded-[2.5rem]" />)}
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex gap-2 p-1 bg-muted rounded-full w-fit">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "ghost"}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "rounded-full px-6 h-10 font-black text-xs uppercase tracking-widest transition-all",
                selectedCategory === cat ? "shadow-lg shadow-primary/20" : "text-muted-foreground"
              )}
            >
              {cat}
            </Button>
          ))}
        </div>
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search crop or disease..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-11 rounded-full bg-white border-none shadow-sm h-12 font-bold"
          />
        </div>
      </div>

      <Tabs defaultValue="registry" className="w-full">
        <div className="flex justify-center mb-10">
          <TabsList className="bg-muted rounded-full p-1 h-12 shadow-inner">
            <TabsTrigger value="registry" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest transition-all">
              <LayoutGrid className="h-4 w-4 mr-2" /> Crop Registry
            </TabsTrigger>
            <TabsTrigger value="scan" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest transition-all">
              <Zap className="h-4 w-4 mr-2" /> Manual AI Scan
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="registry">
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredCrops.map((crop) => (
              <Card key={crop.id} className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 group flex flex-col">
                {/* Column 1: Image & Basic Overlay */}
                <div className="relative aspect-video w-full overflow-hidden">
                  <img 
                    src={crop.imageUrl || `https://picsum.photos/seed/${crop.id}/800/400`} 
                    alt={crop.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-8 right-8 flex justify-between items-end">
                    <div className="space-y-1">
                      <Badge className="bg-primary/90 text-white border-none text-[10px] font-black uppercase tracking-widest px-3">
                        {crop.category}
                      </Badge>
                      <h2 className="text-3xl font-black text-white tracking-tighter">{crop.name}</h2>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleReadAloud(crop)}
                      className="rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 h-12 w-12"
                    >
                      {isSpeaking === crop.id ? <VolumeX className="animate-pulse" /> : <Volume2 />}
                    </Button>
                  </div>
                </div>

                {/* Column 2 & 3: Content Grid */}
                <CardContent className="p-8 space-y-8 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Column 2: Pest & Disease */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Bug className="h-5 w-5 text-destructive" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-destructive">Pathogen Intel</h3>
                      </div>
                      <div className="p-5 bg-destructive/5 rounded-3xl border border-destructive/10">
                        <p className="text-lg font-black text-slate-800">{crop.diseaseName}</p>
                        <Badge variant={crop.severity === 'Critical' ? 'destructive' : 'default'} className="mt-2 text-[8px] font-black uppercase">
                          {crop.severity} Risk
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Tag className="h-5 w-5 text-primary" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Market Value</h3>
                      </div>
                      <div className="flex items-center justify-between p-5 bg-primary/5 rounded-3xl border border-primary/10">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-black text-slate-900">₹{crop.estimatedPrice}</span>
                          <span className="text-[10px] font-bold text-muted-foreground">/q</span>
                        </div>
                        {crop.estimatedPrice > 3000 ? <TrendingUp className="text-primary h-6 w-6" /> : <TrendingDown className="text-destructive h-6 w-6" />}
                        {role === 'Authority' && (
                          <Button variant="ghost" size="sm" className="h-8 rounded-xl font-bold text-primary" onClick={() => handleUpdatePrice(crop.id, crop.estimatedPrice)}>
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Column 3: Smart Farming Summary */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Droplets className="h-5 w-5 text-blue-500" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600">Irrigation Gauge</h3>
                      </div>
                      <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-blue-900">
                          <span>Every {crop.irrigationInterval} Days</span>
                          <span>Active Cycle</span>
                        </div>
                        <Progress value={75} className="h-2 bg-blue-200" />
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <ShieldCheck className="h-5 w-5 text-amber-600" />
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-700">Agronomy Summary</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                          <p className="text-[8px] font-black text-muted-foreground uppercase">Soil</p>
                          <p className="text-[10px] font-bold text-slate-800">{crop.soilType}</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center">
                          <p className="text-[8px] font-black text-muted-foreground uppercase">Season</p>
                          <p className="text-[10px] font-bold text-slate-800">{crop.sowingSeason}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pest Solution Tabs Inside Card */}
                  <Tabs defaultValue="diagnosis" className="w-full">
                    <TabsList className="bg-muted/50 rounded-2xl p-1 h-11 w-full flex">
                      <TabsTrigger value="diagnosis" className="flex-1 rounded-xl text-[10px] font-black uppercase h-9 data-[state=active]:bg-white">Diagnosis</TabsTrigger>
                      <TabsTrigger value="chemical" className="flex-1 rounded-xl text-[10px] font-black uppercase h-9 data-[state=active]:bg-white">Chemical</TabsTrigger>
                      <TabsTrigger value="desi" className="flex-1 rounded-xl text-[10px] font-black uppercase h-9 data-[state=active]:bg-white">Natural</TabsTrigger>
                    </TabsList>
                    <div className="mt-4 min-h-[100px] flex items-center justify-center">
                      <TabsContent value="diagnosis" className="animate-in fade-in duration-300 w-full">
                        <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-4 border-primary/20 pl-4">
                          Symptoms: Leaf lesions, wilting, and standard pathogen indicators for {crop.name}.
                        </p>
                      </TabsContent>
                      <TabsContent value="chemical" className="animate-in fade-in duration-300 w-full">
                        <div className="bg-destructive/5 p-4 rounded-2xl border border-destructive/10 space-y-1">
                          <p className="text-xs font-black text-destructive uppercase">Formulation</p>
                          <p className="text-sm font-bold text-slate-800">{crop.chemicalCure} @ {crop.chemicalDosage}</p>
                        </div>
                      </TabsContent>
                      <TabsContent value="desi" className="animate-in fade-in duration-300 w-full">
                        <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 space-y-1">
                          <p className="text-xs font-black text-primary uppercase">Heritage Wisdom</p>
                          <p className="text-sm font-medium italic text-slate-700">"{crop.desiNuskha}"</p>
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </CardContent>

                <CardFooter className="p-8 pt-0 border-t bg-slate-50/30 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {crop.isCertified ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 font-bold flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Certified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground border-slate-300 font-bold italic">
                        Unverified
                      </Badge>
                    )}
                  </div>
                  <Button variant="link" className="text-primary font-black text-xs uppercase group-hover:underline">
                    View Full Protocol
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {filteredCrops.length === 0 && (
            <div className="text-center py-40 bg-muted/20 rounded-[4rem] border-2 border-dashed border-border/50">
              <Info className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
              <h3 className="text-2xl font-black text-slate-800">No Registry Match</h3>
              <p className="text-muted-foreground mt-2 font-medium">Try adjusting your filters or performing an AI scan.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="scan">
          <DiagnosticTool />
        </TabsContent>
      </Tabs>
    </div>
  );
}


'use client';

import React, { useState, useMemo } from "react";
import { 
  Leaf, 
  Bug, 
  Search, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  ShieldCheck,
  FlaskConical,
  Beaker,
  Info,
  ShieldAlert,
  Droplets,
  AlertTriangle,
  Database
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { query, collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Grain", "Vegetable", "Fruit", "Oilseed", "Plantation", "Spice", "Cash Crop"];

export function CropDiagnostics() {
  const firestore = useFirestore();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const cropsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"));
  }, [firestore]);

  const { data: crops, isLoading } = useCollection(cropsQuery);

  const filteredCrops = useMemo(() => {
    if (!crops) return [];
    return crops.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                          c.category.toLowerCase().includes(search.toLowerCase()) ||
                          c.diseaseName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [crops, search, selectedCategory]);

  const selectedCrop = useMemo(() => 
    crops?.find(c => c.id === selectedId), 
  [crops, selectedId]);

  const handleReadAloud = (text: string) => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-12rem)] grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Skeleton className="lg:col-span-4 rounded-3xl" />
        <Skeleton className="lg:col-span-8 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)] grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Sidebar - Crop List */}
      <Card className="lg:col-span-4 border-none shadow-sm flex flex-col overflow-hidden rounded-3xl bg-white/50 backdrop-blur-sm">
        <CardHeader className="p-6 border-b space-y-4">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Bug className="h-6 w-6 text-primary" />
            Agri-Health Registry
          </CardTitle>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search Paddy, Mango, Tomato..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-full bg-muted/50 border-none focus-visible:ring-primary/20 h-10"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <Badge
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  className={cn(
                    "cursor-pointer px-3 py-1 text-[10px] font-bold uppercase transition-all whitespace-nowrap",
                    selectedCategory === cat ? "bg-primary text-white" : "text-muted-foreground hover:bg-primary/10"
                  )}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </Badge>
              ))}
            </div>
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {filteredCrops.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl transition-all border border-transparent group",
                  selectedId === c.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-muted/50 border-border/50 bg-white"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold text-sm">{c.diseaseName}</span>
                  <Badge variant={selectedId === c.id ? "outline" : "secondary"} className={cn(
                    "text-[8px] uppercase font-bold px-1.5 h-4",
                    selectedId === c.id ? "border-white/40 text-white" : ""
                  )}>
                    {c.severity}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn("text-[9px] font-bold uppercase tracking-wider", selectedId === c.id ? "text-white/70" : "text-muted-foreground")}>
                    {c.name} • {c.category}
                  </span>
                  {c.isCertified && <CheckCircle className={cn("h-3 w-3", selectedId === c.id ? "text-white" : "text-primary")} />}
                </div>
              </button>
            ))}
            {filteredCrops.length === 0 && (
              <div className="text-center py-24 opacity-50 flex flex-col items-center gap-4">
                <Database className="h-12 w-12 text-muted-foreground/30" />
                <div className="space-y-1">
                  <p className="text-xs font-black uppercase tracking-widest">Registry Empty</p>
                  <p className="text-[10px] max-w-[200px] mx-auto leading-relaxed">Switch identity to 'Expert' and use the 'Populate' tool in the portal to seed the diagnostic data.</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* Right Panel - Details */}
      <Card className="lg:col-span-8 border-none shadow-sm flex flex-col rounded-3xl bg-white overflow-hidden">
        {selectedCrop ? (
          <>
            <div className="aspect-video w-full overflow-hidden relative group">
              <img 
                src={selectedCrop.imageUrl || `https://picsum.photos/seed/${selectedCrop.id}/800/400`} 
                alt={selectedCrop.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-8 text-white space-y-2 w-full">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-primary hover:bg-primary border-none text-[10px] font-black uppercase tracking-widest">
                      {selectedCrop.category}
                    </Badge>
                    {selectedCrop.isCertified && (
                      <Badge variant="outline" className="border-primary/50 text-primary bg-primary/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Expert Verified
                      </Badge>
                    )}
                  </div>
                  <Button 
                    variant="ghost"
                    onClick={() => handleReadAloud(`${selectedCrop.diseaseName} treatment for ${selectedCrop.name}. ${selectedCrop.chemicalCure}. ${selectedCrop.desiNuskha}`)}
                    className="rounded-full h-12 w-12 bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-white/40"
                  >
                    {isSpeaking ? <VolumeX className="h-6 w-6 animate-pulse" /> : <Volume2 className="h-6 w-6" />}
                  </Button>
                </div>
                <h2 className="text-4xl font-black tracking-tighter">{selectedCrop.diseaseName}</h2>
                <p className="text-white/70 text-sm font-medium italic">
                  Critical diagnostic profile for {selectedCrop.name} crop.
                </p>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-8 space-y-8">
                {/* Pathogen Profile */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/30 rounded-2xl space-y-1 border border-border/50">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Target Pathogen/Pest</p>
                    <p className="text-sm font-bold flex items-center gap-2"><Bug className="h-4 w-4 text-primary" /> {selectedCrop.diseaseName}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-2xl space-y-1 border border-border/50">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Crop Category</p>
                    <p className="text-sm font-bold flex items-center gap-2"><Leaf className="h-4 w-4 text-primary" /> {selectedCrop.category}</p>
                  </div>
                  <div className="p-4 bg-muted/30 rounded-2xl space-y-1 border border-border/50">
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Biosecurity Severity</p>
                    <Badge variant={selectedCrop.severity === 'Critical' ? 'destructive' : 'default'} className="text-[10px] h-5 px-2 uppercase font-black">
                      {selectedCrop.severity}
                    </Badge>
                  </div>
                </div>

                <Tabs defaultValue="chemical" className="w-full">
                  <TabsList className="bg-muted rounded-full p-1 h-12 mb-8 w-fit shadow-inner">
                    <TabsTrigger value="chemical" className="rounded-full px-8 h-10 data-[state=active]:bg-white data-[state=active]:text-primary font-black text-xs uppercase tracking-widest transition-all">
                      <Beaker className="h-4 w-4 mr-2" /> Chemical Protocol
                    </TabsTrigger>
                    <TabsTrigger value="desi" className="rounded-full px-8 h-10 data-[state=active]:bg-white data-[state=active]:text-primary font-black text-xs uppercase tracking-widest transition-all">
                      <Leaf className="h-4 w-4 mr-2" /> Heritage Wisdom
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="chemical" className="animate-in fade-in duration-500 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-none bg-primary/5 p-8 rounded-[2rem] shadow-sm">
                        <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4" /> Active Treatment Agent
                        </h4>
                        <div className="space-y-4">
                          <div>
                            <p className="text-2xl font-black text-slate-900">{selectedCrop.chemicalCure || 'Scanning...'}</p>
                            <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-tight">Main Pesticide/Fungicide</p>
                          </div>
                          <div className="pt-4 border-t flex justify-between items-center">
                            <span className="text-[10px] font-black uppercase text-muted-foreground">Standard Dosage</span>
                            <Badge variant="outline" className="font-bold border-primary/20 text-primary text-sm px-3 h-8 bg-white">
                              {selectedCrop.chemicalDosage || 'Consult Expert'}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                      
                      <Card className="border-none bg-slate-50 p-8 rounded-[2rem] shadow-sm border border-slate-100">
                        <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Application Directives</h4>
                        <ul className="space-y-3">
                          {[
                            'Apply during low wind speeds',
                            'Use certified spray equipment',
                            'Maintain 7-10 day interval if re-applying',
                            'Wear PPE during formulation'
                          ].map((s, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                              <CheckCircle className="h-4 w-4 text-primary shrink-0" /> {s}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="desi" className="animate-in fade-in duration-500 space-y-6">
                    <div className="bg-amber-50/50 p-10 rounded-[2.5rem] border border-amber-100 relative overflow-hidden shadow-inner">
                      <div className="relative z-10">
                        <div className="flex justify-between items-start mb-8">
                          <div>
                            <h4 className="text-2xl font-black text-amber-900 mb-1">Traditional Desi Nuskha</h4>
                            <p className="text-xs font-bold text-amber-700/60 uppercase tracking-widest">Heritage-Based Solution</p>
                          </div>
                          {selectedCrop.isCertified && (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-bold px-4 py-1">Verified Remedy</Badge>
                          )}
                        </div>
                        
                        <p className="text-xl font-medium leading-relaxed text-slate-800 italic border-l-4 border-amber-200 pl-6 py-2 bg-white/40 rounded-r-2xl">
                          "{selectedCrop.desiNuskha || 'No traditional remedy recorded for this specific variant.'}"
                        </p>
                      </div>
                    </div>
                    <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex gap-4">
                      <Info className="h-6 w-6 text-primary shrink-0" />
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        Desi Nuskhas are regional. For precision results, combine with optimized irrigation and soil management practices.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6 bg-muted/10">
            <div className="h-32 w-32 bg-white rounded-full flex items-center justify-center shadow-xl shadow-primary/10">
              <FlaskConical className="h-16 w-16 text-primary/30" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight">Select Diagnostic Profile</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                Browse the registry to view high-fidelity diagnostic data, verified chemical cures, and traditional Indian remedies.
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="opacity-40">{crops?.length || 0} Crops Tracked</Badge>
              <Badge variant="outline" className="opacity-40">Verified Remedies</Badge>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

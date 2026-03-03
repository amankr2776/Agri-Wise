
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
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { query, collection } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/app-state";

export function CropDiagnostics() {
  const { firestore } = useFirestore();
  const { role } = useAppState();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const cropsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "crops"));
  }, [firestore]);

  const { data: crops, isLoading } = useCollection(cropsQuery);

  const filteredCrops = useMemo(() => {
    if (!crops) return [];
    return crops.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.category.toLowerCase().includes(search.toLowerCase()) ||
      c.diseaseName.toLowerCase().includes(search.toLowerCase())
    );
  }, [crops, search]);

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
        <CardHeader className="p-6 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Bug className="h-6 w-6 text-primary" />
            Bio-Intelligence
          </CardTitle>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search Paddy, Wheat, Rust..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-muted/50 border-none focus-visible:ring-primary/20"
            />
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
                  selectedId === c.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-muted/50"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold">{c.diseaseName}</span>
                  <Badge variant={selectedId === c.id ? "outline" : "secondary"} className={cn(
                    "text-[10px] uppercase font-bold",
                    selectedId === c.id ? "border-white/40 text-white" : ""
                  )}>
                    {c.severity}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider", selectedId === c.id ? "text-white/70" : "text-muted-foreground")}>
                    {c.name} • {c.category}
                  </span>
                  {c.isCertified && <CheckCircle className={cn("h-3 w-3", selectedId === c.id ? "text-white" : "text-primary")} />}
                </div>
              </button>
            ))}
            {filteredCrops.length === 0 && (
              <div className="text-center py-12 opacity-50">
                <Search className="h-8 w-8 mx-auto mb-2" />
                <p className="text-xs font-bold uppercase">No results found</p>
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
              <div className="absolute bottom-0 left-0 p-8 text-white space-y-2">
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
                <h2 className="text-4xl font-black tracking-tighter">{selectedCrop.diseaseName}</h2>
                <p className="text-white/70 text-sm font-medium italic max-w-xl line-clamp-2">
                  {selectedCrop.description}
                </p>
              </div>
              <Button 
                onClick={() => handleReadAloud(`${selectedCrop.diseaseName} treatment. ${selectedCrop.chemicalCure}. ${selectedCrop.desiNuskha}`)}
                className="absolute top-6 right-6 rounded-full h-14 w-14 bg-white/20 backdrop-blur-md border-white/20 text-white hover:bg-white/40"
              >
                {isSpeaking ? <VolumeX className="h-6 w-6 animate-pulse" /> : <Volume2 className="h-6 w-6" />}
              </Button>
            </div>

            <Tabs defaultValue="chemical" className="flex-1 flex flex-col p-8">
              <TabsList className="bg-muted rounded-full p-1 h-12 mb-8 w-fit shadow-inner">
                <TabsTrigger value="chemical" className="rounded-full px-8 h-10 data-[state=active]:bg-white data-[state=active]:text-primary font-black text-xs uppercase tracking-widest transition-all">
                  <Beaker className="h-4 w-4 mr-2" /> Chemical Cure
                </TabsTrigger>
                <TabsTrigger value="desi" className="rounded-full px-8 h-10 data-[state=active]:bg-white data-[state=active]:text-primary font-black text-xs uppercase tracking-widest transition-all">
                  <Leaf className="h-4 w-4 mr-2" /> Desi Nuskha
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chemical" className="flex-1 space-y-6 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-none bg-muted/30 p-8 rounded-[2rem] shadow-inner">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Prescription Protocol</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="text-2xl font-black text-primary">{selectedCrop.chemicalCure || 'Scanning...'}</p>
                        <p className="text-xs font-bold text-muted-foreground mt-1">Primary Active Agent</p>
                      </div>
                      <div className="pt-4 border-t flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-muted-foreground">Dosage</span>
                        <span className="font-bold text-slate-800">{selectedCrop.chemicalDosage || '2.5g / Litre'}</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="border-none bg-muted/30 p-8 rounded-[2rem] shadow-inner">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Safety Directives</h4>
                    <ul className="space-y-3">
                      {['Wear Protective Gear', 'Spray during calm winds', 'Early morning application'].map((s, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                          <CheckCircle className="h-4 w-4 text-primary shrink-0" /> {s}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
                {(role === 'Expert' || role === 'Authority') && (
                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" className="flex-1 rounded-2xl border-primary/20 text-primary font-bold h-12">
                      Edit Treatment Data
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="desi" className="flex-1 space-y-6 animate-in fade-in duration-500">
                <div className="bg-primary/5 p-10 rounded-[2.5rem] border border-primary/10 relative overflow-hidden">
                  <Leaf className="absolute -top-10 -right-10 h-40 w-40 text-primary/5 rotate-12" />
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h4 className="text-2xl font-black text-primary mb-1">Traditional Remediation</h4>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Heritage-Based Solution</p>
                      </div>
                      {selectedCrop.isCertified && (
                        <Badge className="bg-primary/20 text-primary border-none font-bold px-4 py-1">Verified Efficacy</Badge>
                      )}
                    </div>
                    
                    <p className="text-lg font-medium leading-relaxed text-slate-700 italic border-l-4 border-primary/20 pl-6 py-2">
                      "{selectedCrop.desiNuskha || 'No traditional remedy recorded for this specific variant.'}"
                    </p>
                  </div>
                </div>
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                  <Info className="h-6 w-6 text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-800 font-medium leading-relaxed italic">
                    Note: Desi Nuskhas are regional. Consult with a verified KisanMitra Expert before large-scale application in verified clusters.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-6 bg-muted/10">
            <div className="h-32 w-32 bg-white rounded-full flex items-center justify-center shadow-xl shadow-primary/10">
              <FlaskConical className="h-16 w-16 text-primary/30" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight">Intelligence Node Inactive</h3>
              <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                Select a crop profile from the bio-intelligence registry to load specific pathogen diagnostics and verified treatments.
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="opacity-40">40+ Registered Crops</Badge>
              <Badge variant="outline" className="opacity-40">120+ Verified Remedies</Badge>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

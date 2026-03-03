'use client';

import React, { useState } from "react";
import { 
  Leaf, 
  Bug, 
  FlaskConical, 
  Search, 
  CheckCircle, 
  Volume2, 
  VolumeX, 
  ArrowRight,
  ShieldCheck,
  Star,
  ThumbsUp,
  ThumbsDown,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const DISEASES = [
  { id: "1", name: "Rice Blast", crop: "Rice", severity: "High", verified: true, desc: "Caused by fungus, creates diamond-shaped lesions on leaves." },
  { id: "2", name: "Wheat Rust", crop: "Wheat", severity: "High", verified: true, desc: "Fungal infection creating orange-brown pustules on stems and leaves." },
  { id: "3", name: "Cotton Bollworm", crop: "Cotton", severity: "Critical", verified: true, desc: "Larvae that feed extensively on cotton bolls." },
  { id: "4", name: "Tomato Late Blight", crop: "Tomato", severity: "Medium", verified: true, desc: "Dark spots on leaves, rapidly kills plants in humid weather." },
  { id: "5", name: "Mustard Aphid", crop: "Mustard", severity: "Medium", verified: false, desc: "Small insects sucking sap, causing curling and yellowing." },
  { id: "6", name: "Potato Scab", crop: "Potato", severity: "Low", verified: true, desc: "Surface lesions that affect the appearance of tubers." },
  { id: "7", name: "Sugarcane Red Rot", crop: "Sugarcane", severity: "High", verified: true, desc: "Reddening of internal tissues, causing the plant to wilt." },
  { id: "8", name: "Maize Stem Borer", crop: "Maize", severity: "Medium", verified: true, desc: "Tunnels through the stalk, weakening the plant." },
];

export function CropDiagnostics() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const selectedDisease = DISEASES.find(d => d.id === selectedId);
  const filteredDiseases = DISEASES.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.crop.toLowerCase().includes(search.toLowerCase())
  );

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

  return (
    <div className="h-[calc(100vh-12rem)] grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Sidebar - Disease List */}
      <Card className="lg:col-span-4 border-none shadow-sm flex flex-col overflow-hidden rounded-3xl">
        <CardHeader className="p-6 border-b">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Bug className="h-6 w-6 text-primary" />
            Bio-Intelligence
          </CardTitle>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search crop or disease..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 rounded-full bg-muted border-none"
            />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {filteredDiseases.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedId(d.id)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl transition-all border border-transparent",
                  selectedId === d.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-muted"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-bold">{d.name}</span>
                  <Badge variant={selectedId === d.id ? "outline" : "secondary"} className={cn(
                    "text-[10px] uppercase font-bold",
                    selectedId === d.id ? "border-white/40 text-white" : ""
                  )}>
                    {d.severity}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn("text-xs", selectedId === d.id ? "text-white/70" : "text-muted-foreground")}>
                    Crop: {d.crop}
                  </span>
                  {d.verified && <CheckCircle className={cn("h-3 w-3", selectedId === d.id ? "text-white" : "text-primary")} />}
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Right Panel - Treatment Details */}
      <Card className="lg:col-span-8 border-none shadow-sm flex flex-col rounded-3xl">
        {selectedDisease ? (
          <>
            <CardHeader className="p-8 border-b bg-muted/30">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-primary/20 text-primary border-none text-[10px] uppercase font-bold tracking-widest">
                      {selectedDisease.crop}
                    </Badge>
                    <Badge variant="destructive" className="text-[10px] uppercase font-bold">
                      {selectedDisease.severity} Priority
                    </Badge>
                    {selectedDisease.verified && (
                      <Badge variant="outline" className="text-[10px] uppercase font-bold flex items-center gap-1 border-primary/30 text-primary">
                        <ShieldCheck className="h-3 w-3" /> Expert Verified
                      </Badge>
                    )}
                  </div>
                  <h2 className="text-3xl font-black tracking-tight">{selectedDisease.name}</h2>
                  <p className="text-muted-foreground text-sm max-w-2xl">{selectedDisease.desc}</p>
                </div>
                <Button 
                  onClick={() => handleReadAloud(`${selectedDisease.name} on ${selectedDisease.crop}. ${selectedDisease.desc}`)}
                  variant="outline"
                  className="rounded-full h-12 w-12 p-0 border-primary/20 text-primary hover:bg-primary hover:text-white"
                >
                  {isSpeaking ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </Button>
              </div>
            </CardHeader>

            <Tabs defaultValue="chemical" className="flex-1 flex flex-col p-8">
              <TabsList className="bg-muted rounded-full p-1 h-12 mb-8 w-fit">
                <TabsTrigger value="chemical" className="rounded-full px-8 h-10 data-[state=active]:bg-white data-[state=active]:text-primary font-bold">
                  Chemical Cure
                </TabsTrigger>
                <TabsTrigger value="desi" className="rounded-full px-8 h-10 data-[state=active]:bg-white data-[state=active]:text-primary font-bold">
                  Desi Nuskha
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chemical" className="flex-1 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-none bg-muted/50 p-6 rounded-2xl">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Recommended Product</h4>
                    <p className="text-xl font-bold text-primary mb-2">Mancozeb 75% WP</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dosage</span>
                        <span className="font-bold">2.5g / Litre</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frequency</span>
                        <span className="font-bold">Every 10-15 days</span>
                      </div>
                    </div>
                  </Card>
                  <Card className="border-none bg-muted/50 p-6 rounded-2xl">
                    <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Safety Protocol</h4>
                    <ul className="space-y-2 text-sm font-medium">
                      <li className="flex items-center gap-2"><ArrowRight className="h-3 w-3 text-primary" /> Wear protective gloves</li>
                      <li className="flex items-center gap-2"><ArrowRight className="h-3 w-3 text-primary" /> Spray during early morning</li>
                      <li className="flex items-center gap-2"><ArrowRight className="h-3 w-3 text-primary" /> Avoid spray during windy days</li>
                    </ul>
                  </Card>
                </div>
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4">
                  <Info className="h-6 w-6 text-amber-500 shrink-0" />
                  <p className="text-sm text-amber-800 italic">
                    Note: Always read the manufacturer's label before application. Consult a local agriculture officer for site-specific advice.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="desi" className="flex-1 space-y-6">
                <div className="bg-primary/5 p-8 rounded-3xl border border-primary/10">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="text-xl font-bold flex items-center gap-2">
                      <FlaskConical className="h-6 w-6 text-primary" />
                      Neem Leaf Decisively Mixture
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground">Community Rating:</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h5 className="text-xs font-bold uppercase tracking-widest text-primary">Ingredients</h5>
                      <ul className="space-y-2 text-sm font-medium text-muted-foreground">
                        <li>• 5kg Neem Leaves</li>
                        <li>• 20L Water</li>
                        <li>• 500ml Cow Urine</li>
                        <li>• 50g Natural Soap (as sticker)</li>
                      </ul>
                    </div>
                    <div className="space-y-4">
                      <h5 className="text-xs font-bold uppercase tracking-widest text-primary">Preparation</h5>
                      <p className="text-sm leading-relaxed text-muted-foreground italic">
                        "Boil neem leaves in water for 2-3 hours until the liquid turns dark green. Let it cool overnight. Add cow urine and strained soap. Mix well before spraying."
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Button variant="outline" className="rounded-full gap-2 border-primary/20 text-primary">
                        <ThumbsUp className="h-4 w-4" /> 142
                      </Button>
                      <Button variant="outline" className="rounded-full gap-2 border-primary/20 text-muted-foreground">
                        <ThumbsDown className="h-4 w-4" /> 3
                      </Button>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-none font-bold">Expert Approved - Dr. Arvind</Badge>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 space-y-4">
            <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Leaf className="h-12 w-12 text-muted-foreground/40" />
            </div>
            <h3 className="text-2xl font-bold">Select a Disease to Begin</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Choose a crop disease from the sidebar to view professional diagnosis, chemical treatments, and traditional remedies.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

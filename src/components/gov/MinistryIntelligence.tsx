
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Globe, 
  CheckCircle, 
  ShieldAlert,
  Zap,
  Activity,
  Navigation,
  Lock,
  Plus,
  Loader2,
  TrendingUp,
  MapPin,
  Trash2,
  ArrowUpRight,
  Wind,
  Droplets,
  BrainCircuit,
  Info,
  RefreshCw
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter, 
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, doc, deleteDoc, writeBatch, getDocs } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useAppState } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { predictSpreadVector, SpreadPredictionOutput } from "@/ai/flows/spread-prediction-flow";

const STATES = [
  "Punjab", "Haryana", "Rajasthan", "Maharashtra", "Uttar Pradesh", "West Bengal", "Karnataka", "Madhya Pradesh"
];

const INITIAL_NODES = [
  { id: 'node-01', name: 'Doddaballapur', x: 25, y: 30, density: 85, pathogen: 'Onion Rot', state: 'Karnataka' },
  { id: 'node-02', name: 'Rajanukunte', x: 45, y: 40, density: 72, pathogen: 'Wheat Rust', state: 'Karnataka' },
  { id: 'node-03', name: 'Devanahalli', x: 65, y: 25, density: 40, pathogen: 'Tomato Blight', state: 'Karnataka' },
  { id: 'node-04', name: 'Yelahanka', x: 50, y: 60, density: 15, pathogen: 'None', state: 'Karnataka' },
  { id: 'node-05', name: 'Hoskote', x: 75, y: 55, density: 55, pathogen: 'Paddy Blast', state: 'Karnataka' },
];

export function MinistryIntelligence() {
  const firestore = useFirestore();
  const { role, name: userName } = useAppState();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [spreadPrediction, setSpreadPrediction] = useState<SpreadPredictionOutput | null>(null);
  
  // Real-time grid data
  const outbreaksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "pestOutbreaks"));
  }, [firestore]);
  const { data: dbOutbreaks, isLoading } = useCollection(outbreaksQuery);

  // Combine DB and Initial nodes for visual depth
  const allNodes = useMemo(() => {
    const dbMapped = dbOutbreaks?.map(o => ({
      id: o.id,
      name: o.pestName,
      state: o.state,
      density: o.severity === 'Critical' ? 90 : 50,
      pathogen: o.pestName,
      x: Math.random() * 80 + 10,
      y: Math.random() * 80 + 10,
      isDb: true
    })) || [];
    return [...INITIAL_NODES, ...dbMapped];
  }, [dbOutbreaks]);

  const stats = useMemo(() => {
    const critical = allNodes.filter(o => o.density > 70).length;
    const totalArea = allNodes.reduce((acc, curr) => acc + (curr.density * 150), 0);
    const densityAvg = allNodes.reduce((acc, curr) => acc + curr.density, 0) / allNodes.length;
    return { critical, totalArea, densityAvg };
  }, [allNodes]);

  const handleRunAiPrediction = async () => {
    setIsAiLoading(true);
    try {
      const topNode = allNodes.reduce((prev, current) => (prev.density > current.density) ? prev : current);
      const result = await predictSpreadVector({
        pathogenName: topNode.pathogen,
        currentClusters: allNodes.map(n => ({ nodeId: n.id, density: n.density, latitude: n.y, longitude: n.x })),
        windSpeed: 15,
        windDirection: "NW",
        humidity: 78
      });
      setSpreadPrediction(result);
      toast({ title: "AI Prediction Ready", description: "48-hour spread vector synthesized by Gemini." });
    } catch (e) {
      toast({ variant: "destructive", title: "AI Error", description: "Spread engine connection unstable." });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleClearGrid = async () => {
    if (!firestore) return;
    const batch = writeBatch(firestore);
    const snap = await getDocs(collection(firestore, "pestOutbreaks"));
    snap.forEach(d => batch.delete(d.ref));
    await batch.commit();
    toast({ title: "Grid Reset", description: "All active pathogen clusters have been cleared by Expert Aman Kumar." });
  };

  const handleCreateReport = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !user) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      pestName: formData.get("pestName") as string,
      state: formData.get("state") as string,
      severity: formData.get("severity") as string,
      areaHectares: Number(formData.get("area")),
      containmentStrategy: formData.get("strategy") as string,
      reportedBy: user.uid,
      createdAt: new Date().toISOString()
    };

    addDocumentNonBlocking(collection(firestore, "pestOutbreaks"), data);
    setIsReportDialogOpen(false);
    setIsSubmitting(false);
    toast({ title: "Bio-Security Alert Issued", description: "Grid visualization updated." });
  };

  if (role !== "Authority" && role !== "Expert") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
          <Lock className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-black">Authorized Personnel Only</h3>
        <p className="text-muted-foreground">Access restricted to verified Ministry and Expert nodes.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
            <ShieldAlert className="h-10 w-10 text-primary" />
            National Intelligence Grid
          </h2>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.2em]">Bio-Security Surveillance & Pathogen Tracking</p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={handleClearGrid}
            className="rounded-2xl h-14 px-6 font-black border-destructive/20 text-destructive hover:bg-destructive/5"
          >
            <Trash2 className="h-5 w-5 mr-2" /> Grid Clear
          </Button>
          <Button 
            onClick={handleRunAiPrediction}
            disabled={isAiLoading}
            className="rounded-2xl h-14 px-6 font-black bg-slate-900 text-white hover:bg-slate-800 gap-2"
          >
            {isAiLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <BrainCircuit className="h-5 w-5" />}
            AI Threat Forecast
          </Button>
          <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 px-8 font-black bg-primary shadow-xl shadow-primary/20">
                <Plus className="h-6 w-6 mr-2" /> New Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] sm:max-w-[600px] p-10">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black">Issue Bio-Security Alert</DialogTitle>
                <DialogDescription className="italic font-medium">Broadcast containment protocols to the grid.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateReport} className="space-y-6 pt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Pathogen Name</Label>
                    <Input name="pestName" placeholder="e.g. Locust Swarm" required className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">State</Label>
                    <Select name="state" defaultValue="Karnataka">
                      <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Containment Strategy</Label>
                  <Textarea name="strategy" placeholder="Action required..." required className="rounded-xl bg-muted/30 border-none min-h-[100px] font-medium" />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl font-black text-lg">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Broadcast Alert"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Geospatial Intelligence Grid */}
        <Card className="lg:col-span-8 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-slate-900 text-white relative min-h-[650px]">
          <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/map/1200/800')] bg-cover bg-center opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
          
          <CardHeader className="relative z-10 p-10 flex flex-row justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                <Globe className="h-8 w-8 text-primary" />
                Live Geospatial Grid
              </CardTitle>
              <CardDescription className="text-slate-400 font-medium italic">Bengaluru Regional Pathogen Heatmap & Spread Vectors</CardDescription>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1.5 font-black uppercase text-[10px]">
                Active Nodes: {allNodes.length}
              </Badge>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase">
                <RefreshCw className="h-3 w-3 animate-spin-slow" /> Real-time Sync
              </div>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-10 h-[500px]">
            <div className="relative w-full h-full border border-white/5 rounded-[2.5rem] bg-black/20 backdrop-blur-sm overflow-hidden">
              {/* Heatmap Clusters */}
              {allNodes.map((node, i) => (
                <motion.div 
                  key={node.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute"
                  style={{ top: `${node.y}%`, left: `${node.x}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className={cn(
                    "relative h-20 w-20 rounded-full flex items-center justify-center transition-all",
                    node.density > 70 ? 'bg-destructive/30 animate-pulse' : 
                    node.density > 40 ? 'bg-amber-500/20' : 'bg-primary/20'
                  )}>
                    <div className={cn(
                      "h-4 w-4 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]",
                      node.density > 70 ? 'bg-destructive' : node.density > 40 ? 'bg-amber-500' : 'bg-primary'
                    )} />
                  </div>
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md p-2 rounded-lg border border-white/10 text-center min-w-[100px] shadow-2xl">
                    <p className="text-[8px] font-black text-primary uppercase">{node.pathogen}</p>
                    <p className="text-[10px] font-bold">{node.name}</p>
                    <p className="text-[8px] font-bold text-slate-500">{node.density}% Density</p>
                  </div>
                </motion.div>
              ))}

              {/* AI Spread Vector Arrows */}
              {spreadPrediction && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 pointer-events-none"
                >
                  <svg className="w-full h-full">
                    <defs>
                      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
                      </marker>
                    </defs>
                    {allNodes.filter(n => n.density > 60).map((n, i) => (
                      <motion.line 
                        key={`vector-${i}`}
                        x1={`${n.x}%`} 
                        y1={`${n.y}%`} 
                        x2={`${n.x + (Math.cos(spreadPrediction.predictedVector.angle * Math.PI / 180) * 15)}%`}
                        y2={`${n.y + (Math.sin(spreadPrediction.predictedVector.angle * Math.PI / 180) * 15)}%`}
                        stroke="hsl(var(--primary))"
                        strokeWidth="3"
                        strokeDasharray="10,5"
                        markerEnd="url(#arrowhead)"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    ))}
                  </svg>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Intelligence Directives & Pulse */}
        <div className="lg:col-span-4 space-y-8 flex flex-col">
          <Card className="border-none shadow-xl rounded-[3rem] p-8 bg-white flex-1 flex flex-col space-y-6">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Navigation className="h-6 w-6 text-primary" />
                AI Directives
              </CardTitle>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Autonomous Containment Strategies</p>
            </div>
            
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {allNodes.filter(n => n.density > 50).map((n) => (
                  <div key={n.id} className={cn(
                    "p-5 rounded-[2rem] border-l-8 transition-all hover:scale-[1.02]",
                    n.density > 75 ? "bg-destructive/5 border-destructive" : "bg-primary/5 border-primary"
                  )}>
                    <div className="flex justify-between items-start mb-2">
                      <p className="text-[10px] font-black uppercase text-muted-foreground">{n.name} Node</p>
                      <Badge variant={n.density > 75 ? "destructive" : "default"} className="text-[8px] font-black uppercase">
                        {n.density > 75 ? "Critical" : "Warning"}
                      </Badge>
                    </div>
                    <p className="text-sm font-bold text-slate-900 leading-tight">
                      Action: Strategic fungicide application required for {n.name}.
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 mt-2 italic">
                      Density increase of {Math.floor(Math.random() * 15) + 10}% detected.
                    </p>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Mandi Inflation Pulse */}
            <div className="pt-6 border-t space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mandi Inflation Pulse</h4>
                <Badge className="bg-amber-500 text-white border-none font-black text-[8px] animate-pulse">Alert Active</Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className={cn(
                  "p-4 rounded-2xl border text-center transition-all",
                  stats.densityAvg > 40 ? "bg-destructive/10 border-destructive/20" : "bg-muted/30 border-border"
                )}>
                  <TrendingUp className="h-5 w-5 text-destructive mx-auto mb-1" />
                  <p className="text-[8px] font-black uppercase text-slate-500">Onion Price</p>
                  <p className="text-xl font-black text-destructive">+42% Spike</p>
                  {stats.densityAvg > 40 && <p className="text-[7px] font-bold text-destructive/60 uppercase">Pathogen Induced</p>}
                </div>
                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-center">
                  <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1" />
                  <p className="text-[8px] font-black uppercase text-slate-500">Wheat Supply</p>
                  <p className="text-xl font-black text-primary">Stable</p>
                  <p className="text-[7px] font-bold text-primary/60 uppercase">Nodes Guarded</p>
                </div>
              </div>
            </div>
          </Card>

          {/* AI Forecast Card (Visible when prediction is run) */}
          <AnimatePresence>
            {spreadPrediction && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Card className="border-none shadow-2xl rounded-[2.5rem] p-8 bg-slate-900 text-white space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5"><BrainCircuit className="h-24 w-24" /></div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                      <Wind className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black tracking-tight">48h Spread Forecast</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vector Analysis v2.1</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-slate-500">Predicted Direction</p>
                      <p className="text-lg font-black flex items-center gap-2">
                        {spreadPrediction.predictedVector.direction} <ArrowUpRight className="h-4 w-4 text-primary" style={{ transform: `rotate(${spreadPrediction.predictedVector.angle - 45}deg)` }} />
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[8px] font-black uppercase text-slate-500">Risk Level</p>
                      <Badge variant="destructive" className="font-black uppercase text-[8px]">{spreadPrediction.predictedVector.riskLevel}</Badge>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 italic text-xs font-medium text-slate-300">
                    "{spreadPrediction.strategicAdvice}"
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { 
  AlertTriangle, 
  Globe, 
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
  BrainCircuit,
  RefreshCw,
  Info,
  CheckCircle2,
  Volume2,
  History,
  Building2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { collection, query, getDocs, writeBatch, serverTimestamp, where, orderBy, limit } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useAppState } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { predictSpreadVector, SpreadPredictionOutput } from "@/ai/flows/spread-prediction-flow";

const INITIAL_NODES = [
  { id: 'node-01', name: 'Doddaballapur', x: 25, y: 30, density: 85, pathogen: 'Onion Rot', state: 'Karnataka' },
  { id: 'node-02', name: 'Rajanukunte', x: 45, y: 40, density: 72, pathogen: 'Wheat Rust', state: 'Karnataka' },
  { id: 'node-03', name: 'Devanahalli', x: 65, y: 25, density: 40, pathogen: 'Tomato Blight', state: 'Karnataka' },
  { id: 'node-04', name: 'Yelahanka', x: 50, y: 60, density: 15, pathogen: 'None', state: 'Karnataka' },
  { id: 'node-05', name: 'Hoskote', x: 75, y: 55, density: 55, pathogen: 'Paddy Blast', state: 'Karnataka' },
];

export function MinistryIntelligence() {
  const firestore = useFirestore();
  const { role } = useAppState();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [spreadPrediction, setSpreadPrediction] = useState<SpreadPredictionOutput | null>(null);
  
  const outbreaksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "pestOutbreaks"), limit(50));
  }, [firestore]);
  const { data: dbOutbreaks } = useCollection(outbreaksQuery);

  const directivesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "intelligence_directives"), 
      where("status", "==", "active"),
      orderBy("timestamp", "desc"),
      limit(10)
    );
  }, [firestore]);
  const { data: activeDirectives } = useCollection(directivesQuery);

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
    const densityAvg = allNodes.length ? allNodes.reduce((acc, curr) => acc + curr.density, 0) / allNodes.length : 0;
    return { densityAvg };
  }, [allNodes]);

  const syncDirectives = useCallback(async () => {
    if (!firestore || role !== 'Expert' || !allNodes.length) return;

    const validNodes = allNodes.filter(n => n.pathogen !== 'None' && n.density > 70);
    if (validNodes.length === 0) return;

    const existingQ = query(
      collection(firestore, "intelligence_directives"),
      where("status", "==", "active"),
      limit(20)
    );
    
    try {
      const snap = await getDocs(existingQ);
      const existingHubs = new Set(snap.docs.map(d => d.data().locationNode));

      for (const node of validNodes) {
        const hubName = `${node.name} Hub`;
        if (!existingHubs.has(hubName)) {
          addDocumentNonBlocking(collection(firestore, "intelligence_directives"), {
            title: `Pathogen Outbreak: ${node.pathogen}`,
            severity: 'CRITICAL',
            description: `A high-density cluster (${node.density}%) has been detected. Immediate containment required.`,
            locationNode: hubName,
            expertId: 'AMAN_EXP_01',
            status: 'active',
            timestamp: serverTimestamp()
          });
        }
      }
    } catch (e) {
      console.warn("Directive sync error:", e);
    }
  }, [allNodes, firestore, role]);

  useEffect(() => {
    const timer = setTimeout(syncDirectives, 5000);
    return () => clearTimeout(timer);
  }, [syncDirectives]);

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

      addDocumentNonBlocking(collection(firestore!, "intelligence_directives"), {
        title: `AI Spread Forecast: ${topNode.pathogen}`,
        severity: result.predictedVector.riskLevel === 'Critical' ? 'CRITICAL' : 'ADVISORY',
        description: `AI Analysis: Predicted spread ${result.predictedVector.distanceKm}km towards ${result.predictedVector.direction}. Instructions: ${result.strategicAdvice}`,
        locationNode: `Regional Sector: ${topNode.name}`,
        expertId: 'AMAN_EXP_01',
        status: 'active',
        timestamp: serverTimestamp()
      });

      toast({ title: "AI Prediction Ready", description: "48-hour spread vector synthesized and broadcasted to grid." });
    } catch (e) {
      toast({ variant: "destructive", title: "AI Error", description: "Spread engine connection unstable." });
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleClearGrid = async () => {
    if (!firestore) return;
    const batch = writeBatch(firestore);
    
    const snapOutbreaks = await getDocs(collection(firestore, "pestOutbreaks"));
    snapOutbreaks.forEach(d => batch.delete(d.ref));

    const snapDirectives = await getDocs(collection(firestore, "intelligence_directives"));
    snapDirectives.forEach(d => batch.delete(d.ref));

    await batch.commit();
    toast({ title: "Grid Reset", description: "All active pathogen clusters and directives have been cleared." });
  };

  const handleCreateDirective = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!firestore || !user) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      severity: formData.get("severity") as string,
      description: formData.get("description") as string,
      locationNode: formData.get("locationNode") as string,
      expertId: 'AMAN_EXP_01',
      status: 'active',
      timestamp: serverTimestamp()
    };

    addDocumentNonBlocking(collection(firestore, "intelligence_directives"), data);
    setIsReportDialogOpen(false);
    setIsSubmitting(false);
    toast({ title: "Grid Directive Issued", description: "Protocol broadcasted to affected location nodes." });
  };

  if (role !== "Authority" && role !== "Expert") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <Lock className="h-10 w-10 text-destructive" />
        <h3 className="text-2xl font-black">Authorized Personnel Only</h3>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full bg-background">
      <div className="flex-1 relative bg-slate-950 border-r border-border">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/darkmap/1200/800')] bg-cover bg-center opacity-20 grayscale brightness-50" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />

        <div className="absolute top-8 left-10 right-10 z-20 flex justify-between items-start pointer-events-none">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-1">
            <h3 className="text-3xl font-black tracking-tighter text-white flex items-center gap-3">
              <Globe className="h-8 w-8 text-primary" />
              Live Geospatial Grid
            </h3>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">National Bio-Security Heatmap</p>
          </motion.div>

          <div className="flex gap-3 pointer-events-auto">
            <Button 
              variant="outline"
              onClick={handleClearGrid}
              className="rounded-xl h-11 px-6 font-black border-destructive/20 text-destructive bg-slate-900/80 backdrop-blur-md hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" /> Grid Reset
            </Button>
            <Button 
              onClick={handleRunAiPrediction}
              disabled={isAiLoading}
              className="rounded-xl h-11 px-6 font-black bg-white text-slate-900 hover:bg-slate-100 gap-2 shadow-xl"
            >
              {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BrainCircuit className="h-4 w-4" />}
              AI Threat Forecast
            </Button>
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          {allNodes.map((node) => (
            <motion.div 
              key={node.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute"
              style={{ top: `${node.y}%`, left: `${node.x}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div className={cn(
                "relative h-24 w-24 rounded-full flex items-center justify-center transition-all",
                node.density > 70 ? 'bg-destructive/20' : node.density > 40 ? 'bg-amber-500/15' : 'bg-primary/15'
              )}>
                <div className={cn(
                  "h-4 w-4 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.4)]",
                  node.density > 70 ? 'bg-destructive' : node.density > 40 ? 'bg-amber-500' : 'bg-primary'
                )} />
                <div className={cn(
                  "absolute inset-0 rounded-full animate-ping opacity-20",
                  node.density > 70 ? 'bg-destructive' : node.density > 40 ? 'bg-amber-500' : 'bg-primary'
                )} />
              </div>
              
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl p-3 rounded-2xl border border-border text-center min-w-[120px] shadow-2xl">
                <p className="text-[8px] font-black text-primary uppercase tracking-widest">{node.pathogen}</p>
                <p className="text-xs font-black text-slate-900">{node.name}</p>
                <p className="text-[10px] font-bold text-slate-500">{node.density}% Density</p>
              </div>
            </motion.div>
          ))}

          {spreadPrediction && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 pointer-events-none">
              <svg className="w-full h-full">
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
                  </marker>
                </defs>
                {allNodes.filter(n => n.density > 60).map((n, i) => (
                  <motion.line 
                    key={`vector-${i}`}
                    x1={`${n.x}%`} y1={`${n.y}%`} 
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

        <div className="absolute bottom-10 right-10 z-20">
          <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-16 px-8 rounded-[2rem] font-black text-lg bg-primary shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                <Plus className="h-6 w-6 mr-3" /> New Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[3rem] sm:max-w-[600px] p-10 bg-white text-slate-900 border-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tighter">Issue Bio-Security Alert</DialogTitle>
                <DialogDescription className="text-muted-foreground italic">Broadcast expert instructions to the national grid nodes.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateDirective} className="space-y-6 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Alert Title</Label>
                    <Input name="title" placeholder="e.g. Locust Swarm Detected" required className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Severity Level</Label>
                    <Select name="severity" defaultValue="ADVISORY">
                      <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CRITICAL">CRITICAL (Red)</SelectItem>
                        <SelectItem value="ADVISORY">ADVISORY (Blue)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Location Node</Label>
                  <Input name="locationNode" placeholder="e.g. Rajasthan Border Hub" required className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Directive Instructions & POV</Label>
                  <Textarea name="description" placeholder="Share specific manual instructions or scientific reasoning..." required className="rounded-xl bg-muted/30 border-none min-h-[120px] font-medium" />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl font-black text-lg bg-primary">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Broadcast to Grid"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <aside className="w-[450px] bg-background flex flex-col p-10 space-y-10">
        <Card className="border-none shadow-2xl rounded-[3rem] bg-white text-slate-900 p-8 flex flex-col space-y-6 h-[500px]">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <Navigation className="h-6 w-6 text-primary" />
                Live Directives
              </CardTitle>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Broadcast History</p>
            </div>
            <Badge variant="outline" className="h-8 rounded-full px-4 font-black text-[10px] border-primary/20 text-primary uppercase">Active</Badge>
          </div>
          
          <ScrollArea className="flex-1 -mr-4 pr-4">
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {activeDirectives?.map((dir, i) => (
                  <motion.div 
                    key={dir.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "p-6 rounded-[2rem] border-l-8 transition-all hover:scale-[1.02] cursor-pointer group",
                      dir.severity === 'CRITICAL' ? "bg-destructive/5 border-destructive" : "bg-blue-50 border-blue-500"
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <p className="text-[10px] font-black uppercase text-slate-400">{dir.locationNode}</p>
                      <Badge variant={dir.severity === 'CRITICAL' ? "destructive" : "default"} className="text-[8px] font-black uppercase">
                        {dir.severity}
                      </Badge>
                    </div>
                    <p className="text-sm font-black leading-tight text-slate-800">{dir.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-2 line-clamp-2 italic">"{dir.description}"</p>
                    <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <History className="h-3 w-3" /> Issued: {dir.timestamp?.toDate().toLocaleTimeString() || 'Just now'}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </Card>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Mandi Inflation Pulse</h4>
            <div className="flex gap-1">
              {[1,2,3].map(i => <div key={i} className="h-1 w-1 rounded-full bg-primary animate-pulse" style={{ animationDelay: `${i*0.2}s` }} />)}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Card className={cn(
              "p-8 rounded-[2.5rem] border-none shadow-xl transition-all relative overflow-hidden",
              stats.densityAvg > 40 ? "bg-destructive/5 border-destructive/10" : "bg-white"
            )}>
              <div className="absolute top-0 right-0 p-4 opacity-10"><TrendingUp className="h-20 w-20 rotate-12" /></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground">Onion Price Spike</p>
                  <p className="text-4xl font-black text-destructive">+42%</p>
                  <p className="text-[8px] font-bold text-destructive/60 uppercase tracking-widest flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Pathogen-Induced Alert
                  </p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
                  <ArrowUpRight className="h-8 w-8" />
                </div>
              </div>
            </Card>

            <Card className="p-8 rounded-[2.5rem] border-none shadow-xl bg-white relative overflow-hidden">
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-muted-foreground">Wheat Supply</p>
                  <p className="text-4xl font-black text-primary">Stable</p>
                  <p className="text-[8px] font-bold text-primary/60 uppercase tracking-widest flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Global Buffer Maintained
                  </p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Activity className="h-8 w-8" />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </aside>
    </div>
  );
}

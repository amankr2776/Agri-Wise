
"use client";

import React, { useMemo, useState, useEffect } from "react";
import { 
  AlertTriangle, 
  Globe, 
  CheckCircle, 
  ShieldAlert,
  MoveUpRight,
  Zap,
  Activity,
  Navigation,
  Lock,
  Plus,
  Loader2,
  Edit3,
  TrendingUp,
  MapPin,
  Save,
  X,
  FlaskConical,
  RefreshCw,
  Trash2,
  ShieldCheck,
  ArrowUpRight
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
import { collection, query, doc, deleteDoc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppState } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

const STATES = [
  "Punjab", "Haryana", "Rajasthan", "Maharashtra", "Uttar Pradesh", "West Bengal", "Karnataka", "Madhya Pradesh"
];

const INITIAL_SURVEILLANCE_NODES = [
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
  const [simulatedNodes, setSimulatedNodes] = useState(INITIAL_SURVEILLANCE_NODES);
  
  const [editingOutbreakId, setEditingOutbreakId] = useState<string | null>(null);
  const [editStrategy, setEditStrategy] = useState("");

  const isExpertAman = userName === "Aman Kumar";

  const outbreaksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "pestOutbreaks"));
  }, [firestore]);

  const { data: dbOutbreaks, isLoading } = useCollection(outbreaksQuery);

  // Combine DB and Simulated data for high-fidelity demo
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
    return [...simulatedNodes, ...dbMapped];
  }, [simulatedNodes, dbOutbreaks]);

  const stats = useMemo(() => {
    const critical = allNodes.filter(o => o.density > 70).length;
    const states = new Set(allNodes.map(o => o.state));
    const totalArea = allNodes.reduce((acc, curr) => acc + (curr.density * 150), 0);
    return { critical, states: states.size, totalArea };
  }, [allNodes]);

  const automatedDirectives = useMemo(() => {
    return allNodes
      .filter(n => n.density > 50)
      .map(n => ({
        id: n.id,
        title: `${n.name} Crisis`,
        state: n.state,
        severity: n.density > 75 ? 'Critical' : 'Warning',
        strategy: n.density > 75 
          ? `Immediate Bio-Fence Activation Required. Aerial spray scheduled for ${n.name} sector.` 
          : `Monitor spread vectors from ${n.name}. Proactive fungicide barrier recommended.`
      }));
  }, [allNodes]);

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
      predictedMovementVector: formData.get("vector") as string,
      containmentStrategy: formData.get("strategy") as string,
      reportedBy: user.uid,
      createdAt: new Date().toISOString()
    };

    addDocumentNonBlocking(collection(firestore, "pestOutbreaks"), data);
    setIsReportDialogOpen(false);
    setIsSubmitting(false);
    toast({ title: "Bio-Security Alert Issued", description: "Regional hubs have been notified." });
  };

  const clearGrid = () => {
    setSimulatedNodes(prev => prev.map(n => ({ ...n, density: 5, pathogen: 'Contained' })));
    toast({ 
      title: "Grid Containment Success", 
      description: "Bio-fences activated. Pathogen density reduced to safety levels." 
    });
  };

  if (role !== "Authority" && role !== "Expert") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
          <Lock className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-black">Authorized Personnel Only</h3>
        <p className="text-muted-foreground max-w-sm">Access restricted to the Ministry of Agriculture and certified experts.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
            <ShieldAlert className="h-10 w-10 text-primary" />
            {role === 'Expert' ? 'Expert Surveillance Hub' : 'Ministry Intelligence Grid'}
          </h2>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Bio-Security & Regional Threat Assessment</p>
        </div>
        
        <div className="flex gap-3">
          {isExpertAman && (
            <Button 
              variant="outline"
              onClick={clearGrid}
              className="rounded-2xl h-14 px-6 font-black text-lg border-primary/20 text-primary hover:bg-primary/5"
            >
              <Trash2 className="h-5 w-5 mr-2" /> Grid Clear
            </Button>
          )}
          <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-2xl h-14 px-8 font-black text-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
                <Plus className="h-6 w-6 mr-2" /> Issue Crisis Alert
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2.5rem] sm:max-w-[600px] p-10">
              <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tight">Deploy Containment Protocol</DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium italic">Broadcast official directives to regional hubs.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateReport} className="space-y-6 pt-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Pathogen / Pest Name</Label>
                    <Input name="pestName" placeholder="e.g. Wheat Rust" required className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Affected State</Label>
                    <Select name="state" defaultValue="Punjab">
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
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Containment Strategy Directive</Label>
                  <Textarea name="strategy" placeholder="Action: Strategic district-wide fungicide application..." required className="rounded-xl bg-muted/30 border-none min-h-[100px] font-medium" />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl font-black text-lg">
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Broadcast Official Alert"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl rounded-[2rem] bg-primary/10 overflow-hidden relative border-l-8 border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black flex items-center gap-2 text-primary uppercase tracking-widest">
              <CheckCircle className="h-4 w-4" /> Certification Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-primary mb-2">{(stats.totalArea / 1000).toFixed(1)}k Ha</div>
            <Progress value={65} className="h-2 bg-primary/20" />
            <p className="text-[10px] text-muted-foreground mt-3 uppercase font-bold tracking-wider italic">Verified Outbreak Mapping Active</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2rem] bg-destructive/10 overflow-hidden relative border-l-8 border-destructive">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black flex items-center gap-2 text-destructive uppercase tracking-widest">
              <ShieldAlert className="h-4 w-4" /> Critical Risk Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-destructive">{stats.critical} Regions</div>
            <div className="flex gap-1 mt-2">
              {Array(Math.max(1, stats.critical)).fill(0).map((_, i) => (
                <div key={i} className="h-1 flex-1 bg-destructive rounded-full" />
              ))}
            </div>
            <p className="text-[10px] text-destructive/60 mt-3 uppercase font-bold tracking-wider italic">Immediate Containment Required</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2rem] bg-amber-500/10 overflow-hidden relative border-l-8 border-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black flex items-center gap-2 text-amber-600 uppercase tracking-widest">
              <Zap className="h-4 w-4" /> Surveillance Pulse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-amber-600 flex items-center gap-2">
              Live <Activity className="h-6 w-6 animate-pulse" />
            </div>
            <p className="text-[10px] text-amber-600/60 mt-3 uppercase font-bold tracking-wider italic">Node Latency: 22ms</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Geospatial Visualization */}
        <Card className="lg:col-span-8 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-slate-900 text-white relative min-h-[650px]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
          
          <CardHeader className="relative z-10 p-10">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                  <Globe className="h-8 w-8 text-primary" />
                  Pathogen Spread Geospatial Grid
                </CardTitle>
                <CardDescription className="text-slate-400 font-medium italic">Active clusters and predicted spread vectors based on real-time field diagnostics.</CardDescription>
              </div>
              <Badge className="bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 font-black uppercase text-[10px] shadow-lg">
                {isExpertAman ? 'Expert Node 02 Enabled' : 'Verified Node Access'}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-10 h-[500px]">
            <div className="relative w-full h-full border border-white/5 rounded-[2.5rem] bg-black/20 backdrop-blur-sm overflow-hidden">
              {/* Regional Node Points */}
              {allNodes.map((node, i) => (
                <motion.div 
                  key={node.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="absolute flex flex-col items-center group cursor-pointer"
                  style={{ 
                    top: `${node.y}%`, 
                    left: `${node.x}%` 
                  }}
                >
                  <div className={cn(
                    "relative h-16 w-16 rounded-full flex items-center justify-center shadow-2xl transition-all group-hover:scale-110",
                    node.density > 70 ? 'bg-destructive animate-pulse-engagement shadow-destructive/50' : 
                    node.density > 40 ? 'bg-amber-500 shadow-amber-500/50' : 'bg-primary/40 shadow-primary/20'
                  )}>
                    <AlertTriangle className={cn("h-8 w-8 text-white", node.density < 40 && "opacity-20")} />
                    
                    {/* Animated Spread Vector Arrows */}
                    {node.density > 60 && (
                      <div className="absolute -right-20 -top-12 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <motion.div
                          animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                        >
                          <ArrowUpRight className="h-10 w-10" />
                        </motion.div>
                      </div>
                    )}
                  </div>
                  <div className="mt-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center shadow-xl group-hover:bg-white/20 transition-all min-w-[120px]">
                    <div className="text-[9px] font-black text-primary uppercase tracking-widest">{node.pathogen}</div>
                    <div className="text-xs font-black">{node.name}</div>
                    <div className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Density: {node.density}%</div>
                  </div>
                </motion.div>
              ))}

              {/* Decorative Connections */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                <line x1="25%" y1="30%" x2="45%" y2="40%" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="45%" y1="40%" x2="65%" y2="25%" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="45%" y1="40%" x2="50%" y2="60%" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="65%" y1="25%" x2="75%" y2="55%" stroke="white" strokeWidth="1" strokeDasharray="5,5" />
              </svg>
            </div>
          </CardContent>
        </Card>

        {/* Intelligence Directives Panel */}
        <Card className="lg:col-span-4 border-none shadow-2xl rounded-[3rem] p-10 bg-white space-y-8 flex flex-col h-full">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <Navigation className="h-7 w-7 text-primary" />
              Directives
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium italic">Automated protocols based on node density.</p>
          </div>
          
          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-6">
              {automatedDirectives.map((d) => (
                <div key={d.id} className="p-6 rounded-3xl bg-muted/30 border border-border group hover:bg-muted/50 transition-all cursor-pointer relative overflow-hidden">
                  {d.severity === 'Critical' && <div className="absolute left-0 top-0 bottom-0 w-2 bg-destructive" />}
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="h-3 w-3" /> {d.state} Sector
                      </h4>
                      <p className="text-lg font-black text-slate-900 tracking-tight">{d.title}</p>
                    </div>
                    <Badge variant={d.severity === 'Critical' ? 'destructive' : 'default'} className="text-[8px] font-black uppercase">
                      {d.severity}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 italic font-medium leading-relaxed border-l-4 border-primary/20 pl-4">
                    "{d.strategy}"
                  </p>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Mandi Inflation Pulse widget */}
          <div className="pt-8 border-t space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                Mandi Inflation Pulse
              </h4>
              <Badge variant="outline" className="text-[8px] border-amber-500 text-amber-600 animate-pulse font-black uppercase">Live Surveillance</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-center group hover:bg-destructive/5 transition-all">
                <TrendingUp className="h-6 w-6 text-destructive mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">Onion Price</p>
                <p className="text-xl font-black text-destructive">
                  {allNodes.some(n => n.pathogen === 'Onion Rot' && n.density > 70) ? '+42% spike' : 'Stable'}
                </p>
                <p className="text-[8px] font-medium text-slate-400 mt-1 italic">
                  {allNodes.some(n => n.pathogen === 'Onion Rot' && n.density > 70) ? 'Due to rot outbreak' : 'Healthy harvest'}
                </p>
              </div>
              <div className="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col items-center justify-center text-center group hover:bg-primary/5 transition-all">
                <TrendingUp className="h-6 w-6 text-primary mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">Wheat Supply</p>
                <p className="text-xl font-black text-primary">Stable</p>
                <p className="text-[8px] font-medium text-slate-400 mt-1 italic">Proactive containment</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


"use client";

import React, { useMemo, useState } from "react";
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
  X
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
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, doc, deleteDoc } from "firebase/firestore";
import { addDocumentNonBlocking, updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppState } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";

const STATES = [
  "Punjab", "Haryana", "Rajasthan", "Maharashtra", "Uttar Pradesh", "West Bengal", "Karnataka", "Madhya Pradesh"
];

export function MinistryIntelligence() {
  const firestore = useFirestore();
  const { role } = useAppState();
  const { user } = useUser();
  const { toast } = useToast();
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit State
  const [editingOutbreakId, setEditingOutbreakId] = useState<string | null>(null);
  const [editStrategy, setEditStrategy] = useState("");

  const outbreaksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "pestOutbreaks"));
  }, [firestore]);

  const { data: outbreaks, isLoading } = useCollection(outbreaksQuery);

  const stats = useMemo(() => {
    if (!outbreaks) return { critical: 0, states: 0 };
    const critical = outbreaks.filter(o => o.severity === 'Critical').length;
    const states = new Set(outbreaks.map(o => o.state));
    return { critical, states: states.size };
  }, [outbreaks]);

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
    toast({ title: "Bio-Security Alert Issued", description: "Regional hubs have been notified of the vector movement." });
  };

  const handleUpdateStrategy = (id: string) => {
    if (!firestore) return;
    updateDocumentNonBlocking(doc(firestore, "pestOutbreaks", id), {
      containmentStrategy: editStrategy,
      updatedAt: new Date().toISOString()
    });
    setEditingOutbreakId(null);
    toast({ title: "Protocol Updated", description: "Directives have been synchronized across regional units." });
  };

  const handleDeleteOutbreak = (id: string) => {
    if (!firestore) return;
    deleteDoc(doc(firestore, "pestOutbreaks", id));
    toast({ title: "Alert Cleared", description: "Outbreak has been marked as contained and removed from surveillance." });
  };

  if (role !== "Authority") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
          <Lock className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-black">Authorized Personnel Only</h3>
        <p className="text-muted-foreground max-w-sm">Access to government intelligence feeds is restricted to the Ministry of Agriculture and district authorities.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-32 rounded-[2rem]" />)}
        </div>
        <Skeleton className="h-[600px] rounded-[3rem]" />
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
            Ministry Intelligence Grid
          </h2>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Bio-Security & Mandi Surveillance Command</p>
        </div>
        
        <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl h-14 px-8 font-black text-lg shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90">
              <Plus className="h-6 w-6 mr-2" /> New Bio-Security Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] sm:max-w-[600px] p-10">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tight">Issue Crisis Alert</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium italic">Deploy regional containment protocols for pest or disease outbreaks.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateReport} className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Pathogen / Pest Name</Label>
                  <Input name="pestName" placeholder="e.g. Locust Swarm" required className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
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
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Severity Level</Label>
                  <Select name="severity" defaultValue="Warning">
                    <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Critical">Critical (Immediate)</SelectItem>
                      <SelectItem value="Warning">Warning (Monitor)</SelectItem>
                      <SelectItem value="Info">Informational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Movement Vector</Label>
                  <Input name="vector" placeholder="e.g. North-West towards HR" className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Containment Strategy Directive</Label>
                <Textarea name="strategy" placeholder="Enter official directive for regional hubs..." className="rounded-xl bg-muted/30 border-none min-h-[100px] font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-muted-foreground ml-2">Affected Area (Ha)</Label>
                  <Input name="area" type="number" placeholder="Approx Hectares" className="h-12 rounded-xl bg-muted/30 border-none font-bold" />
                </div>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl rounded-[2rem] bg-primary/10 overflow-hidden relative border-l-8 border-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black flex items-center gap-2 text-primary uppercase tracking-widest">
              <CheckCircle className="h-4 w-4" /> Certification Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-primary mb-2">58.4%</div>
            <Progress value={58.4} className="h-2 bg-primary/20" />
            <p className="text-[10px] text-muted-foreground mt-3 uppercase font-bold tracking-wider italic">12,450 Verified Clusters Pan-India</p>
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
              {Array(stats.critical).fill(0).map((_, i) => (
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
            <p className="text-[10px] text-amber-600/60 mt-3 uppercase font-bold tracking-wider italic">Mandi Inflation Monitoring Active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Map Visualization */}
        <Card className="lg:col-span-8 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-slate-900 text-white relative min-h-[600px]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
          
          <CardHeader className="relative z-10 p-10">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                  <Globe className="h-8 w-8 text-primary" />
                  Predictive Bio-Surveillance
                </CardTitle>
                <CardDescription className="text-slate-400 font-medium italic">Visualizing AI-predicted spread vectors across regional clusters</CardDescription>
              </div>
              <Badge className="bg-primary/20 text-primary border border-primary/30 px-4 py-1.5 font-black uppercase text-[10px] shadow-lg">Authority Node: 04</Badge>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-10 h-[450px]">
            <div className="relative w-full h-full border border-white/5 rounded-[2.5rem] bg-black/20 backdrop-blur-sm overflow-hidden">
              {outbreaks?.map((outbreak, i) => (
                <div 
                  key={outbreak.id}
                  className="absolute flex flex-col items-center group cursor-pointer transition-all hover:scale-110"
                  style={{ 
                    top: `${20 + (i * 15) % 60}%`, 
                    left: `${15 + (i * 20) % 70}%` 
                  }}
                >
                  <div className={cn(
                    "relative h-16 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all",
                    outbreak.severity === 'Critical' ? 'bg-destructive animate-pulse shadow-destructive/50' : 'bg-amber-500 shadow-amber-500/50'
                  )}>
                    <AlertTriangle className="h-7 w-7 text-white" />
                    <div className="absolute -right-24 -top-16 text-primary flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <MoveUpRight className="h-10 w-10 animate-bounce" />
                      <span className="text-[9px] font-black uppercase whitespace-nowrap bg-black/80 px-2 py-1 rounded-md border border-primary/20">
                        Vector: {outbreak.predictedMovementVector || 'Calculating...'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/10 min-w-[140px] text-center shadow-2xl group-hover:bg-white/20 transition-all">
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest">{outbreak.pestName}</div>
                    <div className="text-xs font-black">{outbreak.state} Cluster</div>
                    <div className="text-[8px] font-bold text-slate-400 mt-1 uppercase">{outbreak.areaHectares} Ha Impacted</div>
                  </div>
                </div>
              ))}
              {!outbreaks?.length && (
                <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
                  <Activity className="h-12 w-12 text-slate-500 animate-pulse" />
                  <p className="text-slate-500 font-black uppercase text-xs tracking-widest">Scanning Grid for Pathogens...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Intelligence Directives / List */}
        <Card className="lg:col-span-4 border-none shadow-2xl rounded-[3rem] p-10 bg-white space-y-8 flex flex-col h-full">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <Navigation className="h-7 w-7 text-primary" />
              Intelligence Directives
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium italic">Active strategic containment protocols for district nodes.</p>
          </div>
          
          <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {outbreaks?.length === 0 ? (
              <div className="text-center py-20 opacity-30 flex flex-col items-center gap-4">
                <CheckCircle className="h-12 w-12" />
                <p className="text-[10px] font-black uppercase tracking-widest">Grid Clear</p>
              </div>
            ) : outbreaks?.map((o) => (
              <div key={o.id} className="p-6 rounded-3xl bg-muted/30 border border-border group hover:bg-muted/50 transition-all cursor-pointer relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> {o.state} Sector
                    </h4>
                    <p className="text-lg font-black text-slate-900 tracking-tight">{o.pestName}</p>
                  </div>
                  <Badge variant={o.severity === 'Critical' ? 'destructive' : 'default'} className="text-[8px] font-black uppercase px-2">
                    {o.severity}
                  </Badge>
                </div>

                {editingOutbreakId === o.id ? (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <Textarea 
                      value={editStrategy} 
                      onChange={(e) => setEditStrategy(e.target.value)}
                      className="text-xs font-medium bg-white rounded-xl"
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleUpdateStrategy(o.id)} size="sm" className="flex-1 h-9 rounded-lg font-black text-[10px] bg-primary">
                        <Save className="h-3 w-3 mr-1" /> SAVE
                      </Button>
                      <Button variant="ghost" onClick={() => setEditingOutbreakId(null)} size="sm" className="h-9 w-9 p-0 rounded-lg">
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-slate-700 italic font-medium leading-relaxed border-l-4 border-primary/20 pl-4">
                      "{o.containmentStrategy}"
                    </p>
                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setEditingOutbreakId(o.id); setEditStrategy(o.containmentStrategy); }}
                          className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 px-3"
                        >
                          <Edit3 className="h-3 w-3 mr-1" /> Edit Directive
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteOutbreak(o.id)}
                          className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-destructive hover:bg-destructive/5 px-3"
                        >
                          Clear Alert
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="pt-8 border-t space-y-6">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center justify-between">
              Mandi Inflation Pulse
              <Badge variant="outline" className="text-[8px] border-amber-500 text-amber-600">LIVE SURVEILLANCE</Badge>
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border flex flex-col items-center justify-center text-center">
                <TrendingUp className="h-5 w-5 text-destructive mb-2" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">Onion Price</p>
                <p className="text-lg font-black text-destructive">+42% spike</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border flex flex-col items-center justify-center text-center">
                <TrendingUp className="h-5 w-5 text-primary mb-2" />
                <p className="text-[10px] font-bold text-slate-500 uppercase">Wheat Supply</p>
                <p className="text-lg font-black text-primary">Stable</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

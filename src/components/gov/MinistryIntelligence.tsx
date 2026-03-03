
"use client";

import React, { useMemo } from "react";
import { 
  AlertTriangle, 
  Globe, 
  CheckCircle, 
  ShieldAlert,
  MoveUpRight,
  Zap,
  Activity,
  Navigation,
  Lock
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppState } from "@/lib/app-state";

export function MinistryIntelligence() {
  const firestore = useFirestore();
  const { role } = useAppState();

  const outbreaksQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "pestOutbreaks"));
  }, [firestore]);

  const { data: outbreaks, isLoading } = useCollection(outbreaksQuery);

  const stats = useMemo(() => {
    if (!outbreaks) return { critical: 0, states: new Set() };
    const critical = outbreaks.filter(o => o.severity === 'Critical').length;
    const states = new Set(outbreaks.map(o => o.state));
    return { critical, states: states.size };
  }, [outbreaks]);

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
    <div className="space-y-8 animate-in fade-in duration-700 max-w-7xl mx-auto pb-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl rounded-[2rem] bg-primary/10 overflow-hidden relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black flex items-center gap-2 text-primary uppercase tracking-widest">
              <CheckCircle className="h-4 w-4" /> Certification Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black mb-2">58.4%</div>
            <Progress value={58.4} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-3 uppercase font-bold tracking-wider italic">12,450 Verified Clusters Across India</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2rem] bg-destructive/10 overflow-hidden relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black flex items-center gap-2 text-destructive uppercase tracking-widest">
              <ShieldAlert className="h-4 w-4" /> Critical Risk Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-destructive">{stats.critical}</div>
            <p className="text-[10px] text-destructive/60 mt-3 uppercase font-bold tracking-wider italic">Immediate Containment Required</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[2rem] bg-amber-500/10 overflow-hidden relative">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-black flex items-center gap-2 text-amber-600 uppercase tracking-widest">
              <Zap className="h-4 w-4" /> Surveillance Pulse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-amber-600">Active</div>
            <p className="text-[10px] text-amber-600/60 mt-3 uppercase font-bold tracking-wider italic">Mandi Inflation Monitoring Live</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-2xl rounded-[3rem] overflow-hidden bg-slate-900 text-white relative h-[650px]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
          
          <CardHeader className="relative z-10 p-10">
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-black tracking-tight flex items-center gap-3">
                  <Globe className="h-8 w-8 text-primary" />
                  Predictive Bio-Surveillance Map
                </CardTitle>
                <CardDescription className="text-slate-400 font-medium italic">Visualizing AI-predicted spread vectors across regional clusters</CardDescription>
              </div>
              <Badge className="bg-primary px-4 py-1.5 font-black uppercase text-[10px] shadow-lg shadow-primary/30">Live Intelligence</Badge>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-10 h-full">
            <div className="relative w-full h-full border border-white/5 rounded-[2.5rem] bg-black/20 backdrop-blur-sm overflow-hidden">
              {outbreaks?.map((outbreak, i) => (
                <div 
                  key={outbreak.id}
                  className="absolute flex flex-col items-center group cursor-pointer transition-all hover:scale-110"
                  style={{ 
                    top: `${20 + (i * 15)}%`, 
                    left: `${15 + (i * 20)}%` 
                  }}
                >
                  <div className={cn(
                    "relative h-14 w-14 rounded-full flex items-center justify-center shadow-2xl transition-all",
                    outbreak.severity === 'Critical' ? 'bg-destructive animate-pulse shadow-destructive/50' : 'bg-amber-500 shadow-amber-500/50'
                  )}>
                    <AlertTriangle className="h-7 w-7 text-white" />
                    <div className="absolute -right-16 -top-16 text-primary flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <MoveUpRight className="h-10 w-10 animate-bounce" />
                      <span className="text-[9px] font-black uppercase whitespace-nowrap bg-black/80 px-2 py-1 rounded-md">
                        Vector: {outbreak.predictedMovementVector || 'Calculating...'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 bg-white/10 backdrop-blur-xl p-3 rounded-2xl border border-white/10 min-w-[140px] text-center shadow-2xl">
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest">{outbreak.pestName}</div>
                    <div className="text-xs font-black">{outbreak.state} Cluster</div>
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

        <Card className="border-none shadow-2xl rounded-[3rem] p-10 bg-white space-y-8 flex flex-col">
          <div className="space-y-2">
            <CardTitle className="text-xl font-black flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-destructive" />
              Containment Protocols
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium italic">Active strategic directives for district magistrates.</p>
          </div>
          
          <div className="space-y-6 flex-1 overflow-y-auto pr-2">
            {outbreaks?.map((o) => (
              <div key={o.id} className="p-6 rounded-3xl bg-muted/30 border border-border group hover:bg-muted/50 transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-xs font-black text-primary uppercase tracking-widest">{o.state} Sector</h4>
                  <Badge variant={o.severity === 'Critical' ? 'destructive' : 'default'} className="text-[8px] font-black uppercase">
                    {o.severity}
                  </Badge>
                </div>
                <p className="text-sm text-slate-700 italic font-medium leading-relaxed">
                  "Deploy satellite-guided spraying units to intercept {o.pestName} before crossing {o.predictedMovementVector} boundary."
                </p>
                <Button variant="ghost" size="sm" className="mt-4 w-full h-9 rounded-xl text-[10px] font-black uppercase tracking-widest gap-2 bg-white shadow-sm">
                  <Navigation className="h-3 w-3" /> Deploy Units
                </Button>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Aggregate Risk Assessment</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="h-12 bg-destructive/10 rounded-2xl flex items-center justify-center font-black text-destructive text-xs shadow-inner">
                CRITICAL ({stats.critical})
              </div>
              <div className="h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center font-black text-amber-600 text-xs shadow-inner">
                MONITOR ({outbreaks?.length ? outbreaks.length - stats.critical : 0})
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

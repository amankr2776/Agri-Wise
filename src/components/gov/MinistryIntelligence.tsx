
"use client";

import React, { useMemo } from "react";
import { 
  AlertTriangle, 
  Map as MapIcon, 
  TrendingUp, 
  CheckCircle, 
  Globe, 
  ArrowUpRight, 
  MapPin, 
  ShieldAlert,
  MoveUpRight,
  Zap
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const PEST_OUTBREAKS = [
  { id: "1", pest: "Locust Swarm", state: "Rajasthan", severity: "Critical", lat: 26.9124, lng: 75.7873, predictedDir: "North-East" },
  { id: "2", pest: "Fall Armyworm", state: "Karnataka", severity: "High", lat: 12.9716, lng: 77.5946, predictedDir: "South" },
  { id: "3", pest: "Whitefly", state: "Punjab", severity: "Medium", lat: 30.9010, lng: 75.8573, predictedDir: "North" },
  { id: "4", pest: "Aphids", state: "Haryana", severity: "Low", lat: 29.0588, lng: 76.0856, predictedDir: "East" },
];

export function MinistryIntelligence() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass border-none bg-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
              <CheckCircle className="h-4 w-4" /> Certification Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">58%</div>
            <Progress value={58} className="h-2" />
            <p className="text-[10px] text-white/50 mt-2 uppercase font-bold tracking-wider">12,450 Certified Clusters</p>
          </CardContent>
        </Card>

        <Card className="glass border-none bg-red-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-500">
              <ShieldAlert className="h-4 w-4" /> Predictive Risk Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{PEST_OUTBREAKS.length}</div>
            <p className="text-[10px] text-white/50 mt-2 uppercase font-bold tracking-wider">High Probability of Spread</p>
          </CardContent>
        </Card>

        <Card className="glass border-none bg-orange-500/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-500">
              <Zap className="h-4 w-4" /> Early Warning Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">Active</div>
            <p className="text-[10px] text-white/50 mt-2 uppercase font-bold tracking-wider">Mandi Surveillance Live</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-slate-900 text-white relative h-[600px]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
          
          <CardHeader className="relative z-10 p-8">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Globe className="h-6 w-6 text-primary" />
                  Predictive Outbreak Surveillance
                </CardTitle>
                <CardDescription className="text-white/60">Live surveillance with AI-predicted spread vectors</CardDescription>
              </div>
              <Badge className="bg-primary vivid-glow-green">Real-time Map</Badge>
            </div>
          </CardHeader>

          <CardContent className="relative z-10 p-8 h-full">
            <div className="relative w-full h-full">
              {PEST_OUTBREAKS.map((outbreak, i) => (
                <div 
                  key={outbreak.id}
                  className="absolute flex flex-col items-center group cursor-pointer"
                  style={{ 
                    top: `${20 + (i * 15)}%`, 
                    left: `${20 + (i * 15)}%` 
                  }}
                >
                  <div className={cn(
                    "relative h-12 w-12 rounded-full flex items-center justify-center animate-pulse",
                    outbreak.severity === 'Critical' ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.8)]' : 'bg-orange-500'
                  )}>
                    <AlertTriangle className="h-6 w-6 text-white" />
                    {/* Prediction Arrow */}
                    <div className="absolute -right-12 -top-12 text-primary animate-bounce">
                      <MoveUpRight className="h-8 w-8" />
                      <span className="text-[8px] font-bold uppercase whitespace-nowrap">Predicted Spread: {outbreak.predictedDir}</span>
                    </div>
                  </div>
                  <div className="mt-2 glass p-2 rounded-xl border-none backdrop-blur-md min-w-[120px] text-center">
                    <div className="text-[10px] font-bold text-primary uppercase">{outbreak.pest}</div>
                    <div className="text-xs font-bold">{outbreak.state}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-none rounded-[2.5rem] p-8 space-y-6">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            Containment Strategy
          </CardTitle>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <h4 className="text-xs font-bold text-primary uppercase mb-2">Jaisalmer Zone</h4>
              <p className="text-sm text-white/70 italic">"Deploy aerial spraying units within 24 hours. Predicted swarm migration towards Bikaner clusters."</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 opacity-60">
              <h4 className="text-xs font-bold text-white/40 uppercase mb-2">Nashik Perimeter</h4>
              <p className="text-sm text-white/50">Surveillance drones active. No immediate spread detected beyond boundary.</p>
            </div>
          </div>
          <div className="pt-6 border-t border-white/10">
            <h4 className="text-xs font-bold text-white/30 uppercase tracking-widest mb-4">Risk Level Summary</h4>
            <div className="flex gap-2">
              <div className="h-10 flex-1 bg-red-500/20 rounded-lg flex items-center justify-center font-bold text-red-500">Critical (1)</div>
              <div className="h-10 flex-1 bg-orange-500/20 rounded-lg flex items-center justify-center font-bold text-orange-500">High (3)</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

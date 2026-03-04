
'use client';

import React, { useMemo, useState } from "react";
import { 
  AlertTriangle, 
  TrendingUp, 
  Truck, 
  Users, 
  Leaf, 
  Search, 
  MessageCircle, 
  ChevronRight,
  Zap,
  Info,
  ShieldAlert,
  MapPin,
  Activity,
  FlaskConical,
  Bug,
  Clock
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { useAppState } from "@/lib/app-state";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DashboardHomeProps {
  onNavigate: (section: string) => void;
}

interface AlertDetail {
  id: string;
  type: "Critical" | "Warning" | "Info";
  title: string;
  details: string;
  impact: string;
  region: string;
  time: string;
  actionPlan: string[];
  traditionalRemedy: string;
  volatility: string;
  icon: any;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const { name, city, role } = useAppState();
  const { t } = useTranslation();
  const [selectedAlert, setSelectedAlert] = useState<AlertDetail | null>(null);

  const today = useMemo(() => {
    return new Date().toLocaleDateString('en-IN', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }, []);

  const lastUpdated = useMemo(() => {
    return new Date().toLocaleTimeString('en-IN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }, []);

  const stats = [
    { id: "market", label: t("active_alerts"), value: "3", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { id: "market", label: t("best_price"), value: "₹2,150/q", sub: "Wheat (Nashik)", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { 
      id: role === "Logistics" ? "fleet" : "logistics", 
      label: t("active_shipments"), 
      value: "2", 
      icon: Truck, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10" 
    },
    { id: "network", label: t("community_posts"), value: "12", icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const quickActions = [
    { id: "diagnostics", label: t("ai_scan"), icon: Leaf, desc: "AI-powered pest detection", color: "text-primary", bg: "bg-primary/10" },
    { id: "market", label: t("market"), icon: Search, desc: "Live Mandi price trends", color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "logistics", label: "Book Transport", icon: Truck, desc: "Mandi-Link delivery", color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "network", label: t("network"), icon: MessageCircle, desc: "Kisan Network discussions", color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  const alerts: AlertDetail[] = [
    { 
      id: "alert-1",
      type: "Critical", 
      title: "Locust Swarm Detected", 
      details: "Schistocerca gregaria (Desert Locust) observed in high density clusters migrating from the western corridor.",
      impact: "Potential 100% crop loss in 12,000 hectares if not contained within 48 hours.",
      region: "Rajasthan Border (Jaisalmer Sector)", 
      time: "2h ago", 
      icon: AlertTriangle,
      volatility: "+18% projected price hike in pulse category",
      actionPlan: [
        "Immediate aerial spray of Malathion 95% ULV.",
        "Manual digging of trenches to trap crawlers.",
        "Report sightings to local agricultural outpost immediately."
      ],
      traditionalRemedy: "Create smoke screens using dried neem leaves and beat loud drums/utensils to deter swarms from settling on fields."
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-10">
      <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[2.5rem] bg-primary p-10 md:p-14 text-white shadow-2xl shadow-primary/20">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Leaf className="h-72 w-72 rotate-12" />
        </div>
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-3">
            <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-4 py-1 font-black text-[10px] uppercase tracking-widest">
              {today}
            </Badge>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-white/60">
              <Clock className="h-3 w-3" /> Grid updated at {lastUpdated}
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">
            {t("welcome")}, {name || 'Aman Kumar'} Ji!
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-2xl font-medium leading-relaxed">
            {t("field_status", { city: city || 'Bengaluru' })}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card className="glass-card border-white/20 shadow-xl hover:shadow-primary/10 hover:scale-[1.03] transition-all cursor-pointer rounded-3xl" onClick={() => onNavigate(stat.id)}>
              <CardContent className="p-8 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-black">{stat.value}</p>
                  {stat.sub && <p className="text-[10px] text-primary font-black uppercase italic">{stat.sub}</p>}
                </div>
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg", stat.bg, stat.color)}>
                  <stat.icon className="h-7 w-7" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
          <Zap className="h-6 w-6 text-primary" /> 
          {t("shortcuts")}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <motion.button key={action.id} variants={itemVariants} whileHover={{ scale: 1.05 }} onClick={() => onNavigate(action.id)} className="group flex flex-col items-center justify-center p-10 glass-card border-white/20 rounded-[2.5rem] hover:bg-primary transition-all duration-500 shadow-xl text-center">
              <div className={cn("h-16 w-16 mb-6 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover:bg-white/20 group-hover:scale-110", action.bg)}>
                <action.icon className={cn("h-8 w-8 group-hover:text-white transition-colors", action.color)} />
              </div>
              <p className="font-black text-xl mb-1 group-hover:text-white transition-colors">{action.label}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:text-white/70 transition-colors">{action.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-destructive" /> 
            Recent Intelligence Alerts
          </h2>
          <Button variant="ghost" className="text-xs font-black uppercase tracking-widest text-primary">View Global Map</Button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {alerts.map((alert) => (
            <motion.div key={alert.id} variants={itemVariants}>
              <Card 
                onClick={() => setSelectedAlert(alert)}
                className={cn(
                  "glass-card border-white/20 rounded-[2rem] overflow-hidden cursor-pointer hover:shadow-2xl transition-all border-l-8",
                  alert.type === 'Critical' ? 'border-l-destructive' : 'border-l-amber-500'
                )}
              >
                <CardContent className="p-8 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg",
                      alert.type === 'Critical' ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-600'
                    )}>
                      <alert.icon className={cn("h-7 w-7", alert.type === 'Critical' && "animate-pulse")} />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-lg tracking-tight">{alert.title}</h3>
                        <Badge variant={alert.type === 'Critical' ? 'destructive' : 'default'} className="text-[8px] font-black uppercase px-2 py-0.5 animate-pulse">
                          {alert.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {alert.region}</span>
                        <span>•</span>
                        <span>{alert.time}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 text-muted-foreground/30" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="rounded-[3rem] sm:max-w-[700px] p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-10 pb-6 bg-slate-50/50 border-b">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <Badge variant={selectedAlert?.type === 'Critical' ? 'destructive' : 'default'} className="rounded-full px-4 py-1 font-black uppercase text-[10px] tracking-widest mb-2">
                  {selectedAlert?.type} Alert
                </Badge>
                <DialogTitle className="text-4xl font-black tracking-tighter text-slate-900">{selectedAlert?.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground font-medium flex items-center gap-2 italic">
                  <Clock className="h-4 w-4" /> Detection recorded {selectedAlert?.time} in {selectedAlert?.region}
                </DialogDescription>
              </div>
              <div className={cn(
                "h-20 w-20 rounded-3xl flex items-center justify-center shadow-2xl",
                selectedAlert?.type === 'Critical' ? 'bg-destructive text-white shadow-destructive/20' : 'bg-amber-500 text-white shadow-amber-500/20'
              )}>
                {selectedAlert && <selectedAlert.icon className="h-10 w-10" />}
              </div>
            </div>
          </DialogHeader>
          <div className="p-10 space-y-10 max-h-[60vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <Activity className="h-4 w-4" /> Incident Analysis
              </h4>
              <p className="text-lg font-medium text-slate-700 leading-relaxed italic border-l-4 border-primary/20 pl-6">
                "{selectedAlert?.details}"
              </p>
              <div className="grid grid-cols-2 gap-6 pt-4">
                <div className="p-6 bg-muted/30 rounded-2xl border space-y-1">
                  <p className="text-[9px] font-black text-muted-foreground uppercase">Impact Assessment</p>
                  <p className="text-sm font-bold text-slate-800">{selectedAlert?.impact}</p>
                </div>
                <div className="p-6 bg-destructive/5 rounded-2xl border border-destructive/10 space-y-1">
                  <p className="text-[9px] font-black text-destructive uppercase">Market Volatility</p>
                  <p className="text-sm font-bold text-destructive">{selectedAlert?.volatility}</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-2">
                <ShieldAlert className="h-4 w-4" /> Mandatory Action Plan
              </h4>
              <div className="space-y-3">
                {selectedAlert?.actionPlan.map((step, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white transition-all">
                    <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                      {i + 1}
                    </div>
                    <span className="text-sm font-bold text-slate-800">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-8 bg-amber-50 rounded-3xl border border-amber-200 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                <FlaskConical className="h-20 w-20" />
              </div>
              <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Bug className="h-4 w-4" /> Heritage Wisdom (Desi Nuskha)
              </h4>
              <p className="text-sm font-medium text-amber-900 leading-relaxed italic relative z-10">
                "{selectedAlert?.traditionalRemedy}"
              </p>
            </div>
          </div>
          <div className="p-8 bg-slate-50 border-t flex justify-end gap-4">
            <Button variant="ghost" onClick={() => setSelectedAlert(null)} className="rounded-xl font-black text-xs uppercase tracking-widest">Close Intelligence</Button>
            <Button className="rounded-xl px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">Acknowledge Alert</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

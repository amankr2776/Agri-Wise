
'use client';

import React, { useMemo, useState, useEffect } from "react";
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
  ShieldAlert,
  MapPin,
  Activity,
  Bug,
  Clock,
  ArrowRight,
  Package,
  Info,
  FlaskConical,
  ClipboardCheck,
  RefreshCw,
  Tool,
  ShieldCheck,
  Microscope,
  Radio
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { useAppState } from "@/lib/app-state";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import { motion, useSpring, useTransform, animate } from "framer-motion";

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
  areaAffected: string;
  predictedPath: string;
}

function Counter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      onUpdate(value) {
        setCount(Math.floor(value));
      },
    });
    return () => controls.stop();
  }, [value]);

  return <span>{count}</span>;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const { name, city, role, setFleetActiveTab } = useAppState();
  const { t } = useTranslation();
  const [selectedAlert, setSelectedAlert] = useState<AlertDetail | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      setCurrentDate(now.toLocaleDateString('en-IN', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }));
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleDeepNavigate = (section: string, tab?: string) => {
    if (tab) setFleetActiveTab(tab);
    onNavigate(section);
  };

  const stats = useMemo(() => {
    if (role === "Farmer") {
      return [
        { id: "diagnostics", label: t("active_alerts"), value: 3, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
        { id: "market", label: t("best_price"), value: "₹2,150", sub: "Wheat (Nashik)", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
        { id: "logistics", label: "My Shipments", value: 2, icon: Truck, color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "network", label: "Network Posts", value: 12, icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
      ];
    } else if (role === "Expert" || role === "Authority") {
      return [
        { id: "expert-portal", label: "Pending Verifications", value: 15, icon: FlaskConical, color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "surveillance", label: "Active Outbreaks", value: 8, icon: Bug, color: "text-cyan-500", bg: "bg-cyan-500/10" },
        { id: "network", label: "Expert Insights", value: 45, icon: ClipboardCheck, color: "text-teal-500", bg: "bg-teal-500/10" },
        { id: "network", label: "Farmer Queries", value: 24, icon: MessageCircle, color: "text-sky-500", bg: "bg-sky-500/10" },
      ];
    } else {
      return [
        { id: "fleet", tab: "fleet", label: "Total Fleet", value: 45, icon: Truck, color: "text-primary", bg: "bg-primary/10" },
        { id: "fleet", tab: "bookings", label: "Active Loads", value: 28, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "fleet", tab: "fleet", label: "Available Units", value: 12, icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
        { id: "fleet", tab: "maintenance", label: "Maintenance", value: 5, icon: RefreshCw, color: "text-amber-500", bg: "bg-amber-500/10" },
      ];
    }
  }, [role, t]);

  const quickActions = useMemo(() => {
    if (role === "Farmer") {
      return [
        { id: "diagnostics", label: t("ai_scan"), icon: Leaf, desc: "Multimodal Analysis", color: "text-primary", bg: "bg-primary/10" },
        { id: "market", label: "Market Trends", icon: Search, desc: "Price Forecasting", color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "logistics", label: "Book Transport", icon: Truck, desc: "Mandi-Link Pro", color: "text-amber-500", bg: "bg-amber-500/10" },
        { id: "network", label: "Network Hub", icon: Users, desc: "Collaborate", color: "text-purple-500", bg: "bg-purple-500/10" },
      ];
    } else if (role === "Expert" || role === "Authority") {
      return [
        { id: "expert-portal", label: "Verify Protocols", icon: FlaskConical, desc: "Scientific Validation", color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "surveillance", label: "Outbreak Monitor", icon: Radio, desc: "Geospatial Intelligence", color: "text-cyan-500", bg: "bg-cyan-500/10" },
        { id: "network", label: "Publish Advisory", icon: ShieldCheck, desc: "Grid Broadcast", color: "text-teal-500", bg: "bg-teal-500/10" },
        { id: "settings", label: "Expert Profile", icon: Microscope, desc: "Professional Identity", color: "text-slate-500", bg: "bg-slate-500/10" },
      ];
    } else {
      return [
        { id: "fleet", tab: "fleet", label: "Manage Fleet", icon: Truck, desc: "All-India Units", color: "text-primary", bg: "bg-primary/10" },
        { id: "fleet", tab: "bookings", label: "Active Loads", icon: Package, desc: "Track Shipments", color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "fleet", tab: "settings", label: "Update Rates", icon: TrendingUp, desc: "Agency Profile", color: "text-amber-500", bg: "bg-amber-500/10" },
        { id: "fleet", tab: "maintenance", label: "Service Logs", icon: RefreshCw, desc: "Fleet Health", color: "text-purple-500", bg: "bg-purple-500/10" },
      ];
    }
  }, [role, t]);

  const alerts: AlertDetail[] = [
    { 
      id: "alert-1",
      type: "Critical", 
      title: "Locust Swarm Detected", 
      details: "Schistocerca gregaria observed in high density clusters near the border.",
      impact: "High risk to pulses and wheat crops. Potential yield loss estimated at 40%.",
      region: "Rajasthan Border Hub", 
      time: "2h ago", 
      icon: AlertTriangle,
      volatility: "+18% pulse price hike forecast",
      areaAffected: "12,000 Hectares",
      predictedPath: "North-West towards Punjab",
      actionPlan: ["Aerial pesticide spray", "Deep trenching", "Light traps"],
      traditionalRemedy: "Burning neem leaves and loud drumming to disrupt flight."
    }
  ];

  return (
    <div className="space-y-10">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative overflow-hidden rounded-[3rem] p-12 md:p-16 text-white shadow-2xl transition-all duration-700",
          (role === 'Expert' || role === 'Authority') ? "bg-slate-900" : "bg-primary"
        )}
      >
        <div className="absolute top-0 right-0 p-10 opacity-10">
          {(role === 'Expert' || role === 'Authority') ? <Microscope className="h-64 w-64 rotate-12" /> : <Leaf className="h-64 w-64 rotate-12" />}
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap gap-3">
            <Badge className="bg-white/20 text-white border-none px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">{currentDate || "Loading Date..."}</Badge>
            <Badge className="bg-white/10 text-white border-none px-4 py-1.5 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
              <Clock className="h-3 w-3" /> {t("last_updated")}: {currentTime || "--:--"}
            </Badge>
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter">
              {role === 'Expert' ? 'Scientist' : role === 'Authority' ? 'Authority' : t("welcome")}, {name} Ji!
            </h1>
            <p className="text-xl md:text-2xl text-white/80 font-medium italic">
              {role === 'Expert' ? 'Surveillance grid active. Monitoring regional pathogens.' : `Your professional agricultural grid in ${city} is active.`}
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={`stat-${role}-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card 
              className="glass-card cursor-pointer group hover:scale-[1.02] transition-all rounded-[2.5rem]" 
              onClick={() => handleDeepNavigate(stat.id, (stat as any).tab)}
            >
              <CardContent className="p-8 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black">
                    {typeof stat.value === 'number' ? <Counter value={stat.value} /> : stat.value}
                  </p>
                  {stat.sub && <p className="text-[10px] font-bold text-primary mt-1">{stat.sub}</p>}
                </div>
                <div className={cn("two-tone-icon", stat.bg, stat.color)}>
                  <stat.icon className="h-8 w-8 group-hover:scale-110 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <Zap className={cn("h-7 w-7", (role === 'Expert' || role === 'Authority') ? "text-blue-500" : "text-primary")} /> 
            Professional Command Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {quickActions.map((action, i) => (
              <motion.button 
                key={`action-${role}-${i}`} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => handleDeepNavigate(action.id, (action as any).tab)} 
                className={cn(
                  "flex items-center gap-8 p-10 glass-card rounded-[3rem] group transition-all text-left",
                  (role === 'Expert' || role === 'Authority') ? "hover:bg-slate-900" : "hover:bg-primary"
                )}
              >
                <div className={cn("two-tone-icon shrink-0 group-hover:bg-white/20", action.bg)}>
                  <action.icon className={cn("h-8 w-8 group-hover:text-white group-hover:rotate-12 transition-all", action.color)} />
                </div>
                <div>
                  <p className="font-black text-2xl group-hover:text-white tracking-tight">{action.label}</p>
                  <p className="text-[10px] font-black uppercase opacity-60 group-hover:text-white tracking-widest">{action.desc}</p>
                </div>
                <ChevronRight className="h-6 w-6 ml-auto opacity-20 group-hover:opacity-100 group-hover:text-white transition-all" />
              </motion.button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-destructive" /> Intelligence Alerts
          </h2>
          <div className="space-y-4 backdrop-blur-lg rounded-[3rem]">
            {alerts.map((alert) => (
              <Card 
                key={alert.id} 
                onClick={() => setSelectedAlert(alert)}
                className={cn(
                  "glass-card border-none cursor-pointer group hover:bg-muted/50 transition-all rounded-[2.5rem]",
                  alert.type === 'Critical' && "border-l-8 border-destructive"
                )}
              >
                <CardContent className="p-8 space-y-4">
                  <div className="flex justify-between items-start">
                    <Badge variant={alert.type === 'Critical' ? 'destructive' : 'default'} className={cn(
                      "font-black uppercase tracking-widest text-[9px]",
                      alert.type === 'Critical' && "animate-pulse-engagement"
                    )}>
                      {alert.type}
                    </Badge>
                    <span className="text-[10px] font-bold text-muted-foreground">{alert.time}</span>
                  </div>
                  <h3 className="text-xl font-black tracking-tight">{alert.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{alert.details}</p>
                  <div className="pt-4 border-t flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary">
                      <MapPin className="h-3 w-3" /> {alert.region}
                    </div>
                    <ArrowRight className="h-4 w-4 opacity-40 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="rounded-[3rem] sm:max-w-2xl p-10 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="sr-only">
            <DialogTitle>{selectedAlert?.title}</DialogTitle>
            <DialogDescription>Alert intelligence details</DialogDescription>
          </DialogHeader>
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <div className="h-16 w-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive">
                <AlertTriangle className="h-10 w-10" />
              </div>
              <Badge variant="destructive" className="h-8 px-6 font-black uppercase tracking-widest text-xs animate-pulse">Critical Priority</Badge>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-4xl font-black tracking-tighter">{selectedAlert?.title}</h2>
              <p className="text-lg font-medium text-slate-500 italic">Detected {selectedAlert?.time} in {selectedAlert?.region}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-3xl border space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("incident_analysis")}</p>
                <p className="text-lg font-black">{selectedAlert?.areaAffected}</p>
                <p className="text-[10px] font-bold text-primary flex items-center gap-1"><Activity className="h-3 w-3" /> {selectedAlert?.predictedPath}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{t("impact")}</p>
                <p className="text-lg font-black text-destructive">{selectedAlert?.volatility}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2">
                  <Bug className="h-4 w-4" /> {t("remedy_plan")}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/10">
                    <p className="text-[10px] font-black text-destructive uppercase mb-2">{t("chemical_cure")}</p>
                    <ul className="text-sm font-bold space-y-1">
                      {selectedAlert?.actionPlan.map((p, i) => <li key={i}>• {p}</li>)}
                    </ul>
                  </div>
                  <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                    <p className="text-[10px] font-black text-primary uppercase mb-2">{t("heritage_wisdom")}</p>
                    <p className="text-sm italic font-medium text-primary">"{selectedAlert?.traditionalRemedy}"</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="mt-8">
            <Button onClick={() => setSelectedAlert(null)} className="w-full h-14 rounded-2xl font-black text-lg">Acknowledge Grid Alert</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  AlertTriangle, 
  TrendingUp, 
  Truck, 
  Users, 
  Leaf, 
  ChevronRight,
  Zap,
  ShieldAlert,
  MapPin,
  Activity,
  Bug,
  Clock,
  ArrowRight,
  Package,
  FlaskConical,
  ClipboardCheck,
  RefreshCw,
  ShieldCheck,
  Microscope,
  Radio,
  MessageCircle,
  Volume2,
  UserCheck,
  Building2,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { motion, animate, AnimatePresence } from "framer-motion";
import { useFirestore, useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, query, where, orderBy } from "firebase/firestore";
import { FarmerOnboarding } from "./FarmerOnboarding";

interface DashboardHomeProps {
  onNavigate: (section: string) => void;
}

function Counter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      onUpdate(value) {
        setCount(Math.floor(value));
      },
    });
    return () => controls.stop();
  }, [value]);

  return <span>{count}</span>;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const router = useRouter();
  const { name, city, role, setFleetActiveTab, langCode } = useAppState();
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !audioRef.current) {
      audioRef.current = new Audio();
    }
  }, []);

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

  const farmerShipmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user || role !== "Farmer") return null;
    return query(collection(firestore, "bookings"), where("farmerId", "==", user.uid), orderBy("createdAt", "desc"));
  }, [firestore, user, role]);
  const { data: farmerShipments } = useCollection(farmerShipmentsQuery);

  const directivesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "intelligence_directives"), where("status", "==", "active"), orderBy("timestamp", "desc"));
  }, [firestore]);
  const { data: globalAlerts, isLoading: loadingAlerts } = useCollection(directivesQuery);

  const globalPostsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "posts"), orderBy("createdAt", "desc"));
  }, [firestore]);
  const { data: globalPosts, isLoading: loadingPosts } = useCollection(globalPostsQuery);

  const pendingPostsQuery = useMemoFirebase(() => {
    if (!firestore || (role !== "Expert" && role !== "Authority")) return null;
    return query(collection(firestore, "crops"), where("status", "==", "pending_expert_review"));
  }, [firestore, role]);
  const { data: pendingPosts, isLoading: loadingPending } = useCollection(pendingPostsQuery);

  const myVehiclesQuery = useMemoFirebase(() => {
    if (!firestore || !user || role !== "Logistics") return null;
    return query(collection(firestore, "vehicles"), where("ownerId", "==", user.uid));
  }, [firestore, user, role]);
  const { data: myVehicles, isLoading: loadingVehicles } = useCollection(myVehiclesQuery);

  const handleDeepNavigate = (item: any) => {
    if (item.url) { router.push(item.url); return; }
    if (item.tab) setFleetActiveTab(item.tab);
    onNavigate(item.id);
  };

  const handlePlayAlert = async (e: React.MouseEvent, alert: any) => {
    e.stopPropagation();
    if (isSpeaking) return;
    const text = `${alert.title}. ${alert.description}`;
    setIsSpeaking(true);
    try {
      const response = await fetch('/api/bhashini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, langCode })
      });
      const data = await response.json();
      if (data.audioContent && audioRef.current) {
        audioRef.current.src = `data:audio/wav;base64,${data.audioContent}`;
        audioRef.current.onended = () => setIsSpeaking(false);
        await audioRef.current.play();
      } else {
        const ut = new SpeechSynthesisUtterance(text);
        ut.lang = langCode === 'hi' ? 'hi-IN' : 'en-IN';
        ut.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(ut);
      }
    } catch (err) { setIsSpeaking(false); }
  };

  const stats = useMemo(() => {
    if (role === "Farmer") {
      return [
        { id: "diagnostics", label: t("active_alerts"), value: globalAlerts?.length ?? 0, isLoading: loadingAlerts, icon: AlertTriangle, color: "text-rose-500", bg: "bg-rose-500/10" },
        { id: "market", label: t("best_price"), value: "₹2,450", sub: "Wheat (Nashik)", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
        { id: "logistics", label: "Shipments", value: farmerShipments?.length ?? 0, icon: Truck, color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "network", label: "Network Activity", value: globalPosts?.length ?? 0, isLoading: loadingPosts, icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
      ];
    } else if (role === "Expert" || role === "Authority") {
      return [
        { id: "expert-portal", url: "/pro/expert-panel", label: "Audit Queue", value: pendingPosts?.length ?? 0, isLoading: loadingPending, icon: FlaskConical, color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "surveillance", url: "/pro/surveillance", label: "Bio-Threats", value: globalAlerts?.length ?? 0, isLoading: loadingAlerts, icon: Bug, color: "text-rose-500", bg: "bg-rose-500/10" },
        { id: "network", label: "Expert Insights", value: 45, icon: ClipboardCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { id: "network", label: "Farmer Queries", value: 24, icon: MessageCircle, color: "text-indigo-500", bg: "bg-indigo-500/10" },
      ];
    } else if (role === "Logistics") {
      return [
        { id: "logistics-bridge", url: "/pro/logistics-bridge", label: "Fleet Count", value: myVehicles?.length ?? 0, isLoading: loadingVehicles, icon: Truck, color: "text-primary", bg: "bg-primary/10" },
        { id: "logistics-bridge", url: "/pro/logistics-bridge", label: "Active Loads", value: 12, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "logistics-bridge", url: "/pro/logistics-bridge", label: "Operational", value: 8, icon: Activity, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { id: "logistics-bridge", url: "/pro/logistics-bridge", label: "Maintenance", value: 2, icon: RefreshCw, color: "text-amber-500", bg: "bg-amber-500/10" },
      ];
    }
    return [];
  }, [role, t, globalAlerts, loadingAlerts, farmerShipments, globalPosts, loadingPosts, pendingPosts, loadingPending, myVehicles, loadingVehicles]);

  const quickActions = useMemo(() => {
    if (role === "Farmer") {
      return [
        { id: "diagnostics", label: t("ai_scan"), icon: Leaf, desc: "Multimodal Analysis", color: "text-primary", bg: "bg-primary/10" },
        { id: "market", label: "Market Trends", icon: TrendingUp, desc: "Price Forecasting", color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "logistics", label: "Book Transport", icon: Truck, desc: "Mandi-Link Pro", color: "text-amber-500", bg: "bg-amber-500/10" },
        { id: "network", label: "Kisan Network", icon: Users, desc: "Grid Intelligence", color: "text-indigo-500", bg: "bg-indigo-500/10" },
      ];
    } else if (role === "Expert" || role === "Authority") {
      return [
        { id: "expert-portal", url: "/pro/expert-panel", label: "Protocol Audit", icon: FlaskConical, desc: "Scientific Validation", color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "surveillance", url: "/pro/surveillance", label: "Live Heatmap", icon: Radio, desc: "Outbreak Surveillance", color: "text-rose-500", bg: "bg-rose-500/10" },
        { id: "network", label: "Broadcast Advice", icon: ShieldCheck, desc: "National Directives", color: "text-emerald-500", bg: "bg-emerald-500/10" },
        { id: "settings", label: "Scientist Profile", icon: Microscope, desc: "Professional Sync", color: "text-slate-500", bg: "bg-slate-500/10" },
      ];
    }
    return [];
  }, [role, t]);

  return (
    <div className="space-y-12 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className={cn(
          "relative overflow-hidden rounded-[3.5rem] p-12 md:p-20 text-white shadow-[0_32px_64px_rgba(0,0,0,0.15)] group transition-all duration-700",
          (role === 'Expert' || role === 'Authority') ? "bg-slate-950" : "bg-primary"
        )}
      >
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/texture/1200/800')] opacity-5 mix-blend-overlay animate-slow-pan" />
        <div className="absolute top-0 right-0 p-16 opacity-10 transform scale-150 transition-transform group-hover:scale-[1.6] duration-1000">
          {(role === 'Expert' || role === 'Authority') ? <Microscope className="h-64 w-64" /> : <Leaf className="h-64 w-64 rotate-12" />}
        </div>
        <div className="relative z-10 space-y-8">
          <div className="flex flex-wrap gap-4">
            <Badge className="bg-white/20 backdrop-blur-md text-white border-none px-5 py-2 font-black uppercase tracking-[0.2em] text-[10px] shadow-lg">{currentDate || "SYNCING..."}</Badge>
            <Badge className="bg-white/10 backdrop-blur-md text-white border-none px-5 py-2 font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-2 shadow-lg">
              <Clock className="h-3.5 w-3.5 text-white/60" /> {currentTime || "--:--"}
            </Badge>
          </div>
          <div className="space-y-3">
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              {role === 'Expert' ? 'Scientist Node' : role === 'Authority' ? 'Authority Hub' : t("welcome")}, <br />
              <span className="text-white/90">{name} Ji</span>
            </h1>
            <p className="text-2xl md:text-3xl text-white/70 font-medium italic tracking-tight">
              {role === 'Expert' ? 'Regional surveillance active. Bio-security grid secure.' : `National agricultural intelligence active in ${city}.`}
            </p>
          </div>
          {role === 'Farmer' && <div className="pt-4"><FarmerOnboarding /></div>}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card cursor-pointer group hover:-translate-y-2 transition-all duration-500 rounded-[2.5rem] relative overflow-hidden" onClick={() => handleDeepNavigate(stat)}>
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-10 flex items-center justify-between relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-2">{stat.label}</p>
                  <p className="text-4xl font-black tracking-tighter">{stat.isLoading ? '...' : typeof stat.value === 'number' ? <Counter value={stat.value} /> : stat.value}</p>
                  {stat.sub && <p className="text-[11px] font-bold text-primary mt-2 flex items-center gap-1.5"><Sparkles className="h-3 w-3" /> {stat.sub}</p>}
                </div>
                <div className={cn("two-tone-icon h-16 w-16 rounded-[1.25rem] shadow-lg", stat.bg, stat.color)}>
                  <stat.icon className="h-8 w-8 group-hover:scale-110 transition-transform duration-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4">
        <div className="lg:col-span-8 space-y-10">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-3xl font-black tracking-tighter flex items-center gap-4">
              <Zap className={cn("h-8 w-8", (role === 'Expert' || role === 'Authority') ? "text-blue-500" : "text-primary")} /> 
              Grid Command Center
            </h2>
            <div className="h-px flex-1 bg-border/50 mx-8 hidden sm:block" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {quickActions.map((action, i) => (
              <motion.button 
                key={i} 
                onClick={() => handleDeepNavigate(action)} 
                className={cn(
                  "flex items-center gap-10 p-12 glass-card rounded-[3.5rem] group transition-all duration-500 text-left relative overflow-hidden cinematic-shadow",
                  (role === 'Expert' || role === 'Authority') ? "hover:bg-slate-950 hover:text-white" : "hover:bg-primary hover:text-white"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className={cn("two-tone-icon h-20 w-20 rounded-[1.75rem] shrink-0 group-hover:bg-white/20 shadow-xl", action.bg)}>
                  <action.icon className={cn("h-10 w-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500", action.color, "group-hover:text-white")} />
                </div>
                <div>
                  <p className="font-black text-3xl tracking-tighter mb-1">{action.label}</p>
                  <p className="text-[11px] font-black uppercase opacity-60 tracking-[0.2em]">{action.desc}</p>
                </div>
                <ChevronRight className="h-8 w-8 ml-auto opacity-20 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-500" />
              </motion.button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <h2 className="text-3xl font-black tracking-tighter flex items-center gap-4">
            <ShieldAlert className="h-8 w-8 text-rose-500" /> 
            Live Intelligence
          </h2>
          <ScrollArea className="h-[650px] pr-6 -mr-6 custom-scrollbar">
            <div className="space-y-8">
              {loadingAlerts ? (
                [1, 2, 3].map(i => <div key={i} className="h-48 rounded-[3rem] bg-muted/20 animate-pulse" />)
              ) : !globalAlerts?.length ? (
                <div className="p-16 text-center opacity-30 border-2 border-dashed rounded-[3.5rem] flex flex-col items-center gap-4">
                  <ShieldCheck className="h-16 w-16" />
                  <p className="text-xs font-black uppercase tracking-[0.2em]">All sectors clear</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {globalAlerts.map((alert) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card 
                        onClick={() => setSelectedAlert(alert)} 
                        className={cn(
                          "glass-card border-none cursor-pointer group hover:shadow-2xl transition-all duration-500 rounded-[3rem] border-l-[12px] overflow-hidden cinematic-shadow",
                          alert.severity === 'CRITICAL' ? "border-rose-500" : "border-indigo-500"
                        )}
                      >
                        <CardContent className="p-10 space-y-6">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-2">
                              {alert.severity === 'CRITICAL' && (
                                <Badge variant="destructive" className="font-black uppercase tracking-[0.2em] text-[9px] px-3 py-1 animate-pulse shadow-lg shadow-rose-500/20">Critical</Badge>
                              )}
                              <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase tracking-[0.2em] px-3 py-1">
                                <UserCheck className="h-3 w-3 mr-1.5" /> Scientist Verified
                              </Badge>
                            </div>
                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase">
                              {alert.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'JUST NOW'}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-2xl font-black tracking-tight leading-tight group-hover:text-primary transition-colors">{alert.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed font-medium italic">"{alert.description}"</p>
                          </div>
                          <div className="pt-6 border-t border-border/30 flex items-center justify-between">
                            <div className="flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-4 py-2 rounded-full">
                              <MapPin className="h-3.5 w-3.5" /> {alert.locationNode}
                            </div>
                            <div className="flex items-center gap-3">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => handlePlayAlert(e, alert)}
                                className={cn(
                                  "h-11 w-11 rounded-full bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all shadow-sm",
                                  isSpeaking && "animate-pulse"
                                )}
                              >
                                <Volume2 className="h-5 w-5" />
                              </Button>
                              <ArrowRight className="h-5 w-5 opacity-30 group-hover:opacity-100 group-hover:translate-x-1.5 transition-all" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="rounded-[4rem] sm:max-w-3xl p-0 overflow-hidden border-none shadow-[0_64px_128px_rgba(0,0,0,0.3)] bg-white">
          <div className="bg-slate-950 p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/alert/1200/800')] opacity-10 grayscale" />
            <div className="absolute top-0 right-0 p-12 opacity-10 transform scale-150 rotate-12"><Microscope className="h-48 w-48" /></div>
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-6 mb-6">
                <div className={cn(
                  "h-20 w-20 rounded-3xl flex items-center justify-center shadow-2xl transform -rotate-3",
                  selectedAlert?.severity === 'CRITICAL' ? "bg-rose-600 shadow-rose-500/40" : "bg-indigo-600 shadow-indigo-500/40"
                )}>
                  <AlertTriangle className="h-12 w-12 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-5xl font-black tracking-tighter leading-none mb-2">{selectedAlert?.title}</DialogTitle>
                  <DialogDescription className="text-white/50 font-black uppercase tracking-[0.3em] text-[10px]">
                    National Grid Directive • Sector Authorized
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-12 space-y-10">
            <div className="grid grid-cols-2 gap-8">
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-border/50 space-y-3 cinematic-shadow">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Target Sector</p>
                <p className="text-2xl font-black tracking-tight">{selectedAlert?.locationNode}</p>
              </div>
              <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-border/50 space-y-3 cinematic-shadow">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Grid Priority</p>
                <p className={cn("text-2xl font-black uppercase tracking-tighter", selectedAlert?.severity === 'CRITICAL' ? "text-rose-600" : "text-indigo-600")}>
                  {selectedAlert?.severity || 'Standard'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[11px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-3 px-2">
                <ShieldCheck className="h-5 w-5" /> Professional Containment Strategy
              </h4>
              <div className="p-12 rounded-[3.5rem] bg-primary/5 border border-primary/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-1000"><Zap className="h-32 w-32" /></div>
                <p className="text-2xl font-bold text-slate-800 leading-[1.6] italic relative z-10 pr-12">
                  "{selectedAlert?.description}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 p-8 bg-muted/30 rounded-[2.5rem] border border-dashed border-primary/20">
              <div className="h-14 w-14 bg-white rounded-2xl shadow-md flex items-center justify-center shrink-0">
                <UserCheck className="h-8 w-8 text-primary" />
              </div>
              <div className="text-xs font-bold text-muted-foreground leading-relaxed">
                Directive authenticated via <span className="text-primary font-black uppercase tracking-widest">Scientist Node 442</span>. 
                Immediate implementation requested to minimize regional pathogen propagation.
              </div>
            </div>
          </div>

          <DialogFooter className="p-12 pt-0">
            <Button onClick={() => setSelectedAlert(null)} className="w-full h-20 rounded-[2.5rem] font-black text-2xl shadow-2xl shadow-primary/30 active:scale-[0.98] transition-all">
              Acknowledge & Sync Grid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <audio ref={audioRef} className="hidden" aria-hidden="true" />
    </div>
  );
}

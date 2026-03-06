'use client';

import React, { useMemo, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  AlertTriangle, 
  TrendingUp, 
  Truck, 
  Users, 
  Leaf, 
  Search, 
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
  UserCheck
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

  // Real-Time Data Fetching
  const farmerShipmentsQuery = useMemoFirebase(() => {
    if (!firestore || !user || role !== "Farmer") return null;
    return query(collection(firestore, "bookings"), where("farmerId", "==", user.uid));
  }, [firestore, user, role]);
  const { data: farmerShipments, isLoading: loadingFarmerShipments } = useCollection(farmerShipmentsQuery);

  const globalAlertsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // Order by createdAt to show newest first, requires index in production but works for demo
    return query(collection(firestore, "pestOutbreaks"), orderBy("createdAt", "desc"));
  }, [firestore]);
  const { data: globalAlerts, isLoading: loadingAlerts } = useCollection(globalAlertsQuery);

  const globalPostsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "posts"));
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
    if (item.url) {
      router.push(item.url);
      return;
    }
    if (item.tab) setFleetActiveTab(item.tab);
    onNavigate(item.id);
  };

  const handlePlayAlert = async (e: React.MouseEvent, alert: any) => {
    e.stopPropagation();
    if (isSpeaking) return;
    
    const text = `${alert.pestName} directive for ${alert.state}. Severity is ${alert.severity}. Expert advice: ${alert.containmentStrategy}`;
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
    } catch (err) {
      setIsSpeaking(false);
    }
  };

  const stats = useMemo(() => {
    if (role === "Farmer") {
      return [
        { id: "diagnostics", label: t("active_alerts"), value: globalAlerts?.length ?? 0, isLoading: loadingAlerts, icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
        { id: "market", label: t("best_price"), value: "₹2,450", sub: "Wheat (Nashik)", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
        { id: "logistics", label: "My Shipments", value: farmerShipments?.length ?? 0, isLoading: loadingFarmerShipments, icon: Truck, color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "network", label: "Network Posts", value: globalPosts?.length ?? 0, isLoading: loadingPosts, icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
      ];
    } else if (role === "Expert" || role === "Authority") {
      return [
        { id: "expert-portal", url: "/pro/expert-panel", label: "Audit Queue", value: pendingPosts?.length ?? 0, isLoading: loadingPending, icon: FlaskConical, color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "surveillance", url: "/pro/surveillance", label: "Active Threats", value: globalAlerts?.length ?? 0, isLoading: loadingAlerts, icon: Bug, color: "text-cyan-500", bg: "bg-cyan-500/10" },
        { id: "network", label: "Expert Insights", value: 45, icon: ClipboardCheck, color: "text-teal-500", bg: "bg-teal-500/10" },
        { id: "network", label: "Farmer Queries", value: 24, icon: MessageCircle, color: "text-sky-500", bg: "bg-sky-500/10" },
      ];
    } else if (role === "Logistics") {
      const totalFleet = myVehicles?.length ?? 0;
      return [
        { id: "logistics-bridge", url: "/pro/logistics-bridge", label: "Total Fleet", value: totalFleet, isLoading: loadingVehicles, icon: Truck, color: "text-primary", bg: "bg-primary/10" },
        { id: "logistics-bridge", url: "/pro/logistics-bridge", label: "Active Loads", value: 12, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "logistics-bridge", url: "/pro/logistics-bridge", label: "Available Units", value: 8, icon: Activity, color: "text-green-500", bg: "bg-green-500/10" },
        { id: "logistics-bridge", url: "/pro/logistics-bridge", label: "Maintenance", value: 2, icon: RefreshCw, color: "text-amber-500", bg: "bg-amber-500/10" },
      ];
    }
    return [];
  }, [role, t, globalAlerts, loadingAlerts, farmerShipments, loadingFarmerShipments, globalPosts, loadingPosts, pendingPosts, loadingPending, myVehicles, loadingVehicles]);

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
        { id: "expert-portal", url: "/pro/expert-panel", label: "Verify Protocols", icon: FlaskConical, desc: "Scientific Validation", color: "text-blue-500", bg: "bg-blue-500/10" },
        { id: "surveillance", url: "/pro/surveillance", label: "Outbreak Monitor", icon: Radio, desc: "Geospatial Intelligence", color: "text-cyan-500", bg: "bg-cyan-500/10" },
        { id: "network", label: "Publish Advisory", icon: ShieldCheck, desc: "Grid Broadcast", color: "text-teal-500", bg: "bg-teal-500/10" },
        { id: "settings", label: "Expert Profile", icon: Microscope, desc: "Professional Identity", color: "text-slate-500", bg: "bg-slate-500/10" },
      ];
    } else if (role === "Logistics") {
      return [
        { id: "logistics-bridge", url: "/pro/logistics-bridge", label: "Manage Fleet", icon: Truck, desc: "All-India Units", color: "text-primary", bg: "bg-primary/10" },
        { id: "logistics-bridge", url: "/pro/logistics-bridge", label: "Agency Profile", icon: Building2, desc: "Sync Rates", color: "text-amber-500", bg: "bg-amber-500/10" },
      ];
    }
    return [];
  }, [role, t]);

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
            <Badge className="bg-white/20 text-white border-none px-4 py-1.5 font-bold uppercase tracking-widest text-[10px]">{currentDate || "Loading..."}</Badge>
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
          {role === 'Farmer' && <FarmerOnboarding />}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="glass-card cursor-pointer group hover:scale-105 transition-transform active:scale-95 rounded-[2.5rem]" onClick={() => handleDeepNavigate(stat)}>
              <CardContent className="p-8 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{stat.label}</p>
                  <p className="text-3xl font-black">{stat.isLoading ? '...' : typeof stat.value === 'number' ? <Counter value={stat.value} /> : stat.value}</p>
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
        <div className="lg:col-span-8 space-y-10">
          <h2 className="text-2xl font-black flex items-center gap-3">
            <Zap className={cn("h-7 w-7", (role === 'Expert' || role === 'Authority') ? "text-blue-500" : "text-primary")} /> 
            Professional Command Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {quickActions.map((action, i) => (
              <motion.button 
                key={i} 
                onClick={() => handleDeepNavigate(action)} 
                className={cn(
                  "flex items-center gap-8 p-10 glass-card rounded-[3rem] group transition-all text-left hover:scale-105 active:scale-95",
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
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              {loadingAlerts ? (
                [1, 2, 3].map(i => <div key={i} className="h-40 rounded-[2.5rem] bg-muted/20 animate-pulse" />)
              ) : !globalAlerts?.length ? (
                <div className="p-10 text-center opacity-40 border-2 border-dashed rounded-[3rem]">
                  <ShieldCheck className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-sm font-bold">No active pathogen alerts in your sector.</p>
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
                          "glass-card border-none cursor-pointer group hover:bg-muted/50 transition-all rounded-[2.5rem] border-l-8 overflow-hidden",
                          alert.severity === 'Critical' ? "border-destructive shadow-lg shadow-destructive/5" : "border-amber-500"
                        )}
                      >
                        <CardContent className="p-8 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="flex gap-2">
                              {alert.severity === 'Critical' && (
                                <Badge variant="destructive" className="font-black uppercase tracking-widest text-[9px] animate-pulse-engagement">Critical</Badge>
                              )}
                              <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase tracking-widest">
                                <UserCheck className="h-3 w-3 mr-1" /> Expert Verified
                              </Badge>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground">
                              {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xl font-black tracking-tight">{alert.pestName}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed italic">"{alert.containmentStrategy}"</p>
                          </div>
                          <div className="pt-4 border-t flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-primary">
                              <MapPin className="h-3 w-3" /> {alert.state} Hub
                            </div>
                            <div className="flex items-center gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={(e) => handlePlayAlert(e, alert)}
                                className={cn(
                                  "h-10 w-10 rounded-full bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all",
                                  isSpeaking && "animate-pulse"
                                )}
                              >
                                <Volume2 className="h-5 w-5" />
                              </Button>
                              <ArrowRight className="h-4 w-4 opacity-40 group-hover:translate-x-1 transition-transform" />
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
        <DialogContent className="rounded-[3rem] sm:max-w-2xl p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-slate-900 p-10 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Microscope className="h-32 w-32 rotate-12" /></div>
            <DialogHeader className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center shadow-lg",
                  selectedAlert?.severity === 'Critical' ? "bg-destructive" : "bg-amber-500"
                )}>
                  <AlertTriangle className="h-10 w-10 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-4xl font-black tracking-tighter">{selectedAlert?.pestName}</DialogTitle>
                  <DialogDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    National Grid Directive | Verified by Dr. Aman Kumar
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>

          <div className="p-10 space-y-8">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-[2rem] border space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Region Affected</p>
                <p className="text-lg font-black">{selectedAlert?.state}</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-[2rem] border space-y-2">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Area Assessment</p>
                <p className="text-lg font-black text-destructive">{selectedAlert?.areaHectares || '12,000'} Hectares</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Professional Containment Strategy
              </h4>
              <div className="p-8 rounded-[2.5rem] bg-primary/5 border border-primary/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Zap className="h-20 w-20" /></div>
                <p className="text-xl font-bold text-slate-800 leading-relaxed italic relative z-10">
                  "{selectedAlert?.containmentStrategy}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-6 bg-muted/30 rounded-2xl border border-dashed">
              <UserCheck className="h-6 w-6 text-primary" />
              <div className="text-[10px] font-bold text-muted-foreground leading-tight">
                This directive was issued by the <span className="text-primary">Scientist Node AMAN_EXP_01</span>. 
                Follow all protocols to minimize regional pathogen spread.
              </div>
            </div>
          </div>

          <DialogFooter className="p-10 pt-0">
            <Button onClick={() => setSelectedAlert(null)} className="w-full h-16 rounded-[2rem] font-black text-xl shadow-xl shadow-primary/20">
              Acknowledge Directive
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <audio ref={audioRef} className="hidden" aria-hidden="true" />
    </div>
  );
}

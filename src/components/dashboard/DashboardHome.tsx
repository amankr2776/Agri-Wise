
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
    { id: "market", label: "Active Alerts", value: "3", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { id: "market", label: "Best Price Today", value: "₹2,150/q", sub: "Wheat (Nashik)", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { 
      id: role === "Logistics" ? "fleet" : "logistics", 
      label: "Active Shipments", 
      value: "2", 
      icon: Truck, 
      color: "text-blue-500", 
      bg: "bg-blue-500/10" 
    },
    { id: "network", label: "Community Posts", value: "12", icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const quickActions = [
    { id: "diagnostics", label: "Diagnose Crop", icon: Leaf, desc: "AI-powered pest detection", color: "text-primary", bg: "bg-primary/10" },
    { id: "market", label: "Check Prices", icon: Search, desc: "Live Mandi price trends", color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "logistics", label: "Book Transport", icon: Truck, desc: "Mandi-Link delivery", color: "text-amber-500", bg: "bg-amber-500/10" },
    { id: "network", label: "Ask Community", icon: MessageCircle, desc: "Kisan Network discussions", color: "text-purple-500", bg: "bg-purple-500/10" },
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
    },
    { 
      id: "alert-2",
      type: "Warning", 
      title: "Onion Price Spike (+42%)", 
      details: "Unseasonal rains in Nashik have disrupted supply chains leading to a significant market value surge.",
      impact: "Projected shortage in retail markets; Farmer gate price rising to ₹3,200/quintal.",
      region: "Nashik Mandi (Maharashtra)", 
      time: "5h ago", 
      icon: TrendingUp,
      volatility: "Extreme volatility expected for next 14 days",
      actionPlan: [
        "Hold inventory if storage conditions allow for another 10 days.",
        "Utilize Mandi-Link for urgent refrigerated transport to high-demand hubs.",
        "Monitor export policy updates from the Ministry."
      ],
      traditionalRemedy: "Ensure onion stacks are well-ventilated using bamboo structures (Chawls) to prevent moisture rot during rainfall."
    },
    { 
      id: "alert-3",
      type: "Info", 
      title: "Fertilizer Subsidy Update", 
      details: "New government directives issued for DAP and Urea procurement for the upcoming Rabi season.",
      impact: "Benefit of ₹450 per bag for small and marginal farmers with verified Kisan Credit Cards.",
      region: "National (Direct Benefit Transfer)", 
      time: "1d ago", 
      icon: Zap,
      volatility: "Stable pricing ensured by government intervention",
      actionPlan: [
        "Update Aadhaar-linked bank details at the nearest Cooperative.",
        "Verify land records on the KisanMitra digital vault.",
        "Pre-book stocks to avoid seasonal peak-time shortages."
      ],
      traditionalRemedy: "Supplement chemical fertilizers with vermicompost and cow-dung manure to maintain soil microbial health."
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-10"
    >
      {/* Welcome Banner */}
      <motion.div 
        variants={itemVariants}
        className="relative overflow-hidden rounded-[2.5rem] bg-primary p-10 md:p-14 text-white shadow-2xl shadow-primary/20"
      >
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
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter">Namaste, {name || 'Aman Kumar'} Ji!</h1>
          <p className="text-xl md:text-2xl text-primary-foreground/80 max-w-2xl font-medium leading-relaxed">
            Your fields in <span className="text-white underline decoration-white/30 underline-offset-8">{city || 'Bengaluru'}</span> are looking healthy. Market intelligence suggests optimal momentum for your crop cycle.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={i} variants={itemVariants}>
            <Card 
              className="glass-card border-white/20 shadow-xl hover:shadow-primary/10 hover:scale-[1.03] transition-all cursor-pointer rounded-3xl"
              onClick={() => onNavigate(stat.id)}
            >
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

      {/* Quick Actions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
          <Zap className="h-6 w-6 text-primary" /> 
          Agri-Intelligence Shortcuts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action) => (
            <motion.button
              key={action.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              onClick={() => onNavigate(action.id)}
              className="group flex flex-col items-center justify-center p-10 glass-card border-white/20 rounded-[2.5rem] hover:bg-primary transition-all duration-500 shadow-xl text-center"
            >
              <div className={cn("h-16 w-16 mb-6 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 group-hover:bg-white/20 group-hover:scale-110", action.bg)}>
                <action.icon className={cn("h-8 w-8 group-hover:text-white transition-colors", action.color)} />
              </div>
              <p className="font-black text-xl mb-1 group-hover:text-white transition-colors">{action.label}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 group-hover:text-white/70 transition-colors">{action.desc}</p>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight">Intelligence Surveillance Feed</h2>
          <Button 
            variant="link" 
            className="text-primary font-black text-xs uppercase tracking-widest"
            onClick={() => onNavigate("market")}
          >
            Full Analysis History <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {alerts.map((alert) => (
            <motion.div key={alert.id} variants={itemVariants}>
              <Card 
                className="glass-card border-white/20 shadow-xl rounded-[2rem] overflow-hidden hover:bg-white/90 cursor-pointer transition-all hover:translate-x-2"
                onClick={() => setSelectedAlert(alert)}
              >
                <CardContent className="p-0 flex items-center">
                  <div className={cn(
                    "w-2 self-stretch",
                    alert.type === 'Critical' ? 'bg-destructive' : alert.type === 'Warning' ? 'bg-amber-500' : 'bg-blue-500'
                  )} />
                  <div className="p-8 flex-1 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                      <div className={cn("h-16 w-16 rounded-[1.5rem] flex items-center justify-center shadow-lg", 
                        alert.type === 'Critical' ? 'bg-destructive/10 text-destructive' : 
                        alert.type === 'Warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                      )}>
                        <alert.icon className={cn("h-8 w-8", alert.type === 'Critical' && "animate-pulse")} />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-2xl tracking-tighter text-slate-900">{alert.title}</span>
                          <Badge 
                            variant={alert.type === 'Critical' ? 'destructive' : 'outline'} 
                            className={cn(
                              "text-[10px] uppercase font-black px-3 py-0.5 tracking-[0.15em]",
                              alert.type === 'Critical' && "animate-pulse"
                            )}
                          >
                            {alert.type} PRIORITY
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground font-bold flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5" /> {alert.region} • {alert.time}
                        </p>
                      </div>
                    </div>
                    <div className="h-12 w-12 rounded-full flex items-center justify-center bg-muted/50 text-muted-foreground">
                      <ChevronRight className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Intelligence Alert Detail Modal */}
      <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
        <DialogContent className="max-w-3xl rounded-[3rem] p-0 overflow-hidden border-none shadow-2xl glass-card">
          {selectedAlert && (
            <div className="flex flex-col">
              <DialogHeader className="sr-only">
                <DialogTitle>{selectedAlert.title}</DialogTitle>
                <DialogDescription>{selectedAlert.details}</DialogDescription>
              </DialogHeader>

              <div className={cn(
                "p-12 text-white space-y-6 relative overflow-hidden",
                selectedAlert.type === 'Critical' ? 'bg-destructive shadow-[inset_0_-100px_100px_-50px_rgba(0,0,0,0.2)]' : 
                selectedAlert.type === 'Warning' ? 'bg-amber-500 shadow-[inset_0_-100px_100px_-50px_rgba(0,0,0,0.2)]' : 'bg-blue-600'
              )}>
                <div className="absolute top-0 right-0 p-12 opacity-10">
                  <ShieldAlert className="h-64 w-64 rotate-12" />
                </div>
                <div className="relative z-10 flex justify-between items-start">
                  <div className="h-20 w-20 bg-white/20 rounded-[1.5rem] flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-2xl">
                    <selectedAlert.icon className="h-10 w-10 text-white" />
                  </div>
                  <Badge className="bg-black/20 text-white border-white/20 font-black text-xs uppercase tracking-[0.2em] px-6 py-2 backdrop-blur-md">
                    Level: {selectedAlert.type} Threat
                  </Badge>
                </div>
                <div className="relative z-10 space-y-2">
                  <h3 className="text-5xl font-black tracking-tighter leading-tight">{selectedAlert.title}</h3>
                  <p className="text-white/80 text-xl font-bold flex items-center gap-3">
                    <MapPin className="h-5 w-5" /> {selectedAlert.region} • {selectedAlert.time}
                  </p>
                </div>
              </div>

              <div className="p-12 space-y-10 bg-white/95">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em] flex items-center gap-2">
                      <Info className="h-4 w-4" /> Incident Analysis
                    </h4>
                    <p className="text-lg font-bold text-slate-800 leading-relaxed">
                      {selectedAlert.details}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.3em] flex items-center gap-2">
                      <Activity className="h-4 w-4" /> Impact Assessment
                    </h4>
                    <p className="text-lg font-bold text-slate-800 leading-relaxed">
                      {selectedAlert.impact}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-2 border-b-2 border-primary/10 pb-4">
                    <FlaskConical className="h-5 w-5" /> Mandatory Field Protocol (The Cure)
                  </h4>
                  <ul className="grid grid-cols-1 gap-4">
                    {selectedAlert.actionPlan.map((action, i) => (
                      <li key={i} className="flex gap-6 p-6 glass-card border-slate-100 rounded-3xl hover:border-primary/30 transition-all group">
                        <div className="h-10 w-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-lg font-black shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                          {i + 1}
                        </div>
                        <p className="text-md font-bold text-slate-700 leading-tight flex-1 flex items-center">{action}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  <div className="p-8 bg-amber-50 rounded-[2.5rem] border border-amber-100 space-y-4 shadow-sm">
                    <h4 className="text-[10px] font-black uppercase text-amber-600 tracking-[0.3em] flex items-center gap-2">
                      <Bug className="h-5 w-5" /> Heritage Wisdom (Desi Nuskha)
                    </h4>
                    <p className="text-md italic font-bold text-amber-900 leading-relaxed pl-6 border-l-4 border-amber-200">
                      "{selectedAlert.traditionalRemedy}"
                    </p>
                  </div>
                  <div className="p-8 bg-slate-900 rounded-[2.5rem] border border-slate-800 space-y-4 shadow-2xl text-white">
                    <h4 className="text-[10px] font-black uppercase text-primary tracking-[0.3em] flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" /> Economic Impact (Price Forecast)
                    </h4>
                    <p className="text-xl font-black text-white/90 leading-tight">
                      {selectedAlert.volatility}
                    </p>
                    <p className="text-[10px] font-bold text-white/40 uppercase">Projected Regional Volatility Period: 14 Days</p>
                  </div>
                </div>

                <div className="pt-8 border-t flex items-center justify-center gap-4 text-muted-foreground">
                  <ShieldAlert className="h-4 w-4" />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                    Verified Intelligence Node: KisanMitra National Grid
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

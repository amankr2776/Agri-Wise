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
  Bug
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
    { id: "diagnostics", label: "Diagnose Crop", icon: Leaf, desc: "AI-powered pest detection" },
    { id: "market", label: "Check Prices", icon: Search, desc: "Live Mandi price trends" },
    { id: "logistics", label: "Book Transport", icon: Truck, desc: "Mandi-Link delivery" },
    { id: "network", label: "Ask Community", icon: MessageCircle, desc: "Kisan Network discussions" },
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
      actionPlan: [
        "Update Aadhaar-linked bank details at the nearest Cooperative.",
        "Verify land records on the KisanMitra digital vault.",
        "Pre-book stocks to avoid seasonal peak-time shortages."
      ],
      traditionalRemedy: "Supplement chemical fertilizers with vermicompost and cow-dung manure to maintain soil microbial health."
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2rem] bg-primary p-8 md:p-12 text-white shadow-xl">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Leaf className="h-64 w-64 rotate-12" />
        </div>
        <div className="relative z-10 space-y-2">
          <Badge className="bg-white/20 text-white border-none backdrop-blur-md px-3 py-1 mb-2">
            {today}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Namaste, {name || 'Farmer'} Ji!</h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl">
            Your fields in {city || 'your region'} are looking healthy. Market intelligence suggests optimal selling windows for your region.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card 
            key={i} 
            className="border-none shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer rounded-2xl"
            onClick={() => onNavigate(stat.id)}
          >
            <CardContent className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-black">{stat.value}</p>
                {stat.sub && <p className="text-[10px] text-muted-foreground font-medium">{stat.sub}</p>}
              </div>
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" /> Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={() => onNavigate(action.id)}
              className="group flex flex-col items-center justify-center p-8 bg-card border border-border rounded-3xl hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm text-center"
            >
              <div className="h-14 w-14 bg-muted group-hover:bg-white/20 rounded-2xl flex items-center justify-center mb-4 transition-colors">
                <action.icon className="h-8 w-8 text-primary group-hover:text-white" />
              </div>
              <p className="font-bold text-lg mb-1">{action.label}</p>
              <p className="text-xs opacity-60 font-medium">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Recent Intelligence Alerts</h2>
          <Button 
            variant="link" 
            className="text-primary font-bold"
            onClick={() => onNavigate("market")}
          >
            View History
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-4">
          {alerts.map((alert) => (
            <Card 
              key={alert.id} 
              className="border-none shadow-sm rounded-2xl overflow-hidden hover:bg-muted/50 cursor-pointer transition-all hover:translate-x-1"
              onClick={() => setSelectedAlert(alert)}
            >
              <CardContent className="p-0 flex items-center">
                <div className={cn(
                  "w-1.5 self-stretch",
                  alert.type === 'Critical' ? 'bg-destructive' : alert.type === 'Warning' ? 'bg-amber-500' : 'bg-blue-500'
                )} />
                <div className="p-6 flex-1 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                      alert.type === 'Critical' ? 'bg-destructive/10 text-destructive' : 
                      alert.type === 'Warning' ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      <alert.icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{alert.title}</span>
                        <Badge variant={alert.type === 'Critical' ? 'destructive' : 'outline'} className="text-[10px] uppercase font-bold px-2 py-0">
                          {alert.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">{alert.region} • {alert.time}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Intelligence Alert Detail Modal */}
      <Dialog open={!!selectedAlert} onOpenChange={(open) => !open && setSelectedAlert(null)}>
        <DialogContent className="max-w-2xl rounded-[2.5rem] p-0 overflow-hidden border-none shadow-2xl">
          {selectedAlert && (
            <div className="flex flex-col">
              <DialogHeader className="sr-only">
                <DialogTitle>{selectedAlert.title}</DialogTitle>
                <DialogDescription>{selectedAlert.details}</DialogDescription>
              </DialogHeader>

              <div className={cn(
                "p-10 text-white space-y-4",
                selectedAlert.type === 'Critical' ? 'bg-destructive' : 
                selectedAlert.type === 'Warning' ? 'bg-amber-500' : 'bg-blue-600'
              )}>
                <div className="flex justify-between items-start">
                  <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <selectedAlert.icon className="h-8 w-8 text-white" />
                  </div>
                  <Badge className="bg-white/20 text-white border-none font-black text-xs uppercase tracking-widest px-4 py-1">
                    {selectedAlert.type} Threat Level
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h3 className="text-4xl font-black tracking-tighter">{selectedAlert.title}</h3>
                  <p className="text-white/80 font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" /> {selectedAlert.region} • {selectedAlert.time}
                  </p>
                </div>
              </div>

              <div className="p-10 space-y-8 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                      <Info className="h-3 w-3" /> Event Intelligence
                    </h4>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">
                      {selectedAlert.details}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                      <Activity className="h-3 w-3" /> Impact Assessment
                    </h4>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">
                      {selectedAlert.impact}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase text-primary tracking-widest flex items-center gap-2 border-b pb-2">
                    <FlaskConical className="h-4 w-4" /> Professional Action Plan
                  </h4>
                  <ul className="space-y-3">
                    {selectedAlert.actionPlan.map((action, i) => (
                      <li key={i} className="flex gap-4 p-4 bg-muted/30 rounded-2xl border border-transparent hover:border-primary/20 transition-all">
                        <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">
                          {i + 1}
                        </div>
                        <p className="text-sm font-medium text-slate-700">{action}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-amber-600 tracking-widest flex items-center gap-2">
                    <Bug className="h-4 w-4" /> Heritage Wisdom (Desi Nuskha)
                  </h4>
                  <p className="text-sm italic font-medium text-amber-900 leading-relaxed pl-6 border-l-4 border-amber-200">
                    "{selectedAlert.traditionalRemedy}"
                  </p>
                </div>

                <div className="pt-6 border-t flex items-center justify-center">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest flex items-center gap-2">
                    <ShieldAlert className="h-3 w-3" /> Verified via KisanMitra National Grid
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

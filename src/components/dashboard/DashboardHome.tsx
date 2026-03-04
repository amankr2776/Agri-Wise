'use client';

import React from "react";
import { 
  AlertTriangle, 
  TrendingUp, 
  Truck, 
  Users, 
  Leaf, 
  Search, 
  MessageCircle, 
  ChevronRight,
  Zap
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface DashboardHomeProps {
  onNavigate: (section: string) => void;
}

export function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const stats = [
    { id: "market", label: "Active Alerts", value: "3", icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/10" },
    { id: "market", label: "Best Price Today", value: "₹2,150/q", sub: "Wheat (Nashik)", icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
    { id: "fleet", label: "Active Shipments", value: "2", icon: Truck, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: "network", label: "Community Posts", value: "12", icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  const quickActions = [
    { id: "diagnostics", label: "Diagnose Crop", icon: Leaf, desc: "AI-powered pest detection" },
    { id: "market", label: "Check Prices", icon: Search, desc: "Live Mandi price trends" },
    { id: "logistics", label: "Book Transport", icon: Truck, desc: "Mandi-Link delivery" },
    { id: "network", label: "Ask Community", icon: MessageCircle, desc: "Kisan Network discussions" },
  ];

  const alerts = [
    { type: "Critical", title: "Locust Swarm Detected", region: "Rajasthan Border", time: "2h ago", icon: AlertTriangle },
    { type: "Warning", title: "Onion Price Spike (+42%)", region: "Nashik Mandi", time: "5h ago", icon: TrendingUp },
    { type: "Info", title: "Fertilizer Subsidy Update", region: "National", time: "1d ago", icon: Zap },
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
            October 24, 2023
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight">Namaste, Rajesh Ji!</h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-xl">
            Your fields in Ludhiana are looking healthy. Wheat prices are rising in nearby Mandis.
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
          {alerts.map((alert, i) => (
            <Card 
              key={i} 
              className="border-none shadow-sm rounded-2xl overflow-hidden hover:bg-muted/50 cursor-pointer transition-all hover:translate-x-1"
              onClick={() => onNavigate("market")}
            >
              <CardContent className="p-0 flex items-center">
                <div className={`w-1.5 self-stretch ${
                  alert.type === 'Critical' ? 'bg-destructive' : alert.type === 'Warning' ? 'bg-amber-500' : 'bg-blue-500'
                }`} />
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
    </div>
  );
}

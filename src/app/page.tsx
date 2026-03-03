
'use client';

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Leaf, 
  TrendingUp, 
  Truck, 
  Users, 
  ShieldCheck, 
  Search, 
  Bell, 
  Settings,
  LogOut,
  FlaskConical,
  Globe,
  Lock
} from "lucide-react";
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarInset,
  SidebarTrigger,
  SidebarFooter
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAppState, UserRole } from "@/lib/app-state";

// Section Components
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { CropDiagnostics } from "@/components/diagnostics/CropDiagnostics";
import { MarketIntelligence } from "@/components/market/MarketIntelligence";
import { MandiLink } from "@/components/logistics/MandiLink";
import { KisanNetwork } from "@/components/social/KisanNetwork";
import { AuthorityDashboard } from "@/components/gov/AuthorityDashboard";
import { ExpertVerificationPortal } from "@/components/experts/ExpertVerificationPortal";
import { MinistryIntelligence } from "@/components/gov/MinistryIntelligence";
import { FleetManagement } from "@/components/logistics/FleetManagement";

export default function KisanMitraApp() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const { role, setRole } = useAppState();

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <DashboardHome onNavigate={setActiveSection} />;
      case "diagnostics": return <CropDiagnostics />;
      case "market": return <MarketIntelligence />;
      case "logistics": return <MandiLink />;
      case "network": return <KisanNetwork />;
      case "expert-portal": return <ExpertVerificationPortal />;
      case "gov-intel": return <MinistryIntelligence />;
      case "fleet": return <FleetManagement />;
      default: return <DashboardHome onNavigate={setActiveSection} />;
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Expert", "Authority", "Logistics"] },
    { id: "diagnostics", label: "Crop Diagnostics", icon: Leaf, roles: ["Expert", "Authority", "Logistics"] },
    { id: "market", label: "Market Intelligence", icon: TrendingUp, roles: ["Expert", "Authority", "Logistics"] },
    { id: "expert-portal", label: "Verification Portal", icon: FlaskConical, roles: ["Expert"] },
    { id: "gov-intel", label: "Ministry Intel", icon: Globe, roles: ["Authority"] },
    { id: "fleet", label: "My Fleet", icon: Truck, roles: ["Logistics"] },
    { id: "network", label: "Kisan Network", icon: Users, roles: ["Expert", "Authority", "Logistics"] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon" className="border-r border-border bg-card">
          <SidebarHeader className="h-16 flex items-center px-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <Leaf className="h-6 w-6" />
              </div>
              <span className="font-black text-xl tracking-tight group-data-[collapsible=icon]:hidden">KisanMitra</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="py-4">
            <SidebarMenu>
              {filteredMenu.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    isActive={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                    tooltip={item.label}
                    className="h-12 px-4 data-[active=true]:bg-primary/10 data-[active=true]:text-primary transition-all rounded-xl mx-2 w-auto"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-bold">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4 space-y-2">
            <div className="px-2 mb-2 group-data-[collapsible=icon]:hidden">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block mb-2">Switch Identity</label>
              <div className="grid grid-cols-1 gap-1">
                {(["Expert", "Authority", "Logistics"] as UserRole[]).map((r) => (
                  <Button 
                    key={r}
                    variant={role === r ? "default" : "ghost"} 
                    size="sm" 
                    className="justify-start h-8 text-[10px] font-bold rounded-lg"
                    onClick={() => {
                      setRole(r);
                      setActiveSection("dashboard");
                    }}
                  >
                    <Lock className="h-3 w-3 mr-2 opacity-50" /> {r}
                  </Button>
                ))}
              </div>
            </div>
            <SidebarMenuButton tooltip="Settings" className="h-12"><Settings className="h-5 w-5" /> <span>Settings</span></SidebarMenuButton>
            <SidebarMenuButton tooltip="Logout" className="h-12 text-destructive"><LogOut className="h-5 w-5" /> <span>Logout</span></SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 border-b bg-card sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden md:flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full w-96 border border-border/50">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input 
                  placeholder="Search intelligence, Mandis, or experts..." 
                  className="bg-transparent border-none text-sm focus:outline-none w-full font-medium"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative touch-target rounded-full hover:bg-muted">
                <Bell className="h-5 w-5" />
                <Badge className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center p-0 bg-destructive text-[9px] border-2 border-white">3</Badge>
              </Button>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-3 bg-muted/30 px-3 py-1.5 rounded-full border border-border/50">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-black leading-none uppercase">{role} Portal</p>
                  <p className="text-[9px] text-primary font-bold mt-1 tracking-tighter uppercase">Verified Access</p>
                </div>
                <Avatar className="h-8 w-8 border-2 border-primary/20">
                  <AvatarImage src={`https://picsum.photos/seed/${role}/40/40`} />
                  <AvatarFallback>{role[0]}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8 animate-in fade-in duration-500 overflow-x-hidden">
            {renderSection()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

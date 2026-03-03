'use client';

import React, { useState } from "react";
import { 
  LayoutDashboard, 
  Leaf, 
  TrendingUp, 
  Truck, 
  Users, 
  ShieldCheck, 
  Menu, 
  Search, 
  Bell, 
  ChevronRight,
  Settings,
  LogOut,
  X
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Section Components
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { CropDiagnostics } from "@/components/diagnostics/CropDiagnostics";
import { MarketIntelligence } from "@/components/market/MarketIntelligence";
import { MandiLink } from "@/components/logistics/MandiLink";
import { KisanNetwork } from "@/components/social/KisanNetwork";
import { AuthorityDashboard } from "@/components/gov/AuthorityDashboard";

export default function KisanMitraApp() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <DashboardHome onNavigate={setActiveSection} />;
      case "diagnostics": return <CropDiagnostics />;
      case "market": return <MarketIntelligence />;
      case "logistics": return <MandiLink />;
      case "network": return <KisanNetwork />;
      case "authority": return <AuthorityDashboard />;
      default: return <DashboardHome onNavigate={setActiveSection} />;
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "diagnostics", label: "Crop Diagnostics", icon: Leaf },
    { id: "market", label: "Market Prices", icon: TrendingUp },
    { id: "logistics", label: "Mandi-Link", icon: Truck },
    { id: "network", label: "Kisan Network", icon: Users },
    { id: "authority", label: "Authority Dashboard", icon: ShieldCheck },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar collapsible="icon" className="border-r border-border bg-card">
          <SidebarHeader className="h-16 flex items-center px-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white">
                <Leaf className="h-6 w-6" />
              </div>
              <span className="font-bold text-xl tracking-tight group-data-[collapsible=icon]:hidden">KisanMitra</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="py-4">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton 
                    isActive={activeSection === item.id}
                    onClick={() => setActiveSection(item.id)}
                    tooltip={item.label}
                    className="h-12 px-4 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t p-4">
            <SidebarMenuButton tooltip="Settings" className="h-12"><Settings className="h-5 w-5" /> <span>Settings</span></SidebarMenuButton>
            <SidebarMenuButton tooltip="Logout" className="h-12 text-destructive"><LogOut className="h-5 w-5" /> <span>Logout</span></SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 border-b bg-card sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden md:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full w-80">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input 
                  placeholder="Search market, pests, or community..." 
                  className="bg-transparent border-none text-sm focus:outline-none w-full"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative touch-target">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-[10px]">3</Badge>
              </Button>
              <div className="h-8 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold leading-none">Rajesh Kumar</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium mt-1">Ludhiana, Punjab</p>
                </div>
                <Avatar className="h-9 w-9 border-2 border-primary/20">
                  <AvatarImage src="https://picsum.photos/seed/farmer1/40/40" />
                  <AvatarFallback>RK</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 md:p-8 animate-in fade-in duration-500">
            {renderSection()}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

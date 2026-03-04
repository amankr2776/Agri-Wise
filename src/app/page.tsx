'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Leaf, 
  TrendingUp, 
  Truck, 
  Users, 
  Search, 
  Bell, 
  Settings,
  LogOut,
  FlaskConical,
  Globe,
  Loader2,
  Package,
  X,
  RefreshCw
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
import { useAppState } from "@/lib/app-state";
import { useToast } from "@/hooks/use-toast";

// Section Components
import { DashboardHome } from "@/components/dashboard/DashboardHome";
import { CropDiagnostics } from "@/components/diagnostics/CropDiagnostics";
import { MarketIntelligence } from "@/components/market/MarketIntelligence";
import { MandiLink } from "@/components/logistics/MandiLink";
import { KisanNetwork } from "@/components/social/KisanNetwork";
import { ExpertVerificationPortal } from "@/components/experts/ExpertVerificationPortal";
import { MinistryIntelligence } from "@/components/gov/MinistryIntelligence";
import { FleetManagement } from "@/components/logistics/FleetManagement";
import { SettingsView } from "@/components/settings/SettingsView";

export default function KisanMitraApp() {
  const router = useRouter();
  const { toast } = useToast();
  const { role, isAuthenticated, logout } = useAppState();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (role === "Logistics") setActiveSection("fleet");
    else if (role === "Authority") setActiveSection("gov-intel");
    else if (role === "Expert") setActiveSection("expert-portal");
    else setActiveSection("dashboard");
  }, [role]);

  const handleGlobalSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    
    // Simulate manual search fetch
    setTimeout(() => {
      setIsSearching(false);
      toast({
        title: "Search Intelligence Updated",
        description: `Filtering ${activeSection} for "${searchQuery}"`,
      });
    }, 800);
  };

  const clearSearch = () => {
    setSearchQuery("");
    toast({
      title: "Search Cleared",
      description: "Displaying full intelligence grid.",
    });
  };

  if (!isAuthenticated || !role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Verifying Identity...</p>
        </div>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard": return <DashboardHome onNavigate={setActiveSection} />;
      case "diagnostics": return <CropDiagnostics searchQuery={searchQuery} />;
      case "market": return <MarketIntelligence searchQuery={searchQuery} />;
      case "logistics": return <MandiLink />;
      case "network": return <KisanNetwork />;
      case "expert-portal": return <ExpertVerificationPortal />;
      case "gov-intel": return <MinistryIntelligence />;
      case "fleet": return <FleetManagement />;
      case "settings": return <SettingsView />;
      default: return <DashboardHome onNavigate={setActiveSection} />;
    }
  };

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["Farmer", "Expert", "Authority", "Logistics"] },
    { id: "diagnostics", label: "Crop Diagnostics", icon: Leaf, roles: ["Farmer", "Expert", "Authority", "Logistics"] },
    { id: "market", label: "Market Intelligence", icon: TrendingUp, roles: ["Farmer", "Expert", "Authority", "Logistics"] },
    { id: "expert-portal", label: "Verification Portal", icon: FlaskConical, roles: ["Expert"] },
    { id: "gov-intel", label: "Ministry Intel", icon: Globe, roles: ["Authority"] },
    { id: "fleet", label: "Fleet Hub", icon: Truck, roles: ["Logistics"] },
    { id: "logistics", label: "Mandi-Link", icon: Package, roles: ["Farmer"] },
    { id: "network", label: "Kisan Network", icon: Users, roles: ["Farmer", "Expert", "Authority", "Logistics"] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(role));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
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
            <SidebarMenuButton 
              isActive={activeSection === "settings"}
              onClick={() => setActiveSection("settings")}
              tooltip="Settings" 
              className="h-12 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
            >
              <Settings className="h-5 w-5" /> <span>Settings</span>
            </SidebarMenuButton>
            <SidebarMenuButton 
              tooltip="Logout" 
              onClick={() => logout()}
              className="h-12 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" /> <span>Logout</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 border-b glass-card sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <div className="hidden md:flex items-center gap-2 bg-muted/50 px-4 py-2 rounded-full w-96 border border-border/50 transition-all focus-within:ring-2 focus-within:ring-primary/20">
                <Search className={cn("h-4 w-4 transition-colors", isSearching ? "text-primary animate-pulse" : "text-muted-foreground")} />
                <input 
                  placeholder="Search intelligence, Mandis, or experts..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGlobalSearch()}
                  className="bg-transparent border-none text-sm focus:outline-none w-full font-bold"
                />
                {searchQuery && (
                  <button onClick={clearSearch} className="hover:text-primary">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleGlobalSearch}
                className="h-10 w-10 rounded-full md:hidden"
              >
                <Search className="h-5 w-5" />
              </Button>
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
                <Avatar className="h-8 w-8 border-2 border-primary/20 shadow-sm">
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
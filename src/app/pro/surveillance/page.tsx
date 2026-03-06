'use client';

import React from "react";
import { useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Leaf, 
  TrendingUp, 
  FlaskConical, 
  ShieldAlert, 
  LogOut, 
  Globe, 
  ChevronDown,
  Fingerprint,
  UserCheck
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
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppState, AppLanguage } from "@/lib/app-state";
import { MinistryIntelligence } from "@/components/gov/MinistryIntelligence";
import { cn } from "@/lib/utils";
import { handleProfessionalLogout } from "@/app/actions/auth";

const LANGUAGES: AppLanguage[] = [
  "English", "Hindi", "Bhojpuri", "Punjabi", "Haryanvi", 
  "Bengali", "Marathi", "Rajasthani", "Gujarati", "Pahadi", 
  "Kannada", "Tamil", "Telugu", "Malayalam", "Oriya", "Magahi"
];

export default function ProSurveillancePage() {
  const router = useRouter();
  const { name, language, setLanguage, logout } = useAppState();

  const handleLogout = async () => {
    await handleProfessionalLogout();
    logout();
    router.push('/login');
  };

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/" },
    { label: "Crop Diagnostics", icon: Leaf, path: "/?section=diagnostics" },
    { label: "Market Intelligence", icon: TrendingUp, path: "/?section=market" },
    { label: "Verification Hub", icon: FlaskConical, path: "/pro/expert-panel" },
    { label: "Surveillance Hub", icon: ShieldAlert, path: "/pro/surveillance", active: true },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Sidebar collapsible="icon" className="border-r border-border bg-card">
          <SidebarHeader className="h-20 flex items-center px-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="font-black text-lg leading-none tracking-tight">KisanMitra</span>
                <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Intelligence Grid</span>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="py-8">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton 
                    isActive={item.active}
                    onClick={() => router.push(item.path)}
                    tooltip={item.label}
                    className="h-12 px-6 data-[active=true]:bg-primary/10 data-[active=true]:text-primary font-black text-xs uppercase tracking-widest gap-4 rounded-2xl mx-2 w-auto"
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-6 border-t border-border">
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              className="w-full rounded-2xl h-12 font-black text-[10px] uppercase gap-3 text-destructive hover:bg-destructive/5 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" /> Secure Exit
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-transparent flex flex-col min-w-0">
          <header className="h-20 border-b border-border glass-card flex items-center justify-between px-10">
            <div className="flex items-center gap-6">
              <SidebarTrigger className="md:hidden" />
              <div className="flex items-center gap-3">
                <Fingerprint className="h-4 w-4 text-primary" />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Scientist Node Active: {name} | Identity Secured
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="rounded-full h-10 px-4 gap-2 font-black text-[10px] uppercase bg-muted/30 hover:bg-muted border border-border text-foreground">
                    <Globe className="h-4 w-4 text-primary" />
                    <span>{language}</span>
                    <ChevronDown className="h-3 w-3 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 rounded-2xl p-2 shadow-2xl border-none">
                  <ScrollArea className="h-64">
                    {LANGUAGES.map((lang) => (
                      <DropdownMenuItem key={lang} onClick={() => setLanguage(lang)} className="rounded-xl font-bold text-xs p-3">
                        {lang}
                      </DropdownMenuItem>
                    ))}
                  </ScrollArea>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center gap-4 pl-8 border-l border-border">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-900 leading-tight uppercase">{name}</p>
                  <p className="text-[8px] font-bold text-primary uppercase tracking-widest">Verified Scientist Node</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <UserCheck className="h-6 w-6" />
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 relative overflow-hidden">
            <MinistryIntelligence />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
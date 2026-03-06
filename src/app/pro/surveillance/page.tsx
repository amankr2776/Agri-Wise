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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppState, AppLanguage } from "@/lib/app-state";
import { withRoleAuth } from "@/lib/hoc/with-role-auth";
import { MinistryIntelligence } from "@/components/gov/MinistryIntelligence";
import { cn } from "@/lib/utils";
import { handleProfessionalLogout } from "@/app/actions/auth";

const LANGUAGES: AppLanguage[] = [
  "English", "Hindi", "Bhojpuri", "Punjabi", "Haryanvi", 
  "Bengali", "Marathi", "Rajasthani", "Gujarati", "Pahadi", 
  "Kannada", "Tamil", "Telugu", "Malayalam", "Oriya", "Magahi"
];

function ProSurveillancePage() {
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
    { label: "Expert Portal", icon: FlaskConical, path: "/pro/expert-panel" },
    { label: "Surveillance", icon: ShieldAlert, path: "/pro/surveillance", active: true },
  ];

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden font-sans">
      {/* COLUMN 1: PERSISTENT VERTICAL NAV */}
      <aside className="w-72 border-r border-white/5 bg-slate-900/50 flex flex-col shrink-0">
        <div className="h-20 flex items-center px-8 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg leading-none tracking-tight text-white">KisanMitra</span>
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1">Intelligence Grid</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => router.push(item.path)}
              className={cn(
                "w-full h-12 flex items-center gap-4 px-6 rounded-2xl transition-all font-black text-xs uppercase tracking-widest",
                item.active 
                  ? "bg-primary text-white shadow-lg shadow-primary/20" 
                  : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5 space-y-4">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full rounded-2xl h-12 font-black text-[10px] uppercase gap-3 text-destructive hover:bg-destructive/5 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" /> Secure Exit
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* HEADER ARCHITECTURE */}
        <header className="h-20 border-b border-white/5 bg-slate-900/20 flex items-center justify-between px-10">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Fingerprint className="h-4 w-4 text-primary" />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                Grid Node Active: {name} | Identity Secured
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full h-10 px-4 gap-2 font-black text-[10px] uppercase bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>{language}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 rounded-2xl p-2 shadow-2xl border-none bg-slate-900 text-slate-200">
                <ScrollArea className="h-64">
                  {LANGUAGES.map((lang) => (
                    <DropdownMenuItem 
                      key={lang} 
                      onClick={() => setLanguage(lang)}
                      className={cn(
                        "rounded-xl font-bold text-xs p-3 my-1",
                        language === lang ? "bg-primary text-white" : "hover:bg-white/5"
                      )}
                    >
                      {lang}
                    </DropdownMenuItem>
                  ))}
                </ScrollArea>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-4 pl-8 border-l border-white/5">
              <div className="text-right">
                <p className="text-[10px] font-black text-white leading-tight uppercase">Dr. Aman Kumar</p>
                <p className="text-[8px] font-bold text-primary uppercase tracking-widest">Verified Scientist Node</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                <UserCheck className="h-6 w-6" />
              </div>
            </div>
          </div>
        </header>

        {/* MAIN PANEL AREA: 2-Column (Center Map + Right Intelligence) */}
        <main className="flex-1 relative overflow-hidden">
          <MinistryIntelligence />
        </main>
      </div>
    </div>
  );
}

export default withRoleAuth(ProSurveillancePage, 'Expert');

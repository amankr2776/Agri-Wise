'use client';

import React, { useState } from "react";
import { UserRole, useAppState } from "@/lib/app-state";
import { 
  Leaf, 
  ShieldCheck, 
  BarChart3, 
  Truck, 
  Users, 
  Bot, 
  Settings, 
  ChevronRight,
  Accessibility,
  CloudSun,
  TrendingUp,
  ArrowUpRight,
  Wind,
  Droplets,
  ThermometerSun
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { DiagnosticTool } from "@/components/diagnostics/DiagnosticTool";
import { MarketIntelligence } from "@/components/market/MarketIntelligence";
import { LogisticsMarket } from "@/components/logistics/LogisticsMarket";
import { CommunityFeed } from "@/components/social/CommunityFeed";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function AgriWiseApp() {
  const { role, setRole, language, setLanguage } = useAppState();
  const [isAppStarted, setIsAppStarted] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  if (!isAppStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary rounded-2xl shadow-xl shadow-primary/20">
                <Leaf className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-6xl font-headline font-bold text-primary tracking-tighter">AgriWise</h1>
            <p className="text-muted-foreground max-w-xl mx-auto text-xl font-medium">
              The Intelligent Ecosystem for Agri-Experts, Logistics, and Authorities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {ROLES.map((r) => (
              <Card 
                key={r.id} 
                className={`cursor-pointer transition-all hover:scale-105 border-2 overflow-hidden ${role === r.id ? 'border-primary ring-4 ring-primary/10' : 'border-transparent shadow-md'}`}
                onClick={() => setRole(r.id)}
              >
                <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                  <div className={`p-5 rounded-3xl ${r.color} text-white shadow-xl`}>
                    <r.icon className="h-10 w-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-xl">{r.title}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Professional Access</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex flex-col items-center gap-6">
            <Button 
              size="lg" 
              className="h-16 px-20 text-xl font-bold rounded-full bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 transition-all hover:translate-y-[-4px]"
              onClick={() => setIsAppStarted(true)}
            >
              Enter Dashboard <ChevronRight className="ml-2 h-6 w-6" />
            </Button>

            <div className="flex items-center gap-4 text-sm text-muted-foreground bg-white/80 px-6 py-3 rounded-full backdrop-blur-md border shadow-sm">
              <Accessibility className="h-4 w-4 text-primary" />
              <span>Multi-lingual AI Assistance enabled for <b>{language}</b></span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar variant="inset" collapsible="icon">
          <SidebarHeader className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
              <Leaf className="h-6 w-6" />
            </div>
            <span className="font-headline font-bold text-2xl text-primary group-data-[collapsible=icon]:hidden">AgriWise</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu className="px-2">
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} tooltip="Overview">
                  <BarChart3 /> <span>System Overview</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'diagnostics'} onClick={() => setActiveTab('diagnostics')} tooltip="Expert Review">
                  <ShieldCheck /> <span>Expert Diagnostics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'market'} onClick={() => setActiveTab('market')} tooltip="Economics">
                  <TrendingUp /> <span>Market Intelligence</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'logistics'} onClick={() => setActiveTab('logistics')} tooltip="Supply Chain">
                  <Truck /> <span>Logistics Hub</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'social'} onClick={() => setActiveTab('social')} tooltip="Network">
                  <Users /> <span>Agri Network</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 space-y-4">
            <div className="bg-primary/5 p-3 rounded-xl group-data-[collapsible=icon]:hidden">
               <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Active Role</div>
               <div className="text-sm font-bold text-primary flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  {role}
               </div>
               <div className="text-[10px] text-muted-foreground mt-2 truncate max-w-[140px]">Public Access Session</div>
            </div>
            <SidebarMenuButton tooltip="Settings"><Settings /> <span>Settings</span></SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-20 shrink-0 items-center justify-between px-8 border-b bg-white/70 backdrop-blur-xl sticky top-0 z-20">
            <div className="flex items-center gap-6">
              <SidebarTrigger className="h-10 w-10" />
              <div className="h-8 w-px bg-border hidden sm:block" />
              <h1 className="text-2xl font-bold font-headline capitalize tracking-tight text-slate-800">
                {activeTab === 'dashboard' ? 'Professional Intelligence' : activeTab}
              </h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-3">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="w-[140px] h-10 rounded-full bg-slate-50 border-none shadow-inner text-sm font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">हिन्दी (Hindi)</SelectItem>
                    <SelectItem value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</SelectItem>
                    <SelectItem value="Bengali">বাংলা (Bengali)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="icon" className="rounded-full h-10 w-10 bg-white border-primary/20 text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                <Bot className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10 ring-2 ring-primary/10 ring-offset-2 cursor-pointer shadow-md">
                <AvatarImage src={`https://picsum.photos/seed/partner-${role}/40/40`} />
                <AvatarFallback className="bg-primary text-white">P</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 p-8 overflow-y-auto bg-slate-50/50">
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-3 space-y-8">
                    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-primary text-white relative overflow-hidden border-none shadow-2xl rounded-3xl">
                      <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-[-1/4]">
                        <ShieldCheck className="h-96 w-96" />
                      </div>
                      <CardContent className="p-10 space-y-8 relative z-10">
                        <div className="space-y-4">
                          <Badge className="bg-white/10 text-white border-white/20 px-4 py-1 rounded-full backdrop-blur-md">Verified System {role}</Badge>
                          <h2 className="text-5xl font-bold font-headline tracking-tight leading-none">Global Agri-Intelligence Dashboard</h2>
                          <p className="max-w-xl text-slate-300 text-xl font-medium leading-relaxed">
                            Real-time monitoring of regional crop health, market shifts, and logistics efficiency.
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-4">
                          <Button size="lg" className="bg-white text-primary hover:bg-slate-100 font-bold px-8 rounded-full shadow-xl" onClick={() => setActiveTab('diagnostics')}>
                            Manage Critical Cases
                          </Button>
                          <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-full font-bold px-8 backdrop-blur-sm" onClick={() => setActiveTab('market')}>
                            Economic Analytics
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden hover:translate-y-[-4px] transition-all">
                        <CardHeader className="pb-2 bg-slate-50/50">
                          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center justify-between">
                            WEATHER OUTLOOK
                            <CloudSun className="h-4 w-4 text-orange-400" />
                          </h4>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-4xl font-bold text-slate-800">28°C</div>
                              <div className="text-sm font-medium text-muted-foreground mt-1">Clear Sky • Nashik Zone</div>
                            </div>
                            <div className="flex flex-col gap-2 items-end text-xs font-bold">
                              <span className="flex items-center gap-1 text-blue-500"><Droplets className="h-3 w-3" /> 62%</span>
                              <span className="flex items-center gap-1 text-slate-400"><Wind className="h-3 w-3" /> 12km/h</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden hover:translate-y-[-4px] transition-all">
                        <CardHeader className="pb-2 bg-slate-50/50">
                          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center justify-between">
                            MARKET STABILITY
                            <TrendingUp className="h-4 w-4 text-primary" />
                          </h4>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-4xl font-bold text-slate-800">+4.2%</div>
                              <div className="text-sm font-medium text-muted-foreground mt-1 flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3 text-primary" /> Onion Market Index
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-primary/10 text-primary border-none text-[10px]">Onion Market</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-xl bg-white rounded-3xl overflow-hidden hover:translate-y-[-4px] transition-all">
                        <CardHeader className="pb-2 bg-slate-50/50">
                          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] flex items-center justify-between">
                            SOIL MOISTURE
                            <ThermometerSun className="h-4 w-4 text-blue-500" />
                          </h4>
                        </CardHeader>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-4xl font-bold text-slate-800">42%</div>
                              <div className="text-sm font-medium text-muted-foreground mt-1">Average • North Region</div>
                            </div>
                            <div className="text-right">
                              <Badge className="bg-blue-100 text-blue-700 border-none text-[10px]">Optimal</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Tabs defaultValue="overview" className="space-y-6">
                      <TabsList className="bg-white border p-1.5 rounded-2xl w-auto shadow-xl inline-flex">
                        <TabsTrigger value="overview" className="rounded-xl px-8 py-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">Network Intelligence</TabsTrigger>
                        <TabsTrigger value="alerts" className="rounded-xl px-8 py-2 font-bold data-[state=active]:bg-primary data-[state=active]:text-white transition-all">High Risk Zones</TabsTrigger>
                      </TabsList>
                      <TabsContent value="overview" className="mt-0">
                        <CommunityFeed />
                      </TabsContent>
                      <TabsContent value="alerts" className="mt-0">
                        <div className="p-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-200 shadow-inner">
                           <div className="bg-slate-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                             <ShieldCheck className="h-12 w-12 text-primary opacity-30" />
                           </div>
                           <h3 className="font-bold text-2xl text-slate-800">All Zones Clear</h3>
                           <p className="text-muted-foreground text-lg max-w-sm mx-auto mt-2 leading-relaxed">
                             No critical pest outbreaks or logistics disruptions reported across your monitored regions in the last 24 hours.
                           </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>

                  <div className="lg:col-span-1">
                    <div className="sticky top-28 space-y-8">
                      <VoiceAssistant />
                      
                      <Card className="border-none shadow-2xl bg-white rounded-[32px] overflow-hidden">
                        <CardHeader className="p-6 bg-slate-50/50 border-b">
                          <CardTitle className="text-sm font-bold flex items-center gap-3">
                            <Bot className="h-5 w-5 text-primary" />
                            AI Analyst Briefing
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                          <div className="text-sm leading-relaxed text-slate-600 font-medium italic relative">
                            <span className="text-4xl absolute -top-4 -left-2 opacity-10 text-primary">"</span>
                            Data suggests a potential logistics surge in the Nashik corridor due to harvest peaks. Recommend pre-emptively allocating 15% more transport capacity.
                          </div>
                          <div className="pt-6 border-t flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Confidence Level</span>
                              <span className="text-lg font-bold text-primary">94%</span>
                            </div>
                            <Button variant="ghost" className="h-auto p-0 text-xs font-bold text-primary hover:bg-transparent hover:underline underline-offset-4">Full Breakdown</Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'diagnostics' && <DiagnosticTool />}
            {activeTab === 'market' && <MarketIntelligence />}
            {activeTab === 'logistics' && <LogisticsMarket />}
            {activeTab === 'social' && <CommunityFeed />}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

const ROLES: { id: UserRole; title: string; icon: any; color: string }[] = [
  { id: "Expert", title: "Agri Expert", icon: ShieldCheck, color: "bg-blue-600" },
  { id: "Authority", title: "Gov / Admin", icon: BarChart3, color: "bg-slate-700" },
  { id: "Logistics", title: "Logistics", icon: Truck, color: "bg-orange-600" },
];

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
  TrendingUp, 
  Globe,
  FlaskConical,
  LayoutGrid,
  Zap,
  Bell,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { FleetManagement } from "@/components/logistics/FleetManagement";
import { CommunityFeed } from "@/components/social/CommunityFeed";
import { VoiceAssistant } from "@/components/voice/VoiceAssistant";
import { MinistryIntelligence } from "@/components/gov/MinistryIntelligence";
import { ExpertVerificationPortal } from "@/components/experts/ExpertVerificationPortal";
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

export default function FarmAuraApp() {
  const { role, setRole, language, setLanguage } = useAppState();
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Glass Sidebar */}
        <Sidebar variant="inset" collapsible="icon" className="glass border-r-0 m-2 rounded-3xl overflow-hidden">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary vivid-glow-green rounded-2xl flex items-center justify-center text-white shrink-0">
                <Leaf className="h-7 w-7" />
              </div>
              <span className="font-bold text-2xl tracking-tighter group-data-[collapsible=icon]:hidden">FarmAura</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-3">
            <SidebarMenu className="gap-2">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  isActive={activeTab === 'dashboard'} 
                  onClick={() => setActiveTab('dashboard')} 
                  tooltip="Intelligence Feed"
                  className="h-12 rounded-xl data-[active=true]:bg-primary/20"
                >
                  <Sparkles className="h-5 w-5 text-primary" /> <span>Intelligence Feed</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {role === "Authority" && (
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === 'ministry'} onClick={() => setActiveTab('ministry')} tooltip="Ministry" className="h-12 rounded-xl data-[active=true]:bg-primary/20">
                    <Globe className="h-5 w-5" /> <span>Ministry Hub</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {role === "Expert" && (
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === 'verification'} onClick={() => setActiveTab('verification')} tooltip="Verification" className="h-12 rounded-xl data-[active=true]:bg-primary/20">
                    <FlaskConical className="h-5 w-5" /> <span>Expert Portal</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'diagnostics'} onClick={() => setActiveTab('diagnostics')} tooltip="Diagnostics" className="h-12 rounded-xl data-[active=true]:bg-primary/20">
                  <ShieldCheck className="h-5 w-5" /> <span>AI Diagnostics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'market'} onClick={() => setActiveTab('market')} tooltip="Markets" className="h-12 rounded-xl data-[active=true]:bg-primary/20">
                  <TrendingUp className="h-5 w-5" /> <span>Economics</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={activeTab === 'social'} onClick={() => setActiveTab('social')} tooltip="Network" className="h-12 rounded-xl data-[active=true]:bg-primary/20">
                  <Users className="h-5 w-5" /> <span>Global Network</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 space-y-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 group-data-[collapsible=icon]:hidden">
               <div className="text-[10px] uppercase font-bold text-primary tracking-widest mb-2 flex items-center gap-1">
                 <Zap className="h-3 w-3" /> System Role
               </div>
               <Select value={role} onValueChange={(val) => {
                 setRole(val as UserRole);
                 setActiveTab('dashboard');
               }}>
                 <SelectTrigger className="h-9 bg-white/10 border-none text-white font-medium focus:ring-0">
                   <SelectValue />
                 </SelectTrigger>
                 <SelectContent className="bg-slate-900 border-white/10 text-white">
                   <SelectItem value="Expert">Senior Expert</SelectItem>
                   <SelectItem value="Authority">Gov Official</SelectItem>
                   <SelectItem value="Logistics">Fleet Admin</SelectItem>
                 </SelectContent>
               </Select>
            </div>
            <SidebarMenuButton tooltip="Settings" className="h-12 rounded-xl"><Settings /> <span>Configuration</span></SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="bg-transparent">
          {/* Frosted Header */}
          <header className="flex h-20 items-center justify-between px-8 glass m-2 rounded-3xl sticky top-2 z-50">
            <div className="flex items-center gap-6">
              <SidebarTrigger className="text-white/70 hover:text-white" />
              <div className="h-6 w-px bg-white/10" />
              <h1 className="text-xl font-bold tracking-tight">
                {activeTab === 'dashboard' ? 'Active Intelligence' : 
                 activeTab === 'verification' ? 'Expert Verification' : 
                 activeTab === 'ministry' ? 'Ministry Hub' : activeTab}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-[130px] h-10 glass border-none text-sm font-medium focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white">
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Hindi">हिन्दी</SelectItem>
                  <SelectItem value="Punjabi">ਪੰਜਾਬੀ</SelectItem>
                  <SelectItem value="Bengali">বাংলা</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" className="rounded-full glass h-10 w-10 text-primary">
                <Bot className="h-5 w-5" />
              </Button>
              <Avatar className="h-10 w-10 vivid-glow-green border border-white/20">
                <AvatarImage src={`https://picsum.photos/seed/aura-${role}/40/40`} />
                <AvatarFallback>FA</AvatarFallback>
              </Avatar>
            </div>
          </header>

          <main className="flex-1 p-6 space-y-6">
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="lg:col-span-3 space-y-6">
                  {/* Hero Section */}
                  <div className="relative h-64 rounded-[2rem] overflow-hidden glass p-10 flex flex-col justify-center gap-4 border-primary/20">
                    <div className="absolute top-0 right-0 p-8 opacity-20 transform translate-x-10 translate-y-[-10px]">
                      <Leaf className="h-64 w-64 text-primary" />
                    </div>
                    <Badge className="w-fit bg-primary/20 text-primary border-primary/30 backdrop-blur-md">Professional Node Active</Badge>
                    <h2 className="text-4xl font-bold tracking-tight max-w-lg leading-tight">
                      Welcome back, {role}. Your <span className="text-primary italic">intelligence stream</span> is live.
                    </h2>
                    <div className="flex gap-3">
                      <Button className="rounded-full bg-primary hover:bg-primary/80 px-8 h-12 font-bold vivid-glow-green">
                        Action Required (3)
                      </Button>
                      <Button variant="ghost" className="rounded-full glass px-8 h-12 font-bold">
                        Global Analytics
                      </Button>
                    </div>
                  </div>

                  {/* Active Intelligence Feed */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-2">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-white/50">Active Intelligence Feed</h3>
                      <Button variant="link" className="text-primary text-xs font-bold">View History</Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {/* Price Alert Card */}
                      <Card className="glass-card border-none rounded-3xl p-6">
                        <CardContent className="p-0 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="h-14 w-14 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500 vivid-glow-red">
                              <AlertTriangle className="h-7 w-7" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">Market Price Spike</span>
                                <Badge className="bg-red-500 text-white text-[10px]">Critical</Badge>
                              </div>
                              <p className="text-sm text-white/60">Onion prices in Nashik Mandi have exceeded seasonal averages by 42%.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Deviation</div>
                              <div className="text-xl font-bold text-red-400">+₹1,200/q</div>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Expert Verified Card */}
                      <Card className="glass-card border-none rounded-3xl p-6 border-l-4 border-l-primary">
                        <CardContent className="p-0 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="h-14 w-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary vivid-glow-green">
                              <CheckCircle className="h-7 w-7" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">Expert Verification Complete</span>
                                <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">Certified</Badge>
                              </div>
                              <p className="text-sm text-white/60">The 'Neem Spray' remedy for Wheat Rust has been verified by Dr. Arvind S.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Confidence</div>
                              <div className="text-xl font-bold text-primary">98%</div>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Outbreak Card */}
                      <Card className="glass-card border-none rounded-3xl p-6">
                        <CardContent className="p-0 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                            <div className="h-14 w-14 bg-orange-500/20 rounded-2xl flex items-center justify-center text-orange-500">
                              <TrendingUp className="h-7 w-7" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold">Pest Migration Alert</span>
                                <Badge variant="outline" className="text-orange-500 border-orange-500/30 text-[10px]">Monitoring</Badge>
                              </div>
                              <p className="text-sm text-white/60">Locust movement detected in Jaisalmer region. High risk to Mustard crops.</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-[10px] font-bold text-white/30 uppercase tracking-wider">Risk Level</div>
                              <div className="text-xl font-bold text-orange-400">High</div>
                            </div>
                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                              <ChevronRight className="h-5 w-5" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>

                {/* Right Column - Voice & Stats */}
                <div className="space-y-6">
                  <VoiceAssistant />
                  
                  <Card className="glass border-none rounded-[2.5rem] p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">Cluster Health</h4>
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                          <span>Verified Clusters</span>
                          <span className="text-primary">82%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-primary vivid-glow-green w-[82%] rounded-full" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold">
                          <span>Logistics Efficiency</span>
                          <span className="text-accent">94%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-accent vivid-glow-green w-[94%] rounded-full" />
                        </div>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-white/30 uppercase">Uptime</span>
                        <span className="font-bold">99.98%</span>
                      </div>
                      <Badge className="bg-emerald-500/20 text-emerald-400 border-none">Stable</Badge>
                    </div>
                  </Card>

                  <Card className="glass border-none rounded-[2.5rem] p-8 bg-gradient-to-br from-primary/20 to-transparent">
                     <div className="flex flex-col gap-4">
                       <Bot className="h-8 w-8 text-primary" />
                       <p className="text-sm font-medium italic leading-relaxed text-white/70">
                         "AI identifies a 12% probability of market stabilization in 7 days. Recommend holding verification for new clusters until price volatility drops."
                       </p>
                       <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold">
                         Read Deep Analysis
                       </Button>
                     </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'verification' && <div className="glass p-8 rounded-[3rem]"><ExpertVerificationPortal /></div>}
            {activeTab === 'ministry' && <div className="glass p-8 rounded-[3rem]"><MinistryIntelligence /></div>}
            {activeTab === 'diagnostics' && <div className="glass p-8 rounded-[3rem]"><DiagnosticTool /></div>}
            {activeTab === 'market' && <div className="glass p-8 rounded-[3rem]"><MarketIntelligence /></div>}
            {activeTab === 'social' && <div className="glass p-8 rounded-[3rem]"><CommunityFeed /></div>}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

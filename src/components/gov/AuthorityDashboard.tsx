'use client';

import React, { useState } from "react";
import { 
  ShieldCheck, 
  Map as MapIcon, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  FlaskConical, 
  Truck, 
  Briefcase,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart as PieIcon,
  ChevronRight,
  Navigation,
  Leaf
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { cn } from "@/lib/utils";

const PEST_DATA = [
  { region: "Bathinda", count: 24 },
  { region: "Nashik", count: 18 },
  { region: "Karnal", count: 12 },
  { region: "Agra", count: 9 },
  { region: "Rohtak", count: 15 },
];

const CROP_DIST = [
  { name: "Wheat", value: 45 },
  { name: "Rice", value: 30 },
  { name: "Cotton", value: 15 },
  { name: "Sugar", value: 10 },
];

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

export function AuthorityDashboard() {
  const [role, setRole] = useState("Gov");

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-primary" />
            Stakeholder Command
          </h2>
          <p className="text-muted-foreground mt-1">Multi-perspective oversight for the KisanMitra ecosystem.</p>
        </div>
        <Tabs value={role} onValueChange={setRole} className="w-fit">
          <TabsList className="bg-muted rounded-full p-1 h-11">
            <TabsTrigger value="Gov" className="rounded-full px-6 h-9 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Gov</TabsTrigger>
            <TabsTrigger value="Expert" className="rounded-full px-6 h-9 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Expert</TabsTrigger>
            <TabsTrigger value="Logistics" className="rounded-full px-6 h-9 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Logistics</TabsTrigger>
            <TabsTrigger value="Farmer" className="rounded-full px-6 h-9 font-bold data-[state=active]:bg-primary data-[state=active]:text-white">Farmer</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {role === "Gov" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Farmers", val: "12,450", color: "text-primary" },
              { label: "Active Outbreaks", val: "8", color: "text-destructive" },
              { label: "Price Alerts", val: "3", color: "text-amber-500" },
              { label: "Active Schemes", val: "15", color: "text-blue-500" },
            ].map((s, i) => (
              <Card key={i} className="border-none shadow-sm rounded-2xl p-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{s.label}</p>
                <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="p-8 border-b">
                <CardTitle className="text-lg font-bold">Pest Outbreaks by District</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={PEST_DATA}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="region" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600 }} />
                      <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
              <CardHeader className="p-8 border-b">
                <CardTitle className="text-lg font-bold">Crop Area Distribution</CardTitle>
              </CardHeader>
              <CardContent className="p-8 flex items-center justify-center">
                <div className="h-[300px] w-full max-w-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={CROP_DIST} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                        {CROP_DIST.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {CROP_DIST.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-[10px] font-bold">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        {c.name}: {c.value}%
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="p-8 border-b">
              <CardTitle className="text-lg font-bold">Active Pest Outbreak Log</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Disease</TableHead>
                  <TableHead className="font-bold">Region</TableHead>
                  <TableHead className="font-bold">Severity</TableHead>
                  <TableHead className="font-bold text-right">Area (Ha)</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { name: "Locust Swarm", region: "Jaisalmer", severity: "Critical", area: 1250, status: "Active" },
                  { name: "Wheat Rust", region: "Bathinda", severity: "High", area: 450, status: "Contained" },
                  { name: "Cotton Bollworm", region: "Rajkot", severity: "High", area: 890, status: "Monitoring" },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-bold">{row.name}</TableCell>
                    <TableCell>{row.region}</TableCell>
                    <TableCell>
                      <Badge variant={row.severity === 'Critical' ? 'destructive' : 'default'} className="text-[10px] uppercase font-bold">
                        {row.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold">{row.area}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-bold uppercase">{row.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {role === "Expert" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm p-8 bg-primary/10 text-primary">
              <p className="text-xs font-bold uppercase mb-1">Total Verified</p>
              <p className="text-4xl font-black">1,242</p>
            </Card>
            <Card className="border-none shadow-sm p-8 bg-amber-50 text-amber-600">
              <p className="text-xs font-bold uppercase mb-1">Pending Review</p>
              <p className="text-4xl font-black">15</p>
            </Card>
            <Card className="border-none shadow-sm p-8 bg-muted text-muted-foreground">
              <p className="text-xs font-bold uppercase mb-1">Rejected</p>
              <p className="text-4xl font-black">234</p>
            </Card>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-primary" /> Pending Verifications
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { name: "Ginger Tea Mixture", user: "Gopal S.", crop: "Rice", desc: "Mixing boiled ginger extract with water for early stage blast control." },
                { name: "Garlic Spray", user: "Suresh P.", crop: "Tomato", desc: "Crushed garlic cloves steeped in water for aphid control." },
              ].map((item, i) => (
                <Card key={i} className="border-none shadow-sm rounded-3xl p-8 flex flex-col md:flex-row justify-between gap-6 hover:bg-muted/30 transition-all">
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{item.name}</span>
                      <Badge className="bg-primary/20 text-primary border-none text-[8px] uppercase font-bold tracking-widest">{item.crop}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Submitted by {item.user} • 2d ago</p>
                    <p className="text-sm italic text-slate-600 leading-relaxed">"{item.desc}"</p>
                  </div>
                  <div className="flex flex-row md:flex-col items-center justify-center gap-3">
                    <Button className="w-full md:w-32 rounded-xl h-11 font-bold gap-2">
                      <CheckCircle className="h-4 w-4" /> Approve
                    </Button>
                    <Button variant="outline" className="w-full md:w-32 rounded-xl h-11 font-bold gap-2 border-destructive/20 text-destructive hover:bg-destructive/10">
                      <XCircle className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {role === "Logistics" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Fleet", val: "45", color: "text-primary" },
              { label: "Available", val: "12", color: "text-blue-500" },
              { label: "In Transit", val: "28", color: "text-amber-500" },
              { label: "Maintenance", val: "5", color: "text-destructive" },
            ].map((s, i) => (
              <Card key={i} className="border-none shadow-sm rounded-2xl p-6 text-center">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">{s.label}</p>
                <p className={`text-3xl font-black ${s.color}`}>{s.val}</p>
              </Card>
            ))}
          </div>

          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="p-8 border-b">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" /> Active Fleet Registry
              </CardTitle>
            </CardHeader>
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">Vehicle ID</TableHead>
                  <TableHead className="font-bold">Type</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Location</TableHead>
                  <TableHead className="font-bold">Driver</TableHead>
                  <TableHead className="font-bold text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: "V-102", type: "Mini Truck", status: "Available", loc: "Ludhiana", driver: "Karan S." },
                  { id: "V-204", type: "Ref. Van", status: "In Transit", loc: "NH-44", driver: "Mohan P." },
                  { id: "V-089", type: "Pickup Van", status: "Maint.", loc: "Service Center", driver: "N/A" },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono font-bold">{row.id}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={row.status === 'Available' ? 'outline' : 'secondary'}
                        className={cn(
                          "text-[8px] uppercase font-bold",
                          row.status === 'Available' ? "text-primary border-primary/30" : ""
                        )}
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-xs">
                        <MapIcon className="h-3 w-3" /> {row.loc}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-medium">{row.driver}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 rounded-full">Update</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      {role === "Farmer" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <Card className="border-none shadow-sm rounded-3xl p-10 bg-gradient-to-br from-primary/10 to-transparent flex flex-col md:flex-row gap-10 items-center">
            <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
              <AvatarImage src="https://picsum.photos/seed/farmer1/120/120" />
              <AvatarFallback>RK</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="space-y-1">
                <h3 className="text-3xl font-black tracking-tight">Rajesh Kumar</h3>
                <p className="text-muted-foreground font-medium">Marginal Farmer • Member since 2021</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Badge variant="outline" className="h-7 px-3 font-bold border-primary/30 text-primary">Crops: Wheat, Rice, Cotton</Badge>
                <Badge variant="outline" className="h-7 px-3 font-bold border-primary/30 text-primary">Land: 2.5 Hectares</Badge>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm p-8 rounded-3xl">
              <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-4">Relevant Alerts</h4>
              <div className="space-y-3">
                <div className="p-3 bg-destructive/10 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-xs font-bold text-destructive">Wheat Rust Warning</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl flex items-center gap-3">
                  <TrendingUp className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-bold text-amber-600">Wheat Prices up 4.8%</span>
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-sm p-8 rounded-3xl">
              <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-4">Mandi-Link Status</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span>Shipment BK-4421</span>
                  <Badge className="bg-primary/20 text-primary border-none">In Transit</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground italic">Arriving in 22 mins</span>
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-sm p-8 rounded-3xl">
              <h4 className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-4">Network Activity</h4>
              <div className="text-center space-y-2 py-4">
                <p className="text-4xl font-black text-primary">12</p>
                <p className="text-xs font-bold text-muted-foreground">Community Contributions</p>
                <Button variant="link" className="text-primary text-[10px] font-bold p-0">Manage Posts</Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

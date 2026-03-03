
'use client';

import React, { useState, useMemo } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUpRight, 
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Lock,
  ArrowRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const MOCK_DATA = [
  { month: "May", price: 1850 },
  { month: "Jun", price: 1920 },
  { month: "Jul", price: 1800 },
  { month: "Aug", price: 2100 },
  { month: "Sep", price: 2450 },
  { month: "Oct", price: 2150 },
];

const TABLE_DATA = [
  { crop: "Wheat", mandi: "Ludhiana", state: "Punjab", price: 2150, prevPrice: 2050, trend: "up", change: 4.8 },
  { crop: "Onion", mandi: "Nashik", state: "Maharashtra", price: 3500, prevPrice: 2000, trend: "up", change: 75.0, alert: true },
  { crop: "Rice (Basmati)", mandi: "Karnal", state: "Haryana", price: 4200, prevPrice: 4250, trend: "down", change: 1.2 },
  { crop: "Cotton", mandi: "Rajkot", state: "Gujarat", price: 7800, prevPrice: 7800, trend: "stable", change: 0.0 },
  { crop: "Potato", mandi: "Agra", state: "UP", price: 1200, prevPrice: 1100, trend: "up", change: 9.1 },
];

export function MarketIntelligence() {
  const [crop, setCrop] = useState("Wheat");

  const forecast = useMemo(() => {
    const current = MOCK_DATA[MOCK_DATA.length - 1].price;
    const prev = MOCK_DATA[MOCK_DATA.length - 2].price;
    const isRising = current > prev;
    
    return {
      action: isRising ? "HOLD" : "SELL",
      confidence: 89,
      reason: isRising 
        ? "Prices are currently on an upward trajectory with strong seasonal demand. Recommend holding for another 14-21 days for peak returns."
        : "Market saturation detected in key Mandis. Recommend immediate liquidation to avoid further price correction."
    };
  }, [crop]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-3">
          <Select defaultValue="Wheat" onValueChange={setCrop}>
            <SelectTrigger className="w-[180px] rounded-2xl h-11 bg-white border-border shadow-sm font-bold">
              <SelectValue placeholder="Select Crop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Wheat">Wheat</SelectItem>
              <SelectItem value="Rice">Rice</SelectItem>
              <SelectItem value="Onion">Onion</SelectItem>
              <SelectItem value="Cotton">Cotton</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="Punjab">
            <SelectTrigger className="w-[180px] rounded-2xl h-11 bg-white border-border shadow-sm font-bold">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Punjab">Punjab</SelectItem>
              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
              <SelectItem value="Haryana">Haryana</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
          {[
            { label: "Season High", val: "₹2,450", sub: "Sept 2023", icon: ArrowUpRight, color: "text-primary" },
            { label: "Season Low", val: "₹1,800", sub: "July 2023", icon: TrendingDown, color: "text-destructive" },
            { label: "Avg Yield Val", val: "₹2,045", sub: "Regional Avg", icon: BarChart3, color: "text-slate-700" },
            { label: "Active Alerts", val: "1", sub: "Price Spike", icon: AlertCircle, color: "text-amber-600" },
          ].map((s, i) => (
            <Card key={i} className="border-none shadow-sm rounded-2xl p-4 bg-white flex flex-col justify-between h-24">
              <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">{s.label}</p>
              <div className="flex items-center justify-between">
                <p className={cn("text-lg font-black", s.color)}>{s.val}</p>
                <s.icon className={cn("h-4 w-4", s.color)} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="p-8 border-b bg-slate-50/50">
            <CardTitle className="text-xl font-black flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" />
              Strategic Price Trajectory
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={5} 
                    dot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 border-none shadow-xl rounded-[2.5rem] bg-slate-900 p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <CheckCircle2 className="h-40 w-40 rotate-12" />
          </div>
          <div className="relative z-10 space-y-8 flex flex-col h-full">
            <div className="space-y-2">
              <Badge className="bg-primary hover:bg-primary border-none text-[10px] font-black uppercase tracking-widest px-3 py-1">
                AI Strategic Forecast
              </Badge>
              <h3 className="text-3xl font-black tracking-tight mt-4">Action: {forecast.action}</h3>
              <p className="text-slate-400 text-sm font-medium leading-relaxed italic">
                "{forecast.reason}"
              </p>
            </div>

            <div className="mt-auto space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest">
                  <span className="text-slate-500">Confidence Accuracy</span>
                  <span className="text-primary">{forecast.confidence}%</span>
                </div>
                <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${forecast.confidence}%` }} />
                </div>
              </div>
              <Button className="w-full bg-white text-slate-950 hover:bg-slate-100 font-black rounded-xl h-12 shadow-lg shadow-white/5 group">
                Execute Market Strategy <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
        <div className="p-8 border-b flex justify-between items-center bg-slate-50/50">
          <CardTitle className="text-xl font-black">Live Mandi Intelligence Feed</CardTitle>
          <Button variant="outline" className="rounded-full gap-2 border-border font-bold">
            <Calendar className="h-4 w-4" /> Comprehensive Export
          </Button>
        </div>
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Commodity</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Mandi Hub</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Jurisdiction</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-right">Price (₹/q)</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest">Momentum</TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-right">Volatility (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TABLE_DATA.map((row, i) => (
              <TableRow key={i} className="group hover:bg-slate-50/80 transition-all border-b border-slate-100 last:border-0">
                <TableCell className="font-bold py-6">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-900">{row.crop}</span>
                    {row.alert && (
                      <Badge variant="destructive" className="h-5 px-2 text-[8px] font-black uppercase animate-pulse border-none shadow-lg shadow-destructive/20">
                        <AlertCircle className="h-3 w-3 mr-1" /> Surveillance Required
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 font-medium">{row.mandi}</TableCell>
                <TableCell className="text-slate-600 font-medium">{row.state}</TableCell>
                <TableCell className="text-right font-black text-slate-900">₹{row.price.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {row.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-primary" />
                    ) : row.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    ) : (
                      <Minus className="h-4 w-4 text-slate-400" />
                    )}
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-tighter",
                      row.trend === 'up' ? 'text-primary' : row.trend === 'down' ? 'text-destructive' : 'text-slate-400'
                    )}>
                      {row.trend}
                    </span>
                  </div>
                </TableCell>
                <TableCell className={cn(
                  "text-right font-black",
                  row.trend === 'up' ? 'text-primary' : row.trend === 'down' ? 'text-destructive' : 'text-slate-500'
                )}>
                  {row.trend === 'up' ? '+' : row.trend === 'down' ? '-' : ''}{row.change}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

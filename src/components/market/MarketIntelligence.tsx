'use client';

import React, { useState, useMemo, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  ArrowUpRight, 
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Search,
  Zap,
  Loader2,
  RefreshCw
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

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
  "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir"
];

const CROPS = [
  { name: "Paddy", category: "Grain" },
  { name: "Wheat", category: "Grain" },
  { name: "Maize", category: "Grain" },
  { name: "Bajra", category: "Grain" },
  { name: "Jowar", category: "Grain" },
  { name: "Tomato", category: "Vegetable" },
  { name: "Potato", category: "Vegetable" },
  { name: "Onion", category: "Vegetable" },
  { name: "Chili", category: "Vegetable" },
  { name: "Brinjal", category: "Vegetable" },
  { name: "Okra", category: "Vegetable" },
  { name: "Cabbage", category: "Vegetable" },
  { name: "Mango", category: "Fruit" },
  { name: "Banana", category: "Fruit" },
  { name: "Grapes", category: "Fruit" },
  { name: "Apple", category: "Fruit" },
  { name: "Pomegranate", category: "Fruit" },
  { name: "Guava", category: "Fruit" },
  { name: "Orange", category: "Fruit" },
  { name: "Mustard", category: "Seed" },
  { name: "Soybean", category: "Seed" },
  { name: "Groundnut", category: "Seed" },
  { name: "Sunflower", category: "Seed" },
  { name: "Cotton", category: "Plant" },
  { name: "Sugarcane", category: "Plant" },
  { name: "Tea", category: "Plant" },
  { name: "Coffee", category: "Plant" },
  { name: "Turmeric", category: "Plant" },
  { name: "Ginger", category: "Plant" },
  { name: "Black Pepper", category: "Plant" },
];

interface MarketIntelligenceProps {
  searchQuery?: string;
}

export function MarketIntelligence({ searchQuery = "" }: MarketIntelligenceProps) {
  const [selectedCrop, setSelectedCrop] = useState("Wheat");
  const [selectedState, setSelectedState] = useState("Punjab");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  useEffect(() => {
    if (searchQuery) setLocalSearch(searchQuery);
  }, [searchQuery]);

  // Generate dynamic chart data based on selected crop and state
  const chartData = useMemo(() => {
    const seed = selectedCrop.length + selectedState.length;
    const basePrice = 1500 + (seed * 20);
    return [
      { month: "May", price: basePrice - 100 },
      { month: "Jun", price: basePrice - 30 },
      { month: "Jul", price: basePrice - 150 },
      { month: "Aug", price: basePrice + 150 },
      { month: "Sep", price: basePrice + 500 },
      { month: "Oct", price: basePrice + 200 },
    ];
  }, [selectedCrop, selectedState]);

  // Generate dynamic table data for the selected state
  const tableData = useMemo(() => {
    const seed = selectedState.length;
    const items = CROPS.filter(c => c.name.toLowerCase().includes(localSearch.toLowerCase()));
    
    return items.slice(0, 12).map((c, i) => {
      const price = 1000 + (seed * 50) + (i * 100);
      const prevPrice = price - (i % 2 === 0 ? 50 : -50);
      const change = ((price - prevPrice) / prevPrice * 100).toFixed(1);
      const trend = price > prevPrice ? "up" : price < prevPrice ? "down" : "stable";
      
      return {
        crop: c.name,
        category: c.category,
        mandi: `${selectedState} Hub ${i + 1}`,
        state: selectedState,
        price,
        prevPrice,
        trend,
        change: Math.abs(parseFloat(change)),
        alert: Math.abs(parseFloat(change)) > 15
      };
    });
  }, [selectedState, localSearch]);

  const forecast = useMemo(() => {
    const current = chartData[chartData.length - 1].price;
    const prev = chartData[chartData.length - 2].price;
    const isRising = current > prev;
    
    return {
      action: isRising ? "HOLD" : "SELL",
      confidence: 85 + (selectedCrop.length % 10),
      reason: isRising 
        ? `Prices for ${selectedCrop} in ${selectedState} are showing positive momentum. Seasonal patterns suggest a peak in the coming weeks.`
        : `Supply influx in ${selectedState} Mandis for ${selectedCrop} is depressing current values. Strategic liquidation is advised.`
    };
  }, [selectedCrop, selectedState, chartData]);

  const handleStrategyExecution = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16 animate-in fade-in duration-700">
      {/* Search and Filter Section */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Commodity Selector</label>
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger className="w-full lg:w-[240px] rounded-2xl h-12 bg-white/50 backdrop-blur-md border-none shadow-md font-black px-6">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Select Crop" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[400px]">
                {CROPS.map(c => (
                  <SelectItem key={c.name} value={c.name}>
                    <div className="flex items-center justify-between w-full gap-8">
                      <span>{c.name}</span>
                      <Badge variant="outline" className="text-[8px] uppercase font-black px-1.5 h-4 opacity-50">{c.category}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 flex-1 min-w-[200px]">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-4">Jurisdiction</label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="w-full lg:w-[240px] rounded-2xl h-12 bg-white/50 backdrop-blur-md border-none shadow-md font-black px-6">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <SelectValue placeholder="Select State" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[400px]">
                {STATES.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
          {[
            { label: "Regional High", val: `₹${(chartData[4].price).toLocaleString()}`, sub: "Peak Month", icon: ArrowUpRight, color: "text-primary" },
            { label: "Regional Low", val: `₹${(chartData[2].price).toLocaleString()}`, sub: "Trough Month", icon: TrendingDown, color: "text-destructive" },
            { label: "Mandi Avg", val: `₹${(Math.round(chartData.reduce((a, b) => a + b.price, 0) / 6)).toLocaleString()}`, sub: "Seasonal Avg", icon: BarChart3, color: "text-slate-700" },
            { label: "Risk Factor", val: forecast.confidence > 90 ? "High" : "Stable", sub: "Market Volatility", icon: AlertCircle, color: forecast.confidence > 90 ? "text-destructive" : "text-blue-600" },
          ].map((s, i) => (
            <Card key={i} className="glass-card rounded-3xl p-5 border-none flex flex-col justify-between h-28 border-b-4 border-b-transparent hover:border-b-primary transition-all">
              <p className="text-[9px] uppercase font-black text-muted-foreground tracking-widest">{s.label}</p>
              <div className="flex items-center justify-between">
                <p className={cn("text-xl font-black", s.color)}>{s.val}</p>
                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center bg-muted/50")}>
                  <s.icon className={cn("h-4 w-4", s.color)} />
                </div>
              </div>
              <p className="text-[9px] font-bold text-muted-foreground italic">{s.sub}</p>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Chart */}
        <Card className="lg:col-span-8 glass-card rounded-[3rem] overflow-hidden border-none">
          <CardHeader className="p-10 border-b bg-slate-50/50 flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black flex items-center gap-3">
                <TrendingUp className="h-7 w-7 text-primary" />
                {selectedCrop} Price Index: {selectedState}
              </CardTitle>
              <p className="text-sm font-medium text-muted-foreground">Historical trajectory for the current agricultural cycle</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-3 font-black text-[10px] uppercase">Live Feed</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-10">
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }}
                    dy={15}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 700, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '24px', 
                      border: 'none', 
                      boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                      padding: '16px'
                    }}
                    labelStyle={{ fontWeight: 900, marginBottom: '4px', color: 'hsl(var(--primary))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={6} 
                    dot={{ r: 8, fill: '#fff', strokeWidth: 4, stroke: 'hsl(var(--primary))' }}
                    activeDot={{ r: 12, strokeWidth: 0, fill: 'hsl(var(--primary))' }}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Analysis Card */}
        <Card className="lg:col-span-4 glass-card rounded-[3rem] bg-slate-950 p-10 text-white relative overflow-hidden group border-none">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-125 transition-transform duration-700">
            <Zap className="h-64 w-64 rotate-12" />
          </div>
          <div className="relative z-10 space-y-10 flex flex-col h-full">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <Zap className="h-6 w-6" />
                </div>
                <Badge className="bg-white/10 hover:bg-white/20 border-none text-[10px] font-black uppercase tracking-widest px-3 py-1.5 backdrop-blur-md">
                  Gen-AI Market Forecast
                </Badge>
              </div>
              
              <div className="pt-4">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Recommended Action</p>
                <h3 className={cn(
                  "text-5xl font-black tracking-tighter",
                  forecast.action === 'HOLD' ? "text-primary" : "text-destructive"
                )}>
                  {forecast.action}
                </h3>
              </div>

              <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 backdrop-blur-sm">
                <p className="text-slate-300 text-sm font-medium leading-relaxed italic">
                  "{forecast.reason}"
                </p>
              </div>
            </div>

            <div className="mt-auto space-y-8">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500">Analysis Confidence</span>
                  <span className="text-primary">{forecast.confidence}%</span>
                </div>
                <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${forecast.confidence}%` }} />
                </div>
              </div>
              <Button 
                onClick={handleStrategyExecution}
                disabled={isAnalyzing}
                className="w-full bg-primary hover:bg-primary/90 text-white font-black rounded-2xl h-14 shadow-2xl shadow-primary/20 group text-lg"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    Execute Mandi Strategy <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-2 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Mandi Intelligence Feed */}
      <Card className="glass-card rounded-[3rem] overflow-hidden border-none">
        <div className="p-10 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-black">Live Mandi Hub Feed: {selectedState}</CardTitle>
            <p className="text-sm font-medium text-muted-foreground">Real-time commodity valuation across major regional trading hubs.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input 
                placeholder="Filter Mandi list..." 
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="pl-9 h-11 rounded-xl bg-background/50 border-none font-bold"
              />
            </div>
            <Button variant="outline" className="rounded-xl gap-2 border-border font-bold h-11 px-6 shadow-sm hover:bg-primary hover:text-white transition-all">
              <Calendar className="h-4 w-4" /> Export
            </Button>
          </div>
        </div>
        
        {tableData.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto">
              <Search className="h-8 w-8 text-muted-foreground opacity-20" />
            </div>
            <h4 className="text-xl font-black">No Commodities Matching "{localSearch}"</h4>
            <Button variant="link" onClick={() => setLocalSearch("")} className="text-primary font-bold">Clear Filters</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="font-black text-[11px] uppercase tracking-widest px-10 py-6 text-slate-500">Commodity</TableHead>
                  <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500">Regional Hub (Mandi)</TableHead>
                  <TableHead className="font-black text-[11px] uppercase tracking-widest text-right text-slate-500">Price (₹/q)</TableHead>
                  <TableHead className="font-black text-[11px] uppercase tracking-widest text-slate-500">Market Momentum</TableHead>
                  <TableHead className="font-black text-[11px] uppercase tracking-widest text-right px-10 text-slate-500">24h Volatility</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.map((row, i) => (
                  <TableRow key={i} className="group hover:bg-slate-50/80 transition-all border-b border-slate-100 last:border-0">
                    <TableCell className="px-10 py-8">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black text-slate-900">{row.crop}</span>
                          <Badge variant="outline" className="text-[8px] uppercase font-black tracking-widest h-4 opacity-70">{row.category}</Badge>
                        </div>
                        {row.alert && (
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="h-3 w-3 text-destructive animate-pulse" />
                            <span className="text-[9px] font-black uppercase text-destructive tracking-widest">Surveillance Active</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{row.mandi}</span>
                        <span className="text-[10px] text-muted-foreground font-medium">{row.state}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xl font-black text-slate-950">₹{row.price.toLocaleString()}</span>
                        <span className="text-[10px] text-muted-foreground font-bold line-through opacity-50">₹{row.prevPrice.toLocaleString()}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={cn(
                        "flex items-center gap-2.5 px-4 py-2 rounded-2xl w-fit font-black text-[10px] uppercase tracking-widest border",
                        row.trend === 'up' ? 'bg-primary/5 text-primary border-primary/20' : 
                        row.trend === 'down' ? 'bg-destructive/5 text-destructive border-destructive/20' : 
                        'bg-slate-100 text-slate-500 border-slate-200'
                      )}>
                        {row.trend === 'up' ? <TrendingUp className="h-4 w-4" /> : 
                         row.trend === 'down' ? <TrendingDown className="h-4 w-4" /> : 
                         <Minus className="h-4 w-4" />}
                        {row.trend}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-10">
                      <div className={cn(
                        "text-lg font-black tabular-nums",
                        row.trend === 'up' ? 'text-primary' : row.trend === 'down' ? 'text-destructive' : 'text-slate-500'
                      )}>
                        {row.trend === 'up' ? '+' : row.trend === 'down' ? '-' : ''}{row.change}%
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Bell, BarChart3, MapPin, Loader2, AlertTriangle, Briefcase, Info } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { marketPriceTrendAnalysis, MarketPriceTrendAnalysisOutput } from "@/ai/flows/market-price-trend-analysis";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

const MOCK_MARKETS = [
  { crop: "Wheat", state: "Punjab", price: 2150, prevPrice: 1800, data: [{date: "01/01", price: 1800}, {date: "02/01", price: 1900}, {date: "03/01", price: 2150}] },
  { crop: "Rice", state: "West Bengal", price: 2400, prevPrice: 2350, data: [{date: "01/01", price: 2300}, {date: "02/01", price: 2350}, {date: "03/01", price: 2400}] },
  { crop: "Onion", state: "Maharashtra", price: 3500, prevPrice: 2000, data: [{date: "01/01", price: 1500}, {date: "02/01", price: 2000}, {date: "03/01", price: 3500}] },
];

const chartConfig = {
  price: { label: "Price (₹)", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

export function MarketIntelligence() {
  const [selectedCrop, setSelectedCrop] = useState("Onion");
  const [analysis, setAnalysis] = useState<MarketPriceTrendAnalysisOutput | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const runAnalysis = async () => {
      setLoading(true);
      const data = MOCK_MARKETS.find(m => m.crop === selectedCrop);
      if (data) {
        try {
          const res = await marketPriceTrendAnalysis({
            cropType: selectedCrop,
            state: data.state,
            marketPriceData: data.data
          });
          setAnalysis(res);
        } catch (err) {
          console.error(err);
        }
      }
      setLoading(false);
    };
    runAnalysis();
  }, [selectedCrop]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2 glass border-none rounded-[2.5rem] p-8">
        <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-3">
              <BarChart3 className="h-7 w-7 text-primary" />
              Mandi Economic Command
            </CardTitle>
            <CardDescription className="text-white/60">Live pricing intelligence with AI action forecasting</CardDescription>
          </div>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="w-[180px] glass border-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-white/10 text-white">
              {MOCK_MARKETS.map(m => (
                <SelectItem key={m.crop} value={m.crop}>{m.crop}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>

        <CardContent className="p-0 space-y-8">
          <div className="h-[300px] w-full">
            <ChartContainer config={chartConfig}>
              <LineChart data={MOCK_MARKETS.find(m => m.crop === selectedCrop)?.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" fontSize={10} />
                <YAxis stroke="rgba(255,255,255,0.5)" fontSize={10} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={4} 
                  dot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 0 }} 
                />
              </LineChart>
            </ChartContainer>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <span className="text-sm font-bold text-white/50 animate-pulse">Running Predictive Analysis...</span>
            </div>
          ) : analysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass p-6 rounded-3xl bg-primary/10 border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Strategy Advice</h4>
                  <Badge className={cn(
                    "rounded-full px-4 py-1 font-bold",
                    analysis.recommendedAction === 'Sell' ? 'bg-red-500 text-white' : 'bg-primary text-white'
                  )}>
                    {analysis.recommendedAction.toUpperCase()} NOW
                  </Badge>
                </div>
                <div className="text-3xl font-bold mb-2 flex items-center gap-2">
                  {analysis.predictedTrend === 'Rising' ? <TrendingUp className="h-8 w-8 text-primary" /> : <TrendingDown className="h-8 w-8 text-red-500" />}
                  {analysis.predictedTrend} Trend
                </div>
                <p className="text-sm text-white/70 leading-relaxed italic">"{analysis.reasoning}"</p>
              </div>

              <div className="glass p-6 rounded-3xl space-y-4">
                <div className="text-xs font-bold text-white/30 uppercase tracking-[0.2em]">Cluster Impact</div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Profitability Target</span>
                    <span className="text-primary font-bold">+14.2%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[70%] rounded-full" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/60">Inventory Risk</span>
                    <span className="text-orange-400 font-bold">Low</span>
                  </div>
                </div>
                <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all">Download Cluster Report</button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="glass border-none rounded-[2.5rem] p-8">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-500 uppercase tracking-widest">
              <AlertTriangle className="h-4 w-4" /> Market Volatility
            </CardTitle>
          </CardHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
              <h5 className="font-bold text-red-400 text-sm mb-1">Onion Price Spike</h5>
              <p className="text-xs text-white/50">Nashik Mandi prices 42% above seasonal average. Potential hoarding detected.</p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
              <h5 className="font-bold text-blue-400 text-sm mb-1">Stock Recommendation</h5>
              <p className="text-xs text-white/50">Recommend holding Wheat stock for 7 days. Predicted supply gap in North clusters.</p>
            </div>
          </div>
        </Card>

        <Card className="glass border-none rounded-[2.5rem] p-8 bg-gradient-to-br from-primary/20 to-transparent">
          <div className="flex flex-col gap-4">
            <Briefcase className="h-8 w-8 text-primary" />
            <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Smart Mandi Sync</div>
            <p className="text-sm font-medium leading-relaxed text-white/70">
              "Your cluster currently holds 420 Tons of Wheat. AI suggests a staggered sell starting Friday for 12% higher returns."
            </p>
            <div className="flex items-center gap-2 text-[10px] font-bold text-primary italic">
              <Info className="h-3 w-3" /> Based on regional logistics availability.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

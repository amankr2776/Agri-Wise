
"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Minus, Bell, BarChart3, MapPin, Loader2, AlertTriangle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { marketPriceTrendAnalysis, MarketPriceTrendAnalysisOutput } from "@/ai/flows/market-price-trend-analysis";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

const MOCK_MARKETS = [
  { crop: "Wheat", state: "Punjab", price: 2150, prevPrice: 1800, data: [{date: "01/01", price: 1800}, {date: "02/01", price: 1900}, {date: "03/01", price: 2150}] },
  { crop: "Rice", state: "West Bengal", price: 2400, prevPrice: 2350, data: [{date: "01/01", price: 2300}, {date: "02/01", price: 2350}, {date: "03/01", price: 2400}] },
  { crop: "Onion", state: "Maharashtra", price: 3500, prevPrice: 2000, data: [{date: "01/01", price: 1500}, {date: "02/01", price: 2000}, {date: "03/01", price: 3500}] },
  { crop: "Cotton", state: "Gujarat", price: 6500, prevPrice: 6600, data: [{date: "01/01", price: 6700}, {date: "02/01", price: 6600}, {date: "03/01", price: 6500}] },
];

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

  const getAlert = (price: number, prev: number) => {
    return price > prev * 1.2;
  };

  const trendIcon = (trend: string) => {
    if (trend === "Rising") return <TrendingUp className="text-red-500 h-4 w-4" />;
    if (trend === "Falling") return <TrendingDown className="text-green-500 h-4 w-4" />;
    return <Minus className="text-gray-400 h-4 w-4" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-primary flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Mandi Prices & Trends
            </CardTitle>
            <CardDescription>Live pricing across states with AI trend analysis.</CardDescription>
          </div>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Crop" />
            </SelectTrigger>
            <SelectContent>
              {MOCK_MARKETS.map(m => (
                <SelectItem key={m.crop} value={m.crop}>{m.crop}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_MARKETS.find(m => m.crop === selectedCrop)?.data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {loading ? (
            <div className="flex justify-center p-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : analysis && (
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-center gap-2 mb-2 font-bold">
                {trendIcon(analysis.predictedTrend)}
                AI Forecast: {analysis.predictedTrend}
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{analysis.reasoning}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Bell className="h-4 w-4 text-accent" />
              Government Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_MARKETS.filter(m => getAlert(m.price, m.prevPrice)).map(m => (
              <div key={m.crop} className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-red-800 text-sm">{m.crop} Price Spike!</div>
                  <p className="text-[10px] text-red-600">Price is {Math.round((m.price/m.prevPrice - 1)*100)}% above normal. Investigating market manipulation.</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold">State Wise Data</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crop</TableHead>
                  <TableHead>Price (q)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_MARKETS.map(m => (
                  <TableRow key={m.crop}>
                    <TableCell className="font-medium">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {m.state}
                      </div>
                      {m.crop}
                    </TableCell>
                    <TableCell>
                      ₹{m.price}
                      <span className={`text-[10px] ml-1 ${m.price > m.prevPrice ? 'text-red-500' : 'text-green-500'}`}>
                        {m.price > m.prevPrice ? '+' : '-'}{Math.abs(m.price - m.prevPrice)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

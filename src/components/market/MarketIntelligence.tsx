'use client';

import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  MapPin, 
  ArrowUpRight, 
  AlertCircle,
  BarChart3,
  Calendar
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

  return (
    <div className="space-y-8">
      {/* Filters & Stats */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex flex-wrap gap-4">
          <Select defaultValue="Wheat" onValueChange={setCrop}>
            <SelectTrigger className="w-[180px] rounded-full h-11">
              <SelectValue placeholder="Crop" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Wheat">Wheat</SelectItem>
              <SelectItem value="Rice">Rice</SelectItem>
              <SelectItem value="Onion">Onion</SelectItem>
              <SelectItem value="Cotton">Cotton</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="Punjab">
            <SelectTrigger className="w-[180px] rounded-full h-11">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Punjab">Punjab</SelectItem>
              <SelectItem value="Maharashtra">Maharashtra</SelectItem>
              <SelectItem value="Haryana">Haryana</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="Ludhiana">
            <SelectTrigger className="w-[180px] rounded-full h-11">
              <SelectValue placeholder="Mandi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Ludhiana">Ludhiana Mandi</SelectItem>
              <SelectItem value="Jalandhar">Jalandhar Mandi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
          {[
            { label: "Highest", val: "₹2,450", sub: "Sept" },
            { label: "Lowest", val: "₹1,800", sub: "July" },
            { label: "Avg Price", val: "₹2,045", sub: "6 mo" },
            { label: "Alerts", val: "1", sub: "Active", color: "text-destructive" },
          ].map((s, i) => (
            <div key={i} className="bg-card p-4 rounded-2xl border shadow-sm">
              <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{s.label}</p>
              <p className={`text-lg font-black ${s.color || ''}`}>{s.val}</p>
              <p className="text-[10px] text-muted-foreground">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Price Trend Chart */}
        <Card className="lg:col-span-8 border-none shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="p-8 border-b">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              6-Month Price Trend (₹/quintal)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={MOCK_DATA}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Predictive Card */}
        <Card className="lg:col-span-4 border-none shadow-sm rounded-3xl bg-primary p-8 text-white relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <TrendingUp className="h-64 w-64" />
          </div>
          <div className="relative z-10 space-y-6">
            <Badge className="bg-white/20 text-white border-none">AI Forecast</Badge>
            <h3 className="text-2xl font-bold">Recommended Action: HOLD</h3>
            <p className="text-primary-foreground/80 leading-relaxed">
              Based on seasonal data and reduced arrivals in Punjab Mandis, we predict a price increase of 12-15% over the next 3 weeks.
            </p>
            <div className="pt-4 border-t border-white/20">
              <div className="flex justify-between items-center text-sm mb-4">
                <span>Confidence Score</span>
                <span className="font-bold">89%</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-white w-[89%] rounded-full" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Market Data Table */}
      <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
        <div className="p-8 border-b flex justify-between items-center">
          <CardTitle className="text-xl font-bold">Mandi Live Feed</CardTitle>
          <Button variant="outline" className="rounded-full gap-2">
            <Calendar className="h-4 w-4" /> Export Report
          </Button>
        </div>
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold">Crop</TableHead>
              <TableHead className="font-bold">Mandi</TableHead>
              <TableHead className="font-bold">State</TableHead>
              <TableHead className="font-bold text-right">Price (₹/q)</TableHead>
              <TableHead className="font-bold">Trend</TableHead>
              <TableHead className="font-bold text-right">Change (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TABLE_DATA.map((row, i) => (
              <TableRow key={i} className="group hover:bg-muted/30 transition-colors">
                <TableCell className="font-bold">
                  <div className="flex items-center gap-3">
                    {row.crop}
                    {row.alert && (
                      <Badge variant="destructive" className="h-5 px-1.5 text-[8px] uppercase animate-pulse">
                        <AlertCircle className="h-3 w-3 mr-1" /> Inflation Alert
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{row.mandi}</TableCell>
                <TableCell>{row.state}</TableCell>
                <TableCell className="text-right font-black">₹{row.price}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    {row.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-primary" />
                    ) : row.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    ) : (
                      <Minus className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className={cn(
                      "text-xs font-bold uppercase",
                      row.trend === 'up' ? 'text-primary' : row.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                    )}>
                      {row.trend}
                    </span>
                  </div>
                </TableCell>
                <TableCell className={cn(
                  "text-right font-bold",
                  row.trend === 'up' ? 'text-primary' : row.trend === 'down' ? 'text-destructive' : ''
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

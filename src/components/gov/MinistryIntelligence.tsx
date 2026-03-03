
"use client";

import React, { useMemo } from "react";
import { 
  AlertTriangle, 
  Map as MapIcon, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Globe, 
  ArrowUpRight, 
  MapPin, 
  ShieldAlert
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

// Mock data for the Ministry
const PEST_OUTBREAKS = [
  { id: "1", pest: "Locust Swarm", crop: "Wheat", state: "Rajasthan", severity: "Critical", lat: 26.9124, lng: 75.7873 },
  { id: "2", pest: "Fall Armyworm", crop: "Maize", state: "Karnataka", severity: "High", lat: 12.9716, lng: 77.5946 },
  { id: "3", pest: "Whitefly", crop: "Cotton", state: "Punjab", severity: "Medium", lat: 30.9010, lng: 75.8573 },
  { id: "4", pest: "Aphids", crop: "Mustard", state: "Haryana", severity: "Low", lat: 29.0588, lng: 76.0856 },
];

const PRICE_ALERTS = [
  { crop: "Onion", state: "Maharashtra", currentPrice: 4200, seasonalAvg: 3000, deviation: 40 },
  { crop: "Potato", state: "Punjab", currentPrice: 1800, seasonalAvg: 1400, deviation: 28 },
  { crop: "Tomato", state: "Karnataka", currentPrice: 3500, seasonalAvg: 3200, deviation: 9 },
  { crop: "Wheat", state: "Madhya Pradesh", currentPrice: 2400, seasonalAvg: 2350, deviation: 2 },
];

const CERTIFICATION_STATS = {
  certified: 12450,
  nonCertified: 8900,
  total: 21350
};

export function MinistryIntelligence() {
  const criticalPriceAlerts = useMemo(() => 
    PRICE_ALERTS.filter(alert => alert.deviation >= 20), 
  []);

  const certPercentage = Math.round((CERTIFICATION_STATS.certified / CERTIFICATION_STATS.total) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-xl bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-primary">
              <CheckCircle className="h-4 w-4" /> Certification Velocity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{certPercentage}%</div>
            <Progress value={certPercentage} className="h-2" />
            <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-wider">
              {CERTIFICATION_STATS.certified.toLocaleString()} Certified Clusters
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-gradient-to-br from-red-50 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-600">
              <ShieldAlert className="h-4 w-4" /> Active Outbreaks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{PEST_OUTBREAKS.length}</div>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-wider">
              High Severity Zones: {PEST_OUTBREAKS.filter(o => o.severity === 'Critical' || o.severity === 'High').length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl bg-gradient-to-br from-orange-50 to-transparent">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-orange-600">
              <TrendingUp className="h-4 w-4" /> Price Volatility
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{criticalPriceAlerts.length}</div>
            <p className="text-[10px] text-muted-foreground mt-2 uppercase font-bold tracking-wider">
              States with {">"}20% inflation
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pest Outbreak Map Simulation */}
        <Card className="lg:col-span-2 border-none shadow-2xl rounded-3xl overflow-hidden bg-slate-900 text-white">
          <CardHeader className="p-8 border-b border-white/10">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Globe className="h-6 w-6 text-primary" />
                  Live Pest Outbreak Map
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">Geographic surveillance across Indian states</CardDescription>
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30">Live Data</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0 relative min-h-[400px] flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5ce?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px]" />
            
            {/* Simulated Map Markers */}
            <div className="relative w-full h-full p-8 grid grid-cols-4 gap-4">
              {PEST_OUTBREAKS.map((outbreak) => (
                <div 
                  key={outbreak.id}
                  className="flex flex-col items-center gap-2 animate-bounce"
                  style={{ 
                    marginTop: `${Math.random() * 100}px`,
                    marginLeft: `${Math.random() * 50}px`
                  }}
                >
                  <div className={`p-2 rounded-full shadow-2xl ${
                    outbreak.severity === 'Critical' ? 'bg-red-500' : 
                    outbreak.severity === 'High' ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}>
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div className="bg-slate-800/90 backdrop-blur-md p-3 rounded-xl border border-white/10 text-center min-w-[120px]">
                    <div className="text-[10px] font-bold text-primary uppercase">{outbreak.pest}</div>
                    <div className="text-xs font-bold">{outbreak.state}</div>
                    <div className="text-[8px] text-slate-400 font-mono mt-1">
                      {outbreak.lat.toFixed(2)}N, {outbreak.lng.toFixed(2)}E
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Price Alerts Section */}
        <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
          <CardHeader className="p-6 bg-slate-50 border-b">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-800">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Inflation Alert Center
            </CardTitle>
            <CardDescription>Crops exceeding seasonal average by 20%+</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {criticalPriceAlerts.map((alert, idx) => (
                <div key={idx} className="p-5 hover:bg-slate-50 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900">{alert.crop}</h4>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <MapPin className="h-3 w-3" /> {alert.state}
                      </div>
                    </div>
                    <Badge variant="destructive" className="rounded-full flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3" /> +{alert.deviation}%
                    </Badge>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-muted-foreground">Current Mandi Price</div>
                      <div className="text-lg font-bold text-slate-800">₹{alert.currentPrice} <span className="text-xs font-normal text-slate-400">/ quintal</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-bold text-muted-foreground">Seasonal Avg</div>
                      <div className="text-sm font-bold text-slate-500">₹{alert.seasonalAvg}</div>
                    </div>
                  </div>
                </div>
              ))}
              {criticalPriceAlerts.length === 0 && (
                <div className="p-10 text-center text-muted-foreground">
                  No critical price deviations detected.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certification Table */}
      <Card className="border-none shadow-2xl rounded-3xl overflow-hidden bg-white">
        <CardHeader className="p-8 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-3 text-slate-800">
                <CheckCircle className="h-6 w-6 text-primary" />
                Certification Status (India)
              </CardTitle>
              <CardDescription>Comprehensive audit of agricultural clusters by region</CardDescription>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="px-4 py-1">Certified: {CERTIFICATION_STATS.certified.toLocaleString()}</Badge>
              <Badge variant="outline" className="px-4 py-1">Pending: {CERTIFICATION_STATS.nonCertified.toLocaleString()}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold p-6">Region / Cluster</TableHead>
                <TableHead className="font-bold">Primary Crop</TableHead>
                <TableHead className="font-bold">Expert Auditor</TableHead>
                <TableHead className="font-bold">Status</TableHead>
                <TableHead className="font-bold text-right p-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { region: "Nashik Onion Hub", crop: "Onion", auditor: "Dr. Arvind S.", status: "Certified" },
                { region: "Punjab Wheat Belt", crop: "Wheat", auditor: "P. Singh", status: "Certified" },
                { region: "Karnataka Maize Zone", crop: "Maize", auditor: "R. Gowda", status: "Pending" },
                { region: "Gujarat Cotton Cluster", crop: "Cotton", auditor: "M. Patel", status: "Certified" },
              ].map((row, i) => (
                <TableRow key={i} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="p-6 font-bold text-slate-700">{row.region}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold">{row.crop}</Badge>
                  </TableCell>
                  <TableCell className="text-slate-600 font-medium">{row.auditor}</TableCell>
                  <TableCell>
                    {row.status === "Certified" ? (
                      <div className="flex items-center gap-1.5 text-primary font-bold">
                        <CheckCircle className="h-4 w-4" /> Certified
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-orange-500 font-bold">
                        <XCircle className="h-4 w-4" /> Under Review
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="p-6 text-right">
                    <button className="text-primary font-bold hover:underline text-sm">View Report</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

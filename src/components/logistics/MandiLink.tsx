'use client';

import React, { useState } from "react";
import { 
  Truck, 
  MapPin, 
  Scale, 
  Phone, 
  Star, 
  Package, 
  Navigation, 
  Calculator,
  ArrowRight,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const VEHICLES = [
  { id: 1, name: "Kisan Express", provider: "Rural Freight Co.", type: "Mini Truck", capacity: "2 Tons", rate: 15, rating: 4.8, status: "Available" },
  { id: 2, name: "Mandi Cooler", provider: "FastFarm Logistics", type: "Refrigerated Van", capacity: "5 Tons", rate: 45, rating: 4.9, status: "Available" },
  { id: 3, name: "Heavy Hauler", provider: "AgriMove India", type: "Large Truck", capacity: "15 Tons", rate: 25, rating: 4.5, status: "In Transit" },
  { id: 4, name: "Eco Link", provider: "Green Way", type: "E-Rickshaw", capacity: "0.5 Tons", rate: 8, rating: 4.2, status: "Available" },
  { id: 5, name: "Village Trolley", provider: "Local Connect", type: "Tractor Trolley", capacity: "3 Tons", rate: 12, rating: 4.4, status: "Maintenance" },
  { id: 6, name: "Pickup Pro", provider: "Swift Agri", type: "Pickup Van", capacity: "1.5 Tons", rate: 18, rating: 4.7, status: "Available" },
  { id: 7, name: "Mega Carrier", provider: "Bharat Logistics", type: "Container Truck", capacity: "20 Tons", rate: 35, rating: 4.6, status: "In Transit" },
  { id: 8, name: "Desi Transport", provider: "Khet Se", type: "Bullock Cart", capacity: "0.2 Tons", rate: 5, rating: 4.0, status: "Available" },
];

export function MandiLink() {
  const [distance, setDistance] = useState("");
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);

  const calculateEstimate = () => {
    const dist = parseFloat(distance);
    if (!isNaN(dist)) {
      setEstimatedCost(dist * 15); // Simple avg base rate
    }
  };

  return (
    <div className="space-y-8">
      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="bg-muted rounded-full p-1 h-12 mb-8">
          <TabsTrigger value="browse" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">
            Browse Logistics
          </TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-bold">
            My Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-8">
          {/* Cost Estimator */}
          <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="p-8 bg-muted/30">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Calculator className="h-6 w-6 text-primary" />
                Quick Cost Estimator
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Origin</label>
                  <Input placeholder="Current Location" className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Destination (Mandi)</label>
                  <Input placeholder="Select Mandi" className="rounded-xl h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Distance (km)</label>
                  <Input 
                    type="number" 
                    placeholder="Enter km" 
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    className="rounded-xl h-12" 
                  />
                </div>
                <Button onClick={calculateEstimate} className="h-12 rounded-xl font-bold gap-2">
                  Estimate Cost <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              {estimatedCost !== null && (
                <div className="mt-8 p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase text-primary tracking-widest">Estimated Trip Cost</p>
                    <p className="text-3xl font-black text-primary">₹{estimatedCost.toLocaleString()}</p>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium italic max-w-[200px]">
                    *Base estimation only. Final rates may vary by vehicle type and load.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Grid */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Available Fleet</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {VEHICLES.map((v) => (
                <Card key={v.id} className="border-none shadow-sm rounded-3xl overflow-hidden hover:shadow-md transition-all group">
                  <CardHeader className="p-6 bg-muted/30 pb-0">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm">
                        <Truck className="h-6 w-6" />
                      </div>
                      <Badge 
                        variant={v.status === 'Available' ? 'outline' : 'secondary'}
                        className={cn(
                          "text-[10px] uppercase font-bold",
                          v.status === 'Available' ? "text-primary border-primary/30" : 
                          v.status === 'Maintenance' ? "text-destructive border-destructive/30" : ""
                        )}
                      >
                        {v.status}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold">{v.name}</CardTitle>
                    <p className="text-xs text-muted-foreground font-medium">{v.provider}</p>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest">Capacity</p>
                        <p className="text-xs font-bold flex items-center gap-1"><Scale className="h-3 w-3" /> {v.capacity}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest">Rate/KM</p>
                        <p className="text-xs font-bold flex items-center gap-1">₹{v.rate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className={cn(
                          "h-3 w-3",
                          i < Math.floor(v.rating) ? "fill-amber-400 text-amber-400" : "text-muted"
                        )} />
                      ))}
                      <span className="text-xs font-bold ml-1">{v.rating}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Button 
                      disabled={v.status !== 'Available'}
                      className="w-full h-11 rounded-xl font-bold gap-2"
                    >
                      <Navigation className="h-4 w-4" /> Book Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="bookings" className="space-y-4">
          <Card className="border-none shadow-sm rounded-3xl p-8">
            <div className="space-y-6">
              {[
                { id: "BK-4421", vehicle: "Mandi Cooler", status: "In Transit", date: "Today, 10:30 AM", origin: "Farm", dest: "Ludhiana Mandi" },
                { id: "BK-3912", vehicle: "Kisan Express", status: "Delivered", date: "Yesterday", origin: "Farm", dest: "Mullanpur Mandi" },
              ].map((booking, i) => (
                <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-muted/30 rounded-2xl gap-4 border border-transparent hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{booking.id}</p>
                        <Badge variant={booking.status === 'In Transit' ? 'default' : 'secondary'} className="text-[8px] uppercase font-bold">
                          {booking.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{booking.vehicle} • {booking.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                    <span>{booking.origin}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span>{booking.dest}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {booking.status === 'In Transit' && (
                      <div className="flex items-center gap-2 text-primary font-bold text-xs">
                        <Clock className="h-4 w-4" /> 22 min left
                      </div>
                    )}
                    <Button variant="ghost" size="sm" className="font-bold text-xs text-primary">Track Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
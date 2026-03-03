
"use client";

import React from "react";
import { Truck, MapPin, Scale, Phone, Star, Package } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const PROVIDERS = [
  { id: 1, name: "Kisan Transport Service", type: "Heavy Truck", capacity: "15 Tons", rate: 25, rating: 4.8, location: "Ludhiana" },
  { id: 2, name: "FastFarm Logistics", type: "Pick-up Van", capacity: "2 Tons", rate: 15, rating: 4.5, location: "Nashik" },
  { id: 3, name: "AgriMove India", type: "Refrigerated Van", capacity: "5 Tons", rate: 45, rating: 4.9, location: "Jaipur" },
  { id: 4, name: "Rural Freight Express", type: "Tractor Trailer", capacity: "8 Tons", rate: 18, rating: 4.2, location: "Bhopal" },
];

export function LogisticsMarket() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-headline font-bold text-primary">Logistics Marketplace</h2>
          <p className="text-muted-foreground">Find reliable transport for your harvest.</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">List My Vehicle</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PROVIDERS.map((p) => (
          <Card key={p.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="p-4 bg-muted/30">
              <div className="flex justify-between items-start">
                <Truck className="h-8 w-8 text-primary" />
                <Badge variant="outline" className="bg-white">₹{p.rate}/km</Badge>
              </div>
              <CardTitle className="text-lg mt-2">{p.name}</CardTitle>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> {p.location}
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-muted-foreground" /> {p.type}
                </div>
                <div className="flex items-center gap-1 font-semibold">
                  <Scale className="h-4 w-4 text-muted-foreground" /> {p.capacity}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < Math.floor(p.rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                ))}
                <span className="text-xs ml-1 font-bold">{p.rating}</span>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <Button className="w-full flex items-center gap-2">
                <Phone className="h-4 w-4" /> Book Transport
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

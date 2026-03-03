
"use client";

import React, { useState } from "react";
import { 
  Truck, 
  MapPin, 
  Phone, 
  Edit3, 
  Save, 
  Plus, 
  TrendingUp, 
  Globe,
  Settings2,
  Package,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const INITIAL_VEHICLES = [
  { id: "1", type: "Refrigerated Van", plate: "MH-15-AB-1234", pricePerKm: 45, status: "Active" },
  { id: "2", type: "Mini Truck", plate: "MH-15-CD-5678", pricePerKm: 18, status: "In Transit" },
  { id: "3", type: "Heavy Truck", plate: "MH-15-EF-9012", pricePerKm: 32, status: "Maintenance" },
];

export function FleetManagement() {
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES);
  const [phoneNumber, setPhoneNumber] = useState("+91 98765 43210");
  const [isEditingContact, setIsEditingContact] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);

  const handlePriceUpdate = (id: string, newPrice: number) => {
    setVehicles(vehicles.map(v => v.id === id ? { ...v, pricePerKm: newPrice } : v));
    setEditingPriceId(null);
    toast({
      title: "Rate Updated",
      description: "The vehicle price per KM has been updated successfully.",
    });
  };

  const updateContact = () => {
    setIsEditingContact(false);
    toast({
      title: "Contact Updated",
      description: "Your agency phone number has been updated.",
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold font-headline text-primary flex items-center gap-3">
            <Truck className="h-8 w-8" />
            Express Mandi Logistics
          </h2>
          <p className="text-muted-foreground mt-1">Fleet Management & Agency Dashboard</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 rounded-full font-bold">
            Verified Partner
          </Badge>
          <Button className="rounded-full bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> Add Vehicle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Fleet List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="p-8 bg-slate-50 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Package className="h-6 w-6 text-primary" />
                  Vehicle Inventory
                </CardTitle>
                <Badge variant="outline" className="bg-white">{vehicles.length} Total Units</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {vehicles.map((v) => (
                  <div key={v.id} className="p-8 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                    <div className="flex items-center gap-6">
                      <div className="h-16 w-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                        <Truck className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-lg text-slate-800">{v.type}</h4>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-[10px] font-mono tracking-tighter bg-slate-100">{v.plate}</Badge>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest flex items-center gap-1",
                            v.status === 'Active' ? 'text-primary' : v.status === 'In Transit' ? 'text-blue-500' : 'text-orange-500'
                          )}>
                            <div className={cn("h-1.5 w-1.5 rounded-full animate-pulse", 
                               v.status === 'Active' ? 'bg-primary' : v.status === 'In Transit' ? 'bg-blue-500' : 'bg-orange-500'
                            )} />
                            {v.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Rate / KM</div>
                        {editingPriceId === v.id ? (
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number" 
                              className="w-20 h-8 text-sm font-bold" 
                              defaultValue={v.pricePerKm} 
                              onBlur={(e) => handlePriceUpdate(v.id, Number(e.target.value))}
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-primary">
                              <Save className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 cursor-pointer group/price" onClick={() => setEditingPriceId(v.id)}>
                            <div className="text-xl font-bold text-slate-800">₹{v.pricePerKm}</div>
                            <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover/price:opacity-100 transition-opacity" />
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl font-bold border-slate-200">Details</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Contact Update */}
          <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="p-8 bg-slate-50 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800 uppercase tracking-widest">
                <Phone className="h-4 w-4 text-primary" />
                Agency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase">Hotline Number</Label>
                {isEditingContact ? (
                  <div className="flex gap-2">
                    <Input 
                      value={phoneNumber} 
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="h-10 font-bold"
                    />
                    <Button size="icon" onClick={updateContact} className="shrink-0"><Save className="h-4 w-4" /></Button>
                  </div>
                ) : (
                  <div className="text-xl font-bold text-slate-800 flex items-center justify-between">
                    {phoneNumber}
                    <Button variant="ghost" size="icon" onClick={() => setIsEditingContact(true)}>
                      <Edit3 className="h-4 w-4 text-primary" />
                    </Button>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full rounded-xl font-bold border-primary/20 text-primary hover:bg-primary/5">
                Update Agency Identity
              </Button>
            </CardContent>
          </Card>

          {/* Regions Served */}
          <Card className="border-none shadow-2xl rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="p-8 bg-slate-50 border-b">
              <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800 uppercase tracking-widest">
                <Globe className="h-4 w-4 text-blue-500" />
                Service Reach
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="font-bold text-slate-700">North India</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-slate-50 border-none">Primary</Badge>
                </div>
                <div className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-400" />
                    <span className="font-bold text-slate-700">Pan India</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-slate-50 border-none">Standard</Badge>
                </div>
                <div className="flex items-center justify-between group opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-slate-300" />
                    <span className="font-bold text-slate-700">South Region</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-slate-50 border-none">Coming Soon</Badge>
                </div>
              </div>
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                  <span>Capacity Index</span>
                  <span className="text-primary">+12%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[75%] rounded-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

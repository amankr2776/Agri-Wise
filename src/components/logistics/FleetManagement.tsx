
'use client';

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
  AlertCircle,
  Navigation,
  Loader2,
  RefreshCw,
  MoreVertical
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, updateDoc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function FleetManagement() {
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("bookings");

  const bookingsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    // For prototype, show all bookings. In prod, filter by logistics agency ID
    return query(collection(firestore, "bookings"));
  }, [firestore]);

  const { data: incomingBookings, isLoading: loadingBookings } = useCollection(bookingsQuery);

  const handleUpdateStatus = (bookingId: string, nextStatus: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "bookings", bookingId);
    updateDocumentNonBlocking(docRef, { 
      status: nextStatus,
      updatedAt: new Date().toISOString() 
    });
    
    toast({
      title: "Shipment Updated",
      description: `Status changed to ${nextStatus}. The farmer has been notified.`,
    });
  };

  const getNextStatus = (current: string) => {
    const sequence = ["Pending", "Confirmed", "Picked Up", "In Transit", "Reached Destination"];
    const idx = sequence.indexOf(current);
    return idx < sequence.length - 1 ? sequence[idx + 1] : null;
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black font-headline text-slate-900 flex items-center gap-3">
            <Truck className="h-9 w-9 text-primary" />
            Provider Hub
          </h2>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-widest">Global Logistics & Fleet Oversight</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-full shadow-sm border">
          <Button variant="ghost" className="rounded-full h-10 px-6 font-bold text-xs">Reports</Button>
          <Button className="rounded-full h-10 px-8 font-black text-xs bg-primary shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" /> Add Vehicle
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted/50 rounded-full p-1 h-12 mb-10 w-fit">
          <TabsTrigger value="bookings" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest">
            Active Loads
          </TabsTrigger>
          <TabsTrigger value="fleet" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest">
            My Fleet
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-full px-8 h-10 data-[state=active]:bg-primary data-[state=active]:text-white font-black text-xs uppercase tracking-widest">
            Agency Profile
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-8">
          <div className="grid grid-cols-1 gap-6">
            {!incomingBookings?.length ? (
              <Card className="border-dashed border-2 p-32 text-center bg-muted/20 rounded-[3rem]">
                <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
                <h3 className="text-2xl font-black">No Active Assignments</h3>
                <p className="text-muted-foreground mt-2 font-medium">Wait for incoming harvest booking requests.</p>
              </Card>
            ) : (
              incomingBookings.map((booking) => {
                const next = getNextStatus(booking.status);
                return (
                  <Card key={booking.id} className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white hover:shadow-2xl transition-all duration-300">
                    <div className="p-8 flex flex-col lg:flex-row items-center justify-between gap-10">
                      <div className="flex items-center gap-8 w-full lg:w-auto">
                        <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary shrink-0">
                          <Package className="h-10 w-10" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h4 className="text-2xl font-black">{booking.cropType} Load</h4>
                            <Badge variant="outline" className="text-[10px] font-black uppercase bg-primary/5 text-primary border-primary/10">
                              {booking.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                            <Navigation className="h-3.5 w-3.5" />
                            To: {booking.destination || "Ludhiana Central Mandi"}
                          </p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Trip ID: {booking.id.slice(-8)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 flex-1 w-full text-center">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Distance</p>
                          <p className="text-lg font-black">{booking.distance} KM</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Est. Fare</p>
                          <p className="text-lg font-black text-primary">₹{booking.estimatedFare.toLocaleString()}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Time Lapsed</p>
                          <p className="text-lg font-black">42m</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Weight</p>
                          <p className="text-lg font-black">2.4T</p>
                        </div>
                      </div>

                      <div className="flex gap-4 w-full lg:w-auto">
                        {next ? (
                          <Button 
                            onClick={() => handleUpdateStatus(booking.id, next)}
                            className="flex-1 lg:w-48 h-14 rounded-2xl font-black gap-2 shadow-lg shadow-primary/20"
                          >
                            <RefreshCw className="h-5 w-5" />
                            Confirm {next}
                          </Button>
                        ) : (
                          <Button 
                            disabled 
                            className="flex-1 lg:w-48 h-14 rounded-2xl font-black bg-green-500 text-white"
                          >
                            <CheckCircle2 className="h-5 w-5 mr-2" />
                            Completed
                          </Button>
                        )}
                        <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-200">
                          <MoreVertical className="h-6 w-6" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { type: "Refrigerated Van", status: "Active", loc: "Ludhiana Hub" },
              { type: "Mini Truck", status: "Standby", loc: "Service Center" },
              { type: "Heavy Truck", status: "Active", loc: "NH-44 Bypass" },
            ].map((v, i) => (
              <Card key={i} className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="h-14 w-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                    <Truck className="h-8 w-8" />
                  </div>
                  <Badge className={cn(
                    "rounded-full h-8 px-4 font-bold text-[10px] uppercase",
                    v.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                  )}>
                    {v.status}
                  </Badge>
                </div>
                <div>
                  <h4 className="text-xl font-black">{v.type}</h4>
                  <p className="text-xs font-bold text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="h-3.5 w-3.5" /> {v.loc}
                  </p>
                </div>
                <div className="pt-4 border-t flex justify-between items-center">
                  <span className="text-[10px] font-black text-muted-foreground uppercase">Battery / Fuel</span>
                  <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


'use client';

import React, { useState, useMemo } from "react";
import { 
  Truck, 
  MapPin, 
  Calculator,
  Navigation, 
  Package, 
  Phone,
  Search,
  Loader2
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslation } from "@/hooks/use-translation";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, addDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export function MandiLink() {
  const { t } = useTranslation();
  const firestore = useFirestore();
  const { user } = useUser();
  const { toast } = useToast();
  const [distance, setDistance] = useState("");

  const vehiclesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "vehicles"));
  }, [firestore]);

  const { data: vehicles, isLoading } = useCollection(vehiclesQuery);

  const handleBook = (v: any) => {
    if (!user) return;
    addDoc(collection(firestore, "bookings"), {
      farmerId: user.uid,
      agencyName: v.agencyName,
      status: "Pending",
      distance: Number(distance) || 25,
      estimatedFare: (Number(distance) || 25) * (v.pricePerKm || 22),
      createdAt: new Date().toISOString()
    });
    toast({ title: t("shipments"), description: "Booking request sent." });
  };

  return (
    <div className="space-y-10">
      <Tabs defaultValue="browse">
        <TabsList className="bg-muted rounded-full p-1 h-12 mb-10">
          <TabsTrigger value="browse" className="rounded-full px-8">{t("transport")}</TabsTrigger>
          <TabsTrigger value="bookings" className="rounded-full px-8">{t("shipments")}</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-10">
          <Card className="bg-slate-900 text-white p-10 rounded-[3rem] border-none shadow-2xl relative overflow-hidden">
            <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <Badge className="bg-primary/20 text-primary border-none">{t("fare_estimator")}</Badge>
                <h3 className="text-3xl font-black">{t("fare_estimator")}</h3>
                <div className="flex gap-4">
                  <Input 
                    value={distance} 
                    onChange={(e) => setDistance(e.target.value)} 
                    placeholder="KM" 
                    className="bg-white/10 border-white/10 h-14 rounded-2xl text-white font-bold"
                  />
                  <Button className="h-14 px-8 rounded-2xl">{t("save")}</Button>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {isLoading ? <Loader2 className="animate-spin" /> : vehicles?.map((v) => (
              <Card key={v.id} className="glass-card p-8 rounded-[2.5rem] border-none hover:shadow-2xl transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Truck className="h-8 w-8" />
                  </div>
                  <Badge variant="outline">₹{v.pricePerKm}/km</Badge>
                </div>
                <h4 className="text-2xl font-black mb-2">{v.agencyName}</h4>
                <p className="text-muted-foreground flex items-center gap-2 mb-6">
                  <MapPin className="h-4 w-4" /> {v.city}, {v.state}
                </p>
                <Button onClick={() => handleBook(v)} className="w-full h-12 rounded-xl font-black">{t("transport")}</Button>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

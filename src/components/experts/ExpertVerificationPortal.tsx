
'use client';

import React, { useState } from "react";
import { 
  ShieldCheck, 
  FlaskConical, 
  CheckCircle2, 
  AlertCircle, 
  Leaf, 
  Bug, 
  ClipboardCheck,
  Loader2,
  Plus,
  ArrowRight,
  Database
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, addDoc, getDocs } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppState } from "@/lib/app-state";

const DEFAULT_CROPS = [
  // Cereals & Grains
  { name: "Paddy", category: "Grain", diseaseName: "Rice Blast", severity: "High", chemicalCure: "Tricyclazole 75% WP", chemicalDosage: "0.6g / L", desiNuskha: "Neem oil spray (3%) mixed with cow urine.", isCertified: false, imageUrl: "https://picsum.photos/seed/paddy1/800/400" },
  { name: "Wheat", category: "Grain", diseaseName: "Brown Rust", severity: "High", chemicalCure: "Propiconazole 25% EC", chemicalDosage: "1ml / L", desiNuskha: "Butter milk spray after fermentation for 3 days.", isCertified: false, imageUrl: "https://picsum.photos/seed/wheat1/800/400" },
  { name: "Maize", category: "Grain", diseaseName: "Fall Armyworm", severity: "Critical", chemicalCure: "Spinetoram 11.7% SC", chemicalDosage: "0.5ml / L", desiNuskha: "Sand and lime mixture in the whorls.", isCertified: false, imageUrl: "https://picsum.photos/seed/maize1/800/400" },
  
  // Vegetables
  { name: "Tomato", category: "Vegetable", diseaseName: "Early Blight", severity: "Medium", chemicalCure: "Mancozeb 75% WP", chemicalDosage: "2.5g / L", desiNuskha: "Baking soda and soap water spray.", isCertified: false, imageUrl: "https://picsum.photos/seed/tomato1/800/400" },
  { name: "Potato", category: "Vegetable", diseaseName: "Late Blight", severity: "Critical", chemicalCure: "Metalaxyl 8% + Mancozeb 64%", chemicalDosage: "2g / L", desiNuskha: "Wood ash dusting on damp leaves.", isCertified: false, imageUrl: "https://picsum.photos/seed/potato1/800/400" },
  { name: "Onion", category: "Vegetable", diseaseName: "Purple Blotch", severity: "Medium", chemicalCure: "Tebuconazole 25.9% EC", chemicalDosage: "1ml / L", desiNuskha: "Onion peel extract fermented for 48 hours.", isCertified: false, imageUrl: "https://picsum.photos/seed/onion1/800/400" },
  { name: "Chili", category: "Vegetable", diseaseName: "Leaf Curl", severity: "High", chemicalCure: "Imidacloprid 17.8% SL", chemicalDosage: "0.5ml / L", desiNuskha: "Sour buttermilk spray (5 days old).", isCertified: false, imageUrl: "https://picsum.photos/seed/chili1/800/400" },
  { name: "Brinjal", category: "Vegetable", diseaseName: "Little Leaf", severity: "High", chemicalCure: "Dimethoate 30% EC", chemicalDosage: "2ml / L", desiNuskha: "Removal of infected plants and marigold intercropping.", isCertified: false, imageUrl: "https://picsum.photos/seed/brinjal1/800/400" },

  // Fruits
  { name: "Mango", category: "Fruit", diseaseName: "Anthracnose", severity: "High", chemicalCure: "Carbendazim 50% WP", chemicalDosage: "1g / L", desiNuskha: "Pruning and copper oxychloride paste on cuts.", isCertified: false, imageUrl: "https://picsum.photos/seed/mango1/800/400" },
  { name: "Banana", category: "Fruit", diseaseName: "Panama Wilt", severity: "Critical", chemicalCure: "Carbendazim injection", chemicalDosage: "3ml / plant", desiNuskha: "Crop rotation with paddy and liming of soil.", isCertified: false, imageUrl: "https://picsum.photos/seed/banana1/800/400" },
  { name: "Grapes", category: "Fruit", diseaseName: "Downy Mildew", severity: "High", chemicalCure: "Bordeaux Mixture 1%", chemicalDosage: "10g / L", desiNuskha: "Garlic and cinnamon oil emulsion.", isCertified: false, imageUrl: "https://picsum.photos/seed/grapes1/800/400" },
  { name: "Apple", category: "Fruit", diseaseName: "Scab", severity: "High", chemicalCure: "Captan 50% WP", chemicalDosage: "2.5g / L", desiNuskha: "Urea spray (5%) after leaf fall to accelerate decomposition.", isCertified: false, imageUrl: "https://picsum.photos/seed/apple1/800/400" },

  // Oilseeds & Seeds
  { name: "Mustard", category: "Oilseed", diseaseName: "Alternaria Blight", severity: "Medium", chemicalCure: "Mancozeb 75% WP", chemicalDosage: "2.5g / L", desiNuskha: "Ginger-Garlic-Chili extract spray.", isCertified: false, imageUrl: "https://picsum.photos/seed/mustard1/800/400" },
  { name: "Sunflower", category: "Oilseed", diseaseName: "Head Rot", severity: "High", chemicalCure: "Sulfur 80% WP", chemicalDosage: "3g / L", desiNuskha: "Application of Trichoderma viride in soil.", isCertified: false, imageUrl: "https://picsum.photos/seed/sunflower1/800/400" },
  { name: "Groundnut", category: "Oilseed", diseaseName: "Tikka Disease", severity: "High", chemicalCure: "Chlorothalonil 75% WP", chemicalDosage: "2g / L", desiNuskha: "Seed treatment with Bijamrita.", isCertified: false, imageUrl: "https://picsum.photos/seed/groundnut1/800/400" },

  // Plantation & Spices
  { name: "Coffee", category: "Plantation", diseaseName: "Leaf Rust", severity: "High", chemicalCure: "Hexaconazole 5% EC", chemicalDosage: "1ml / L", desiNuskha: "Providing shade and improving air circulation.", isCertified: false, imageUrl: "https://picsum.photos/seed/coffee1/800/400" },
  { name: "Tea", category: "Plantation", diseaseName: "Blister Blight", severity: "High", chemicalCure: "Copper Oxychloride + Nickel Chloride", chemicalDosage: "2g + 1g / L", desiNuskha: "Removal of shade trees and early pruning.", isCertified: false, imageUrl: "https://picsum.photos/seed/tea1/800/400" },
  { name: "Turmeric", category: "Spice", diseaseName: "Leaf Spot", severity: "Medium", chemicalCure: "Propiconazole 25% EC", chemicalDosage: "1ml / L", desiNuskha: "Rhizome treatment with cow dung slurry.", isCertified: false, imageUrl: "https://picsum.photos/seed/turmeric1/800/400" },
  { name: "Ginger", category: "Spice", diseaseName: "Soft Rot", severity: "Critical", chemicalCure: "Metalaxyl-M 4% + Mancozeb 64%", chemicalDosage: "2.5g / L", desiNuskha: "Proper drainage and crop rotation with non-host crops.", isCertified: false, imageUrl: "https://picsum.photos/seed/ginger1/800/400" },

  // Cash Crops
  { name: "Cotton", category: "Cash Crop", diseaseName: "Pink Bollworm", severity: "Critical", chemicalCure: "Profenophos 50% EC", chemicalDosage: "2ml / L", desiNuskha: "Pheromone traps and light traps at night.", isCertified: false, imageUrl: "https://picsum.photos/seed/cotton1/800/400" },
  { name: "Sugarcane", category: "Cash Crop", diseaseName: "Red Rot", severity: "Critical", chemicalCure: "Carbendazim 50% WP (Sett treatment)", chemicalDosage: "1g / L", desiNuskha: "Use of healthy setts and avoiding ratoon crop in infected fields.", isCertified: false, imageUrl: "https://picsum.photos/seed/sugarcane1/800/400" },
];

export function ExpertVerificationPortal() {
  const { firestore } = useFirestore();
  const { role } = useAppState();
  const { user } = useUser();
  const [seeding, setSeeding] = useState(false);

  const pendingCertsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "crops"),
      where("isCertified", "==", false)
    );
  }, [firestore]);

  const { data: pendingCerts, isLoading } = useCollection(pendingCertsQuery);

  const handleVerify = (certId: string) => {
    if (!firestore || !certId || !user) return;
    const docRef = doc(firestore, "crops", certId);
    
    updateDocumentNonBlocking(docRef, {
      isCertified: true,
      expertId: user.uid,
      verifiedAt: new Date().toISOString()
    });
  };

  const seedDatabase = async () => {
    if (!firestore) return;
    setSeeding(true);
    try {
      const colRef = collection(firestore, "crops");
      const existing = await getDocs(colRef);
      if (existing.empty) {
        for (const crop of DEFAULT_CROPS) {
          await addDoc(colRef, crop);
        }
      }
    } finally {
      setSeeding(false);
    }
  };

  if (role !== "Expert") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center text-destructive">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h3 className="text-2xl font-black">Restricted Access</h3>
        <p className="text-muted-foreground max-w-sm">This portal is exclusively for verified agricultural scientists and NGO experts.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-80 rounded-[2.5rem]" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <FlaskConical className="h-8 w-8 text-primary" />
            Scientist Verification Hub
          </h2>
          <p className="text-muted-foreground font-medium mt-1 italic">Certifying 'Desi Nuskhas' and Chemical treatments for regional efficacy.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={seedDatabase} 
            disabled={seeding}
            className="rounded-full border-primary/20 text-primary hover:bg-primary/5 font-bold px-6"
          >
            {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
            Sync Database
          </Button>
        </div>
      </div>

      {!pendingCerts || pendingCerts.length === 0 ? (
        <Card className="border-dashed border-2 p-24 text-center bg-muted/20 rounded-[3rem]">
          <div className="bg-primary/10 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <ClipboardCheck className="h-12 w-12 text-primary opacity-50" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">Queue is Cleared</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-4 font-medium leading-relaxed">
            All submitted remedies have been processed. New cases will appear here upon submission from the field diagnostic teams.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingCerts.map((cert) => (
            <Card key={cert.id} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden hover:translate-y-[-8px] transition-all duration-300 group">
              <CardHeader className="bg-muted/30 border-b p-8">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="bg-white border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-3">
                    {cert.category}
                  </Badge>
                  <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-black text-slate-900">{cert.name}</CardTitle>
                <p className="text-xs font-bold text-muted-foreground uppercase">{cert.diseaseName}</p>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-destructive uppercase tracking-widest">
                    <Bug className="h-4 w-4" /> Recommended Chemical
                  </div>
                  <p className="text-sm font-bold text-slate-700 bg-destructive/5 p-4 rounded-2xl border border-destructive/10">
                    {cert.chemicalCure} ({cert.chemicalDosage})
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                    <Leaf className="h-4 w-4" /> Traditional Nuskha
                  </div>
                  <p className="text-sm font-medium text-slate-600 bg-primary/5 p-4 rounded-2xl border border-primary/10 italic leading-relaxed">
                    "{cert.desiNuskha}"
                  </p>
                </div>
              </CardContent>
              <CardFooter className="p-8 bg-slate-50/50 border-t">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 font-black rounded-2xl h-14 shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                  onClick={() => handleVerify(cert.id)}
                >
                  <ShieldCheck className="h-5 w-5" />
                  Issue Professional Certification
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

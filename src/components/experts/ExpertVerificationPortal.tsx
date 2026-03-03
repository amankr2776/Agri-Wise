
"use client";

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
  Plus
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, updateDoc, addDoc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";

export function ExpertVerificationPortal() {
  const { firestore } = useFirestore();
  const { user } = useUser();
  const [seeding, setSeeding] = useState(false);

  // Memoize the query for uncertified crops
  const pendingCertsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, "cropCertifications"),
      where("isCertified", "==", false)
    );
  }, [firestore]);

  const { data: pendingCerts, isLoading } = useCollection(pendingCertsQuery);

  const handleVerify = (certId: string) => {
    if (!firestore || !certId || !user) return;
    const docRef = doc(firestore, "cropCertifications", certId);
    
    // Non-blocking update to set isCertified to true
    updateDocumentNonBlocking(docRef, {
      isCertified: true,
      expertId: user.uid,
      verifiedAt: new Date().toISOString()
    });
  };

  const seedSampleData = async () => {
    if (!firestore) return;
    setSeeding(true);
    const samples = [
      { cropName: "Kharif Wheat", majorPest: "Brown Rust", traditionalRemedy: "Neem Oil Spray (3%)", isCertified: false, region: "Punjab" },
      { cropName: "Basmati Rice", majorPest: "Stem Borer", traditionalRemedy: "Trichogramma Egg Parasitoids", isCertified: false, region: "Haryana" },
      { cropName: "Desi Cotton", majorPest: "Pink Bollworm", traditionalRemedy: "Pheromone Trapping", isCertified: false, region: "Gujarat" },
    ];

    try {
      for (const sample of samples) {
        await addDoc(collection(firestore, "cropCertifications"), sample);
      }
    } finally {
      setSeeding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 rounded-3xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold font-headline text-primary flex items-center gap-3">
            <FlaskConical className="h-8 w-8" />
            Scientist Verification Portal
          </h2>
          <p className="text-muted-foreground mt-1">Review and certify agricultural solutions for safety and efficacy.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={seedSampleData} 
          disabled={seeding}
          className="rounded-full border-primary/20 text-primary hover:bg-primary/5"
        >
          {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          Seed Sample Cases
        </Button>
      </div>

      {!pendingCerts || pendingCerts.length === 0 ? (
        <Card className="border-dashed border-2 p-20 text-center bg-white/50 rounded-[40px]">
          <div className="bg-primary/5 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardCheck className="h-10 w-10 text-primary opacity-40" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">Verification Queue Empty</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-2">
            Excellent! All reported crop issues have been reviewed and certified by our network of experts.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingCerts.map((cert) => (
            <Card key={cert.id} className="border-none shadow-xl bg-white rounded-3xl overflow-hidden hover:translate-y-[-4px] transition-all group">
              <CardHeader className="bg-slate-50/50 border-b p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-white text-[10px] font-bold uppercase tracking-wider">
                      {cert.region}
                    </Badge>
                    <CardTitle className="text-xl font-bold text-slate-800">{cert.cropName}</CardTitle>
                  </div>
                  <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                    <AlertCircle className="h-6 w-6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-widest">
                    <Bug className="h-3 w-3" /> Major Pest
                  </div>
                  <p className="text-sm font-medium text-slate-600 bg-red-50 p-2 rounded-lg border border-red-100 italic">
                    {cert.majorPest}
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest">
                    <Leaf className="h-3 w-3" /> Traditional Remedy
                  </div>
                  <p className="text-sm font-medium text-slate-600 bg-primary/5 p-2 rounded-lg border border-primary/10 italic">
                    {cert.traditionalRemedy}
                  </p>
                </div>
              </CardContent>
              <CardFooter className="p-6 bg-slate-50/30 border-t">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 font-bold rounded-xl shadow-lg shadow-primary/20"
                  onClick={() => handleVerify(cert.id)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Verify & Certify
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


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
  Plus,
  ArrowRight
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useFirestore, useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, addDoc } from "firebase/firestore";
import { updateDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppState } from "@/lib/app-state";

export function ExpertVerificationPortal() {
  const { firestore } = useFirestore();
  const { role } = useAppState();
  const { user } = useUser();
  const [seeding, setSeeding] = useState(false);

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
      { cropName: "Kharif Wheat", majorPest: "Brown Rust", traditionalRemedy: "Neem Oil Spray (3%) mixed with soap water.", isCertified: false, region: "Punjab" },
      { cropName: "Basmati Rice", majorPest: "Stem Borer", traditionalRemedy: "Trichogramma Egg Parasitoids released at 5 points per acre.", isCertified: false, region: "Haryana" },
      { cropName: "Desi Cotton", majorPest: "Pink Bollworm", traditionalRemedy: "Pheromone Trapping using sticky traps every 10 meters.", isCertified: false, region: "Gujarat" },
    ];

    try {
      for (const sample of samples) {
        await addDoc(collection(firestore, "cropCertifications"), sample);
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
        <p className="text-muted-foreground max-w-sm">This portal is exclusively for verified agricultural scientists and experts.</p>
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
          <p className="text-muted-foreground font-medium mt-1 italic">Certifying traditional 'Desi Nuskhas' for regional efficacy.</p>
        </div>
        <Button 
          variant="outline" 
          onClick={seedSampleData} 
          disabled={seeding}
          className="rounded-full border-primary/20 text-primary hover:bg-primary/5 font-bold px-6"
        >
          {seeding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
          Import Pending Cases
        </Button>
      </div>

      {!pendingCerts || pendingCerts.length === 0 ? (
        <Card className="border-dashed border-2 p-24 text-center bg-muted/20 rounded-[3rem]">
          <div className="bg-primary/10 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <ClipboardCheck className="h-12 w-12 text-primary opacity-50" />
          </div>
          <h3 className="text-2xl font-black text-slate-800">Queue is Cleared</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mt-4 font-medium leading-relaxed">
            All submitted remedies have been processed. New cases will appear here upon submission from the cluster networks.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingCerts.map((cert) => (
            <Card key={cert.id} className="border-none shadow-xl bg-white rounded-[2.5rem] overflow-hidden hover:translate-y-[-8px] transition-all duration-300 group">
              <CardHeader className="bg-muted/30 border-b p-8">
                <div className="flex justify-between items-start mb-4">
                  <Badge variant="outline" className="bg-white border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-3">
                    {cert.region}
                  </Badge>
                  <div className="h-10 w-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-sm">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>
                <CardTitle className="text-2xl font-black text-slate-900">{cert.cropName}</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-destructive uppercase tracking-widest">
                    <Bug className="h-4 w-4" /> Targeted Pathogen
                  </div>
                  <p className="text-sm font-bold text-slate-700 bg-destructive/5 p-4 rounded-2xl border border-destructive/10">
                    {cert.majorPest}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest">
                    <Leaf className="h-4 w-4" /> Suggested Remedy
                  </div>
                  <p className="text-sm font-medium text-slate-600 bg-primary/5 p-4 rounded-2xl border border-primary/10 italic leading-relaxed">
                    "{cert.traditionalRemedy}"
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

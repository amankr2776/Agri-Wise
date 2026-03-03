
"use client";

import React, { useState } from "react";
import { Upload, Camera, Search, Loader2, CheckCircle2, ShieldCheck, Leaf, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { diagnoseCropPest, FarmerCropPestDiagnosisOutput } from "@/ai/flows/farmer-crop-pest-diagnosis";
import { TTSWrapper } from "@/components/voice/TTSWrapper";
import { useAppState } from "@/lib/app-state";

export function DiagnosticTool() {
  const [cropType, setCropType] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FarmerCropPestDiagnosisOutput | null>(null);
  const { role, verifiedRemedies, addVerifiedRemedy } = useAppState();

  const handleDiagnose = async () => {
    if (!cropType || (!symptoms && !photo)) return;
    setLoading(true);
    try {
      const res = await diagnoseCropPest({
        cropType,
        symptomsDescription: symptoms,
        photoDataUri: photo || undefined,
      });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const isVerified = (remedy: string) => verifiedRemedies.includes(remedy);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary font-headline">
            <Leaf className="h-6 w-6" />
            AI Crop Doctor
          </CardTitle>
          <CardDescription>
            Identify pests and diseases with AI. Get chemical and traditional remedies.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Crop Name</label>
              <Input
                placeholder="e.g. Tomato, Wheat, Paddy"
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Describe Symptoms</label>
              <Textarea
                placeholder="Yellow leaves, holes in stem..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold mb-2">Upload Photo (Optional)</label>
              <div className="relative border-2 border-dashed border-muted rounded-lg p-4 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handlePhotoUpload}
                />
                <div className="flex flex-col items-center">
                  <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Click or drag to upload photo</span>
                </div>
              </div>
            </div>
            {photo && (
              <div className="h-24 w-24 rounded-lg overflow-hidden border">
                <img src={photo} alt="Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <Button 
            className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90"
            disabled={loading}
            onClick={handleDiagnose}
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Search className="h-5 w-5 mr-2" />}
            Diagnose Problem
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-accent bg-white animate-in slide-in-from-bottom-2">
          <CardHeader className="bg-accent/10 border-b border-accent/20">
            <div className="flex justify-between items-start">
              <CardTitle className="text-primary font-headline flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                Diagnosis: {result.diagnosis}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-red-600">
                  <Bug className="h-4 w-4" />
                  Chemical Remedies
                </h4>
                <ul className="space-y-2">
                  {result.suggestedChemicalRemedies.map((rem, i) => (
                    <li key={i} className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-100">
                      <TTSWrapper text={rem}>
                        <span className="text-sm flex-1">{rem}</span>
                      </TTSWrapper>
                      {isVerified(rem) && <Badge className="bg-primary text-white text-[10px]">Verified</Badge>}
                      {role === "Expert" && !isVerified(rem) && (
                        <Button variant="ghost" size="sm" onClick={() => addVerifiedRemedy(rem)} className="h-6 text-[10px] text-primary">
                          <ShieldCheck className="h-3 w-3 mr-1" /> Certify
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold flex items-center gap-2 text-primary">
                  <Leaf className="h-4 w-4" />
                  Traditional 'Desi' Remedies
                </h4>
                <ul className="space-y-2">
                  {result.suggestedTraditionalRemedies.map((rem, i) => (
                    <li key={i} className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <TTSWrapper text={rem}>
                        <span className="text-sm flex-1">{rem}</span>
                      </TTSWrapper>
                      {isVerified(rem) && <Badge className="bg-primary text-white text-[10px]">Verified</Badge>}
                      {role === "Expert" && !isVerified(rem) && (
                        <Button variant="ghost" size="sm" onClick={() => addVerifiedRemedy(rem)} className="h-6 text-[10px] text-primary">
                          <ShieldCheck className="h-3 w-3 mr-1" /> Certify
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

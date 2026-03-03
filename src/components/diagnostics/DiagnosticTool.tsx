
"use client";

import React, { useState } from "react";
import { Camera, Search, Loader2, CheckCircle2, Leaf, Bug, FlaskConical, Droplets, ShieldCheck, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { diagnoseCropPest, FarmerCropPestDiagnosisOutput } from "@/ai/flows/farmer-crop-pest-diagnosis";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

export function DiagnosticTool() {
  const [cropType, setCropType] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [soilPh, setSoilPh] = useState(7);
  const [soilMoisture, setSoilMoisture] = useState(40);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<FarmerCropPestDiagnosisOutput | null>(null);

  const handleDiagnose = async () => {
    if (!cropType) return;
    setLoading(true);
    try {
      const res = await diagnoseCropPest({
        cropType,
        symptomsDescription: symptoms,
        photoDataUri: photo || undefined,
        soilPh,
        soilMoisture
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Leaf className="h-32 w-32 rotate-45" />
          </div>
          <CardHeader className="p-0 mb-8 relative z-10">
            <CardTitle className="text-2xl font-black flex items-center gap-3">
              <FlaskConical className="h-7 w-7 text-primary" />
              Advanced Soil & Pathogen Scan
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Multi-modal AI analysis for precision agriculture</CardDescription>
          </CardHeader>
          
          <CardContent className="p-0 space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Crop Species</label>
                  <Input
                    placeholder="e.g. Tomato, Wheat, Rice"
                    value={cropType}
                    onChange={(e) => setCropType(e.target.value)}
                    className="rounded-2xl h-12 bg-muted/30 border-none focus:ring-primary/20"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Symptom Log</label>
                  <Textarea
                    placeholder="Yellow spotting, wilting, leaf curl..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="rounded-2xl bg-muted/30 border-none min-h-[140px] focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Thermometer className="h-3 w-3" /> Soil pH Level
                    </label>
                    <Badge variant="outline" className="font-bold border-primary/20 text-primary">{soilPh}</Badge>
                  </div>
                  <Slider value={[soilPh]} onValueChange={(v) => setSoilPh(v[0])} min={0} max={14} step={0.1} />
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Droplets className="h-3 w-3" /> Moisture Saturation
                    </label>
                    <Badge variant="outline" className="font-bold border-blue-200 text-blue-600">{soilMoisture}%</Badge>
                  </div>
                  <Slider value={[soilMoisture]} onValueChange={(v) => setSoilMoisture(v[0])} min={0} max={100} step={1} />
                </div>

                <div className="relative group bg-muted/30 border-2 border-dashed border-border rounded-3xl p-6 text-center hover:bg-primary/5 transition-all cursor-pointer">
                  <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handlePhotoUpload} />
                  <div className="flex flex-col items-center">
                    {photo ? (
                      <img src={photo} alt="Preview" className="h-24 w-24 object-cover rounded-2xl shadow-md" />
                    ) : (
                      <>
                        <Camera className="h-10 w-10 text-muted-foreground/40 mb-2 group-hover:text-primary transition-colors" />
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Visual Analysis Photo</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="w-full h-14 text-lg font-black bg-primary hover:bg-primary/90 rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              disabled={loading}
              onClick={handleDiagnose}
            >
              {loading ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Search className="h-6 w-6 mr-2" />}
              Initiate Diagnostic Intelligence
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white animate-in slide-in-from-bottom-4">
            <CardHeader className="p-0 mb-8">
              <div className="flex justify-between items-start">
                <CardTitle className="text-2xl font-black flex items-center gap-3 text-primary">
                  <CheckCircle2 className="h-7 w-7" />
                  Diagnosis: {result.diagnosis}
                </CardTitle>
                <Badge className="bg-primary/10 text-primary border-none font-bold">AI Verified</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-destructive uppercase tracking-widest flex items-center gap-2">
                    <Bug className="h-4 w-4" /> Professional Neutralizers
                  </h4>
                  <ul className="space-y-3">
                    {result.suggestedChemicalRemedies.map((rem, i) => (
                      <li key={i} className="p-4 rounded-2xl bg-destructive/5 text-sm font-medium border border-destructive/10 text-destructive">
                        {rem}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
                    <Leaf className="h-4 w-4" /> Desi Nuskha (Traditional)
                  </h4>
                  <ul className="space-y-3">
                    {result.suggestedTraditionalRemedies.map((rem, i) => (
                      <li key={i} className="p-4 rounded-2xl bg-primary/5 text-sm font-medium border border-primary/10 italic text-primary">
                        {rem}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-8 rounded-3xl bg-amber-50 border border-amber-200">
                <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2 mb-6">
                  <FlaskConical className="h-4 w-4" /> Tailored Soil Remediation
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {result.fertilizerRecommendations.map((rec, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-amber-100">
                      <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                      <span className="text-sm font-bold text-amber-900">{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-[10px] font-black flex items-center gap-2 text-primary uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" /> Cluster Biosecurity
            </CardTitle>
          </CardHeader>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-muted-foreground uppercase">Pathogen Risk</span>
                <span className="text-primary">Minimal</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[12%] rounded-full" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-muted-foreground uppercase">Soil Optimized</span>
                <span className="text-amber-500">92%</span>
              </div>
              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 w-[92%] rounded-full" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-gradient-to-br from-primary to-primary/80 text-white">
          <div className="flex flex-col gap-4">
            <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Thermometer className="h-6 w-6" />
            </div>
            <div className="text-[10px] font-black text-white/60 uppercase tracking-widest">Environmental Intelligence</div>
            <p className="text-sm font-medium italic leading-relaxed text-white/90">
              "Ambient humidity is 62%. Risk of fungal spore activation is moderate. Recommended soil moisture cap: 55% for current crop cycle."
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}

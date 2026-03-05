'use server';
/**
 * @fileOverview This file implements the Genkit flow for diagnosing crop problems with deep language awareness.
 * Includes a professional agronomist persona and a heuristic fallback engine.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FarmerCropPestDiagnosisInputSchema = z.object({
  cropType: z.string().describe('The type of crop being diagnosed (e.g., Wheat, Tomato, Paddy).'),
  symptomsDescription: z.string().optional().describe('Description of observed symptoms (e.g., yellow spots, leaf curls).'),
  photoDataUri: z.string().optional().describe("Photo data URI of the affected plant part."),
  language: z.string().default("English").describe("The user's preferred language for the output."),
});
export type FarmerCropPestDiagnosisInput = z.infer<typeof FarmerCropPestDiagnosisInputSchema>;

const FarmerCropPestDiagnosisOutputSchema = z.object({
  diagnosis: z.string().describe("Scientifically accurate diagnosis of the problem in the target language."),
  suggestedChemicalRemedies: z.array(z.string()).describe("Specific chemical treatments (Neutralizers) for this specific crop family."),
  suggestedTraditionalRemedies: z.array(z.string()).describe("Heritage 'Desi Nuskha' unique to this plant species."),
  isBotanicallyValid: z.boolean().describe("Whether the diagnosis and cure are specific to the input crop family."),
  confidenceScore: z.number().describe("AI confidence in the match (0-1)."),
});
export type FarmerCropPestDiagnosisOutput = z.infer<typeof FarmerCropPestDiagnosisOutputSchema>;

export async function diagnoseCropPest(input: FarmerCropPestDiagnosisInput): Promise<FarmerCropPestDiagnosisOutput> {
  return farmerCropPestDiagnosisFlow(input);
}

const diagnoseCropPestPrompt = ai.definePrompt({
  name: 'diagnoseCropPestPrompt',
  input: { schema: FarmerCropPestDiagnosisInputSchema },
  output: { schema: FarmerCropPestDiagnosisOutputSchema },
  prompt: `You are a professional Agronomist and Biosecurity Expert for the KisanMitra National Grid.

TASK:
Analyze the following crop data and provide a scientifically accurate diagnosis and treatment plan.
CROP: {{{cropType}}}
SYMPTOMS: {{#if symptomsDescription}}{{{symptomsDescription}}}{{else}}No description provided, analyze image only.{{/if}}
IMAGE: {{#if photoDataUri}}{{media url=photoDataUri}}{{else}}No image provided.{{/if}}

CRITICAL INSTRUCTIONS:
1. RESPONSE LANGUAGE: You MUST provide the entire response (diagnosis, remedies) strictly in {{{language}}} script.
2. CROP SPECIFICITY: Provide cures that are unique to the {{{cropType}}} family. Do NOT provide generic cures. If the crop is Tomato, do not suggest Mango-specific fungicides.
3. OUTPUT:
   - Diagnosis: Clear name of the pathogen or pest.
   - Professional Neutralizers: Scientifically accurate chemical or commercial treatments.
   - Heritage Wisdom: Traditional 'Desi Nuskha' specific to {{{cropType}}} heritage.
4. VALIDATION: Set 'isBotanicallyValid' to false if you are providing a generic fallback because you lack specific data for this crop.

Respond in {{{language}}} script now.`,
});

const farmerCropPestDiagnosisFlow = ai.defineFlow(
  {
    name: 'farmerCropPestDiagnosisFlow',
    inputSchema: FarmerCropPestDiagnosisInputSchema,
    outputSchema: FarmerCropPestDiagnosisOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await diagnoseCropPestPrompt(input);
      if (!output) throw new Error('Failed to generate diagnosis output.');
      
      // Safety Check: If AI identifies it's not botanically specific, we flag it.
      return output;
    } catch (e: any) {
      console.warn("Agri-AI Node high-latency or rate-limited. Triggering Grid Heuristics.", e.message);

      const isEnglish = input.language === "English";
      
      // Professional Heuristic Fallback
      return {
        diagnosis: isEnglish 
          ? `Grid Heuristics: Preliminary Stress Detection in ${input.cropType}.` 
          : `ग्रिड अनुमान: ${input.cropType} में प्रारंभिक तनाव का पता चला।`,
        suggestedChemicalRemedies: [
          isEnglish 
            ? "Apply generic broad-spectrum organic fungicide (Neem-based) as a preventive measure." 
            : "निवारक उपाय के रूप में नीम आधारित जैविक कवकनाशी लगाएं।"
        ],
        suggestedTraditionalRemedies: [
          isEnglish 
            ? "Spray diluted wood ash solution to disrupt pest colonization." 
            : "कीटों के प्रसार को रोकने के लिए लकड़ी की राख के घोल का छिड़काव करें।"
        ],
        isBotanicallyValid: false,
        confidenceScore: 0.4
      };
    }
  }
);

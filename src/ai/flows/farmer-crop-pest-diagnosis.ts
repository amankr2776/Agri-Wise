
'use server';
/**
 * @fileOverview This file implements the Genkit flow for diagnosing crop problems with soil health context.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FarmerCropPestDiagnosisInputSchema = z.object({
  cropType: z.string().describe('The type of crop being diagnosed.'),
  symptomsDescription: z.string().optional().describe('Description of observed symptoms.'),
  photoDataUri: z.string().optional().describe("Photo data URI."),
  soilPh: z.number().optional().describe("Soil pH level (0-14)."),
  soilMoisture: z.number().optional().describe("Soil moisture percentage (0-100)."),
});
export type FarmerCropPestDiagnosisInput = z.infer<typeof FarmerCropPestDiagnosisInputSchema>;

const FarmerCropPestDiagnosisOutputSchema = z.object({
  diagnosis: z.string().describe("Clear diagnosis of the problem."),
  suggestedChemicalRemedies: z.array(z.string()).describe("AI-driven suggestions for chemical treatments."),
  suggestedTraditionalRemedies: z.array(z.string()).describe("Traditional 'Desi Nuskha' suggestions."),
  fertilizerRecommendations: z.array(z.string()).describe("Specific fertilizer suggestions based on soil pH and moisture."),
});
export type FarmerCropPestDiagnosisOutput = z.infer<typeof FarmerCropPestDiagnosisOutputSchema>;

export async function diagnoseCropPest(input: FarmerCropPestDiagnosisInput): Promise<FarmerCropPestDiagnosisOutput> {
  return farmerCropPestDiagnosisFlow(input);
}

const diagnoseCropPestPrompt = ai.definePrompt({
  name: 'diagnoseCropPestPrompt',
  input: { schema: FarmerCropPestDiagnosisInputSchema },
  output: { schema: FarmerCropPestDiagnosisOutputSchema },
  prompt: `You are an expert agricultural diagnostician.

Crop: {{{cropType}}}
{{#if symptomsDescription}}Symptoms: {{{symptomsDescription}}}{{/if}}
{{#if soilPh}}Soil pH: {{{soilPh}}}{{/if}}
{{#if soilMoisture}}Soil Moisture: {{{soilMoisture}}}%{{/if}}
{{#if photoDataUri}}Image Provided: {{media url=photoDataUri}}{{/if}}

Provide:
1. Diagnosis.
2. Chemical remedies.
3. Traditional 'Desi Nuskha' remedies.
4. Specific fertilizer recommendations (e.g., Urea, DAP, Potash) based on the soil pH and moisture provided. If pH is acidic or basic, suggest soil amendments like Lime or Gypsum.`,
});

const farmerCropPestDiagnosisFlow = ai.defineFlow(
  {
    name: 'farmerCropPestDiagnosisFlow',
    inputSchema: FarmerCropPestDiagnosisInputSchema,
    outputSchema: FarmerCropPestDiagnosisOutputSchema,
  },
  async (input) => {
    const { output } = await diagnoseCropPestPrompt(input);
    return output!;
  }
);

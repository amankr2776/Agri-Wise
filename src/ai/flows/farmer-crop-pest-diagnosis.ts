
'use server';
/**
 * @fileOverview This file implements the Genkit flow for diagnosing crop problems with deep language awareness.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FarmerCropPestDiagnosisInputSchema = z.object({
  cropType: z.string().describe('The type of crop being diagnosed.'),
  symptomsDescription: z.string().optional().describe('Description of observed symptoms.'),
  photoDataUri: z.string().optional().describe("Photo data URI."),
  language: z.string().default("English").describe("The user's preferred language for the output."),
});
export type FarmerCropPestDiagnosisInput = z.infer<typeof FarmerCropPestDiagnosisInputSchema>;

const FarmerCropPestDiagnosisOutputSchema = z.object({
  diagnosis: z.string().describe("Clear diagnosis of the problem in the target language."),
  suggestedChemicalRemedies: z.array(z.string()).describe("AI-driven suggestions for chemical treatments in target language."),
  suggestedTraditionalRemedies: z.array(z.string()).describe("Traditional 'Desi Nuskha' suggestions in target language."),
  fertilizerRecommendations: z.array(z.string()).describe("Specific fertilizer suggestions in target language."),
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
THE USER HAS SELECTED THE LANGUAGE: {{{language}}}.
CRITICAL: YOU MUST PROVIDE THE ENTIRE RESPONSE (DIAGNOSIS, REMEDIES, FERTILIZERS) STRICTLY IN {{{language}}} SCRIPT AND TERMINOLOGY.

For chemical names, use the common names used in regional markets of India. 
For traditional remedies (Desi Nuskhas), provide heritage wisdom appropriate for the culture of the {{{language}}} speaking region.

Input Data:
Crop: {{{cropType}}}
{{#if symptomsDescription}}Symptoms: {{{symptomsDescription}}}{{/if}}
{{#if photoDataUri}}Image Provided: {{media url=photoDataUri}}{{/if}}

Provide detailed analysis in {{{language}}} script.`,
});

const farmerCropPestDiagnosisFlow = ai.defineFlow(
  {
    name: 'farmerCropPestDiagnosisFlow',
    inputSchema: FarmerCropPestDiagnosisInputSchema,
    outputSchema: FarmerCropPestDiagnosisOutputSchema,
  },
  async (input) => {
    const { output } = await diagnoseCropPestPrompt(input);
    if (!output) throw new Error('Failed to generate diagnosis output.');
    return output;
  }
);

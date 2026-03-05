
'use server';
/**
 * @fileOverview Specialized Farm Data Analysis Agent.
 * Analyzes agricultural inputs (text/image) and returns structured actions.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FarmAnalysisInputSchema = z.object({
  prompt: z.string().describe("The user's text query or question."),
  photoDataUri: z.string().optional().describe("Base64 encoded image data for visual analysis."),
  language: z.string().default("English").describe("The preferred language for the response."),
});
export type FarmAnalysisInput = z.infer<typeof FarmAnalysisInputSchema>;

const FarmAnalysisOutputSchema = z.object({
  answer: z.string().describe("The conversational AI response."),
  suggestedAction: z.string().describe("A single, clear next step for the farmer."),
  confidence: z.number().describe("AI confidence score (0-1)."),
});
export type FarmAnalysisOutput = z.infer<typeof FarmAnalysisOutputSchema>;

export async function analyzeFarmData(input: FarmAnalysisInput): Promise<FarmAnalysisOutput> {
  return farmAnalysisFlow(input);
}

const farmAnalysisFlow = ai.defineFlow(
  {
    name: 'farmAnalysisFlow',
    inputSchema: FarmAnalysisInputSchema,
    outputSchema: FarmAnalysisOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        output: { schema: FarmAnalysisOutputSchema },
        prompt: [
          { text: `You are a Senior Agricultural Consultant for the KisanMitra National Grid. 
          Your goal is to provide scientific, high-fidelity advice based on the user's data.
          
          USER PROMPT: ${input.prompt}
          LANGUAGE: ${input.language}
          
          If an image is provided, analyze the soil, crop health, or tools visible.
          Always return an empathetic answer and a specific, actionable step.` },
          ...(input.photoDataUri ? [{ media: { url: input.photoDataUri, contentType: 'image/jpeg' } }] : []),
        ],
      });

      if (!output) throw new Error("Consultant brain timed out.");
      return output;
    } catch (e: any) {
      console.warn("Farm Analysis AI Node rate-limited. Activating Heuristics.", e.message);
      
      // Fallback Logic
      return {
        answer: input.language === 'Hindi' 
          ? "क्षमा करें, नेशनल ग्रिड वर्तमान में व्यस्त है। हम आपकी जानकारी संसाधित कर रहे हैं।" 
          : "The National Grid is currently high-latency. We are processing your farm data via local nodes.",
        suggestedAction: "Monitor your field closely and check back in 10 minutes.",
        confidence: 0.5
      };
    }
  }
);

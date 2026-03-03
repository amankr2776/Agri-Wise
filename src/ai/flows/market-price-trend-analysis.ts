'use server';
/**
 * @fileOverview A flow for analyzing crop market prices and predicting trends.
 *
 * - marketPriceTrendAnalysis - A function that handles the market price trend analysis process.
 * - MarketPriceTrendAnalysisInput - The input type for the marketPriceTrendAnalysis function.
 * - MarketPriceTrendAnalysisOutput - The return type for the marketPriceTrendAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// Input Schema
const MarketPriceTrendAnalysisInputSchema = z.object({
  cropType: z.string().describe('The type of crop to analyze (e.g., "Wheat", "Rice").'),
  state: z.string().describe('The state where the market price data was collected.'),
  marketPriceData: z.array(
    z.object({
      date: z.string().describe('The date of the price data (e.g., "2023-01-01").'),
      price: z.number().describe('The market price for the crop on the given date.'),
    })
  ).describe('Historical market price data for the specified crop and state, ordered chronologically.'),
});
export type MarketPriceTrendAnalysisInput = z.infer<typeof MarketPriceTrendAnalysisInputSchema>;

// Output Schema
const MarketPriceTrendAnalysisOutputSchema = z.object({
  cropType: z.string().describe('The type of crop analyzed.'),
  state: z.string().describe('The state for which the analysis was performed.'),
  predictedTrend: z.enum(['Rising', 'Stable', 'Falling']).describe('The predicted price trend: "Rising", "Stable", or "Falling".'),
  reasoning: z.string().describe('A detailed explanation for the predicted trend based on the provided data.'),
});
export type MarketPriceTrendAnalysisOutput = z.infer<typeof MarketPriceTrendAnalysisOutputSchema>;

// Wrapper function to call the flow
export async function marketPriceTrendAnalysis(
  input: MarketPriceTrendAnalysisInput
): Promise<MarketPriceTrendAnalysisOutput> {
  return marketPriceTrendAnalysisFlow(input);
}

// Define the prompt
const prompt = ai.definePrompt({
  name: 'marketPriceTrendAnalysisPrompt',
  input: { schema: MarketPriceTrendAnalysisInputSchema },
  output: { schema: MarketPriceTrendAnalysisOutputSchema },
  prompt: `You are an expert agricultural market analyst. Your task is to analyze historical crop price data and predict the future trend (Rising, Stable, or Falling) for a specific crop in a given state.

Analyze the following market price data for {{{cropType}}} in the state of {{{state}}}:

Market Price Data:
{{#each marketPriceData}}
  - Date: {{{this.date}}}, Price: {{{this.price}}}
{{/each}}

Based on this data, determine if the price trend is "Rising", "Stable", or "Falling". Provide a clear and concise reasoning for your prediction, considering patterns, fluctuations, and overall trajectory. Your reasoning should be based solely on the provided historical data and generally accepted market analysis principles.`,
});

// Define the flow
const marketPriceTrendAnalysisFlow = ai.defineFlow(
  {
    name: 'marketPriceTrendAnalysisFlow',
    inputSchema: MarketPriceTrendAnalysisInputSchema,
    outputSchema: MarketPriceTrendAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) {
      throw new Error('No output received from the prompt.');
    }
    return output;
  }
);

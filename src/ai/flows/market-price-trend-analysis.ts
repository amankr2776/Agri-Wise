
'use server';
/**
 * @fileOverview A flow for analyzing crop market prices, predicting trends, and advising Sell vs Hold.
 *
 * - marketPriceTrendAnalysis - A function that handles the market price trend analysis process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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

const MarketPriceTrendAnalysisOutputSchema = z.object({
  cropType: z.string().describe('The type of crop analyzed.'),
  state: z.string().describe('The state for which the analysis was performed.'),
  predictedTrend: z.enum(['Rising', 'Stable', 'Falling']).describe('The predicted price trend.'),
  recommendedAction: z.enum(['Sell', 'Hold', 'Wait']).describe('Strategic advice: Sell now to lock in profit, Hold for higher prices, or Wait for stability.'),
  reasoning: z.string().describe('Detailed explanation based on data.'),
});
export type MarketPriceTrendAnalysisOutput = z.infer<typeof MarketPriceTrendAnalysisOutputSchema>;

export async function marketPriceTrendAnalysis(
  input: MarketPriceTrendAnalysisInput
): Promise<MarketPriceTrendAnalysisOutput> {
  return marketPriceTrendAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketPriceTrendAnalysisPrompt',
  input: { schema: MarketPriceTrendAnalysisInputSchema },
  output: { schema: MarketPriceTrendAnalysisOutputSchema },
  prompt: `You are an expert agricultural market analyst. Your task is to analyze historical crop price data and predict the future trend.

Analyze the following market price data for {{{cropType}}} in the state of {{{state}}}:

Market Price Data:
{{#each marketPriceData}}
  - Date: {{{this.date}}}, Price: {{{this.price}}}
{{/each}}

Based on this data, determine:
1. The predicted trend: "Rising", "Stable", or "Falling".
2. The recommended strategic action: 
   - "Sell": If prices are at a peak or falling significantly.
   - "Hold": If prices are rising or expected to spike.
   - "Wait": If the market is too volatile or stable.

Provide detailed reasoning for your prediction and action.`,
});

const marketPriceTrendAnalysisFlow = ai.defineFlow(
  {
    name: 'marketPriceTrendAnalysisFlow',
    inputSchema: MarketPriceTrendAnalysisInputSchema,
    outputSchema: MarketPriceTrendAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('No output received from the prompt.');
    return output;
  }
);

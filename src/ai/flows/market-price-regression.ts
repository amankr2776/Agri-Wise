
'use server';
/**
 * @fileOverview A regression flow for predicting current crop prices when government data is missing.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MarketPriceRegressionInputSchema = z.object({
  cropName: z.string().describe('The name of the crop (e.g., Wheat, Safflower).'),
  historicalPrices: z.array(z.number()).describe('A list of historical prices from the last 90 days.'),
  currentMonth: z.string().describe('The current month name.'),
});
export type MarketPriceRegressionInput = z.infer<typeof MarketPriceRegressionInputSchema>;

const MarketPriceRegressionOutputSchema = z.object({
  predictedValue: z.number().describe('The AI-predicted current estimated value.'),
  confidence: z.number().describe('Confidence level of the prediction (0-1).'),
  reasoning: z.string().describe('Explanation of the prediction based on seasonal cycles.'),
});
export type MarketPriceRegressionOutput = z.infer<typeof MarketPriceRegressionOutputSchema>;

export async function predictMarketPrice(input: MarketPriceRegressionInput): Promise<MarketPriceRegressionOutput> {
  return marketPriceRegressionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'marketPriceRegressionPrompt',
  input: { schema: MarketPriceRegressionInputSchema },
  output: { schema: MarketPriceRegressionOutputSchema },
  prompt: `You are an expert agricultural economist and regression engine for the KisanMitra National Grid.
Government data for {{{cropName}}} is currently delayed for the month of {{{currentMonth}}}.

Your task is to predict the "Current Estimated Value" by performing a regression analysis on these historical price points:
{{{historicalPrices}}}

Consider:
1. Seasonal patterns for {{{cropName}}} in India during {{{currentMonth}}}.
2. Typical volatility trends observed in previous years.
3. Recent trajectory of the provided data points.

Provide a conservative estimate, a confidence score, and a brief professional reasoning.`,
});

const marketPriceRegressionFlow = ai.defineFlow(
  {
    name: 'marketPriceRegressionFlow',
    inputSchema: MarketPriceRegressionInputSchema,
    outputSchema: MarketPriceRegressionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    if (!output) throw new Error('Failed to generate regression output.');
    return output;
  }
);


'use server';
/**
 * @fileOverview AI Support Agent for Logistics and Mandi-Link disputes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const LogisticsSupportInputSchema = z.object({
  query: z.string().describe("The farmer's question or issue description."),
  shipmentStatus: z.string().describe("Current status of the shipment (e.g., In Transit, Reached Destination)."),
  shipmentDetails: z.string().describe("Details like crop type, agency, and destination."),
  language: z.string().describe("Preferred language for the response."),
});
export type LogisticsSupportInput = z.infer<typeof LogisticsSupportInputSchema>;

const LogisticsSupportOutputSchema = z.object({
  text: z.string().describe("The AI response in the target language."),
  actionRecommended: z.enum(['Resolve', 'Escalate', 'Wait']).describe("Recommended next step for the system."),
});
export type LogisticsSupportOutput = z.infer<typeof LogisticsSupportOutputSchema>;

export async function getLogisticsSupport(input: LogisticsSupportInput): Promise<LogisticsSupportOutput> {
  return logisticsSupportFlow(input);
}

const logisticsSupportFlow = ai.defineFlow(
  {
    name: 'logisticsSupportFlow',
    inputSchema: LogisticsSupportInputSchema,
    outputSchema: LogisticsSupportOutputSchema,
  },
  async (input) => {
    const { output } = await ai.generate({
      prompt: `You are the KisanMitra Logistics Support Agent.
CRITICAL: Respond ONLY in ${input.language} script.

Context:
- Shipment Status: ${input.shipmentStatus}
- Details: ${input.shipmentDetails}
- User Query: ${input.query}

Goal:
1. If the status is 'Reached Destination', explain how to complete the final handover and verify the payload.
2. If there is a dispute about pricing or damage, offer to 'Escalate' to a human logistics manager.
3. Provide helpful, empathetic advice in ${input.language}.

Return a JSON object matching the required schema.`,
      model: 'googleai/gemini-2.5-flash',
      output: { schema: LogisticsSupportOutputSchema }
    });

    if (!output) throw new Error('Support agent failed to respond.');
    return output;
  }
);

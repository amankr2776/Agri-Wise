'use server';
/**
 * @fileOverview A conversational AI voice assistant for farmers.
 *
 * - voiceAssistantGuidance - A function that handles the voice assistant's response generation.
 * - VoiceAssistantGuidanceInput - The input type for the voiceAssistantGuidance function.
 * - VoiceAssistantGuidanceOutput - The return type for the voiceAssistantGuidance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const VoiceAssistantGuidanceInputSchema = z.object({
  query: z.string().describe("The farmer's spoken question in their preferred language."),
  language: z.string().describe("The preferred language of the farmer."),
});
export type VoiceAssistantGuidanceInput = z.infer<typeof VoiceAssistantGuidanceInputSchema>;

const VoiceAssistantGuidanceOutputSchema = z.object({
  text: z.string().describe("The text version of the AI response."),
  audioDataUri: z
    .string()
    .describe(
      "The audio response from the AI assistant as a data URI that must include a MIME type (audio/wav) and use Base64 encoding. Expected format: 'data:audio/wav;base64,<encoded_audio_data>'"
    ),
});
export type VoiceAssistantGuidanceOutput = z.infer<typeof VoiceAssistantGuidanceOutputSchema>;

export async function voiceAssistantGuidance(
  input: VoiceAssistantGuidanceInput
): Promise<VoiceAssistantGuidanceOutput> {
  return voiceAssistantGuidanceFlow(input);
}

const voiceAssistantGuidanceFlow = ai.defineFlow(
  {
    name: 'voiceAssistantGuidanceFlow',
    inputSchema: VoiceAssistantGuidanceInputSchema,
    outputSchema: VoiceAssistantGuidanceOutputSchema,
  },
  async input => {
    // First, generate a text response from the LLM in the target language
    const {text: textResponse} = await ai.generate({
      prompt: `You are an expert agricultural AI assistant. 
The farmer is asking a question in ${input.language}. 
PLEASE RESPOND ENTIRELY IN ${input.language}. 

Farmer's Question: ${input.query}

Provide a concise, helpful, and friendly answer suitable for verbal delivery.`,
      model: 'googleai/gemini-2.5-flash',
    });

    if (!textResponse) {
      throw new Error('No text response generated.');
    }

    // Second, convert the text response to speech using TTS
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: textResponse,
    });

    if (!media) {
      throw new Error('No audio media returned.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavAudioBase64 = await toWav(audioBuffer);

    return {
      text: textResponse,
      audioDataUri: 'data:audio/wav;base64,' + wavAudioBase64,
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

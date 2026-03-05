'use server';
/**
 * @fileOverview A universal multimodal AI assistant for farmers with regional language support.
 * Handles text and image inputs, providing text and audio responses.
 * Includes a heuristic fallback engine to handle AI rate-limiting (429 errors).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const VoiceAssistantGuidanceInputSchema = z.object({
  query: z.string().describe("The user's question or prompt."),
  language: z.string().describe("The preferred language of the user."),
  photoDataUri: z.string().optional().describe("Optional image data URI for multimodal analysis."),
});
export type VoiceAssistantGuidanceInput = z.infer<typeof VoiceAssistantGuidanceInputSchema>;

const VoiceAssistantGuidanceOutputSchema = z.object({
  text: z.string().describe("The text version of the AI response in the target language."),
  audioDataUri: z
    .string()
    .optional()
    .describe(
      "The audio response from the AI assistant as a data URI that must include a MIME type (audio/wav) and use Base64 encoding."
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
    let textResponse = "";
    
    try {
      // Generate a response in the target language using multimodal Gemini 2.5 Flash
      const {text} = await ai.generate({
        model: 'googleai/gemini-2.5-flash',
        prompt: [
          { text: `You are KisanMitra, a friendly and helpful AI assistant for the Indian National Agricultural Grid. 
          You can answer questions about farming, logistics, crop health, or any general topics the user asks about.
          If an image is provided, analyze it thoroughly and provide context in your response.
          
          USER REQUEST: ${input.query}
          LANGUAGE: ${input.language}
          
          CRITICAL: YOU MUST RESPOND ENTIRELY IN THE ${input.language} SCRIPT. Provide a helpful, empathetic, and clear answer.` },
          ...(input.photoDataUri ? [{ media: { url: input.photoDataUri, contentType: 'image/jpeg' } }] : []),
        ],
      });
      textResponse = text || "I am processing your request.";
    } catch (e: any) {
      console.warn("Kisan Assistant AI Node rate-limited. Activating Heuristics.", e.message);
      
      // --- Heuristic Response Fallback ---
      const q = input.query.toLowerCase();
      if (q.includes('hello') || q.includes('namaste') || q.includes('hi')) {
        textResponse = input.language === 'Hindi' ? "नमस्ते! मैं किसानमित्र हूँ। मैं आपकी सहायता के लिए तैयार हूँ।" : "Namaste! I am KisanMitra. I am ready to help you with your agricultural needs.";
      } else if (q.includes('crop') || q.includes('plant') || q.includes('khet')) {
        textResponse = input.language === 'Hindi' ? "ग्रिड वर्तमान में आपके फसल डेटा का विश्लेषण कर रहा है। कृपया फसल के प्रकार और लक्षणों का विवरण दें।" : "The grid is currently analyzing your crop data. Please provide specific details about the crop type and symptoms.";
      } else if (q.includes('price') || q.includes('mandi') || q.includes('bhav')) {
        textResponse = input.language === 'Hindi' ? "मंडी भावों की जानकारी 'Market Intelligence' अनुभाग में उपलब्ध है। कृपया वहां देखें।" : "Mandi price information is available in the 'Market Intelligence' section. Please check there for live updates.";
      } else {
        textResponse = input.language === 'Hindi' ? "क्षमा करें, वर्तमान में नेशनल ग्रिड पर लोड अधिक है। मैं आपकी क्वेरी को प्रोसेस करने का प्रयास कर रहा हूँ।" : "I apologize, the National Grid is currently experiencing high load. I am attempting to process your query using fallback heuristics.";
      }
      
      if (input.photoDataUri) {
        textResponse += input.language === 'Hindi' ? " (चित्र प्राप्त हुआ, विश्लेषण लंबित है)" : " (Image received, detailed analysis pending)";
      }
    }

    try {
      // Convert to speech using the TTS model
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
        return { text: textResponse };
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
    } catch (e: any) {
      console.warn("TTS Node rate-limited. Returning text-only.", e.message);
      return { text: textResponse };
    }
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

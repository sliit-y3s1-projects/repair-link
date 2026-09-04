import { ApiError } from '../../shared/api-response';
import { aiRepairAssessmentSchema, type AiRepairRequest } from './ai-repair.schema';
import { repairAssistantPrompt, repairAssessmentJsonSchema } from './ai-repair.prompt';
import { technicianMatchService } from './technician-match.service';
import type { AiRepairResponse } from './ai-repair.types';

type GeminiResponse = {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
};

const geminiEndpoint = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

export const aiRepairService = {
  async answer(input: AiRepairRequest): Promise<AiRepairResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ApiError(503, 'AI repair assistant is not configured');
    }

    const model = process.env.GEMINI_MODEL ?? 'gemini-3.6-flash';
    let response: globalThis.Response;

    try {
      response = await fetch(geminiEndpoint(model), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: repairAssistantPrompt }] },
          contents: [{ role: 'user', parts: [{ text: input.question }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseJsonSchema: repairAssessmentJsonSchema,
            temperature: 0.3,
          },
        }),
        signal: AbortSignal.timeout(60_000),
      });
    } catch (error) {
      console.error('Gemini request failed', error);
      throw new ApiError(502, 'AI service is temporarily unavailable');
    }

    const payload = (await response.json()) as GeminiResponse;
    if (!response.ok) {
      console.error('Gemini API error', response.status, payload.error?.message);
      throw new ApiError(502, 'AI service could not process the request');
    }

    const text = payload.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim();

    if (!text) {
      throw new ApiError(502, 'AI service returned an empty response');
    }

    try {
      const assessment = aiRepairAssessmentSchema.parse(JSON.parse(text));
      return {
        assessment,
        matchedTechnicians: technicianMatchService.findMatches(assessment),
      };
    } catch (error) {
      console.error('Invalid structured Gemini response', error);
      throw new ApiError(502, 'AI service returned an invalid response');
    }
  },
};

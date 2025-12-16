import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type GeneratedQuestion = {
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
};

@Injectable()
export class AiService {
  private apiKey: string;
  private model: string;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('GEMINI_API_KEY');
    this.model = this.config.get<string>('GEMINI_MODEL') || 'gemini-2.0-flash';
  }

  async generateQuiz(topic: string, count: number): Promise<GeneratedQuestion[]> {
    if (!this.apiKey) {
      throw new InternalServerErrorException('GEMINI_API_KEY not configured');
    }

    const prompt = `Generate ${count} multiple-choice questions (MCQ) on the topic "${topic}".
Each question must strictly follow JSON format with fields: text (string), options (array of 4 distinct strings), correctOptionIndex (integer 0-3), explanation (optional string).
Return JSON array only, no extra text.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const body = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new InternalServerErrorException(`Gemini API error: ${res.status} ${errText}`);
    }

    const data = await res.json();
    // Extract text from candidates
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || data?.candidates?.[0]?.output_text || '';
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      // Attempt to extract JSON array from the text using simple regex
      const match = text.match(/\[([\s\S]*)\]/);
      if (!match) throw new InternalServerErrorException('Failed to parse Gemini response as JSON array');
      try {
        parsed = JSON.parse(match[0]);
      } catch {
        throw new InternalServerErrorException('Invalid JSON structure from Gemini');
      }
    }

    if (!Array.isArray(parsed)) {
      throw new InternalServerErrorException('Gemini did not return an array');
    }

    // Normalize and validate basic shape
    const questions: GeneratedQuestion[] = parsed.slice(0, count).map((q: any) => ({
      text: String(q.text || ''),
      options: Array.isArray(q.options) ? q.options.map((o: any) => String(o)).slice(0, 4) : [],
      correctOptionIndex: Number.isInteger(q.correctOptionIndex) ? q.correctOptionIndex : 0,
      explanation: q.explanation ? String(q.explanation) : undefined,
    }));

    // Ensure each question has 4 options and valid index
    for (const q of questions) {
      if (q.options.length !== 4) {
        throw new InternalServerErrorException('Generated question options must be exactly 4');
      }
      if (q.correctOptionIndex < 0 || q.correctOptionIndex >= q.options.length) {
        throw new InternalServerErrorException('Generated question has invalid correctOptionIndex');
      }
    }

    return questions;
  }
}

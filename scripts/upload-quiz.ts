import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

type QuizQuestion = {
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
};

type QuizPayload = {
  title: string;
  topic: string;
  type: 'pyq' | 'mocktest';
  description?: string;
  isPublished?: boolean;
  questions: QuizQuestion[];
};

function getArgValue(flag: string) {
  const index = process.argv.indexOf(flag);
  if (index === -1) {
    return undefined;
  }

  return process.argv[index + 1];
}

async function login(baseUrl: string, email: string, password: string) {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error(`Login failed with ${response.status}: ${await response.text()}`);
  }

  const data = (await response.json()) as { accessToken?: string };
  if (!data.accessToken) {
    throw new Error('Login response did not include accessToken');
  }

  return data.accessToken;
}

function validatePayload(payload: QuizPayload) {
  if (!payload.title || !payload.topic || !payload.type) {
    throw new Error('Payload must include title, topic, and type');
  }

  if (!Array.isArray(payload.questions) || payload.questions.length === 0) {
    throw new Error('Payload must include at least one question');
  }

  for (const [index, question] of payload.questions.entries()) {
    if (!question.text) {
      throw new Error(`Question ${index + 1} is missing text`);
    }
    if (!Array.isArray(question.options) || question.options.length < 2 || question.options.length > 8) {
      throw new Error(`Question ${index + 1} must have between 2 and 8 options`);
    }
    if (!Number.isInteger(question.correctOptionIndex) || question.correctOptionIndex < 0 || question.correctOptionIndex >= question.options.length) {
      throw new Error(`Question ${index + 1} has an invalid correctOptionIndex`);
    }
  }
}

async function main() {
  const baseUrl = process.env.QUIZ_API_BASE_URL ?? 'https://api.legalpadhai.ai/api';
  const filePath = resolve(process.cwd(), getArgValue('--file') ?? 'scripts/data/sample-dron-quiz.json');
  const tokenFromEnv = process.env.QUIZ_ADMIN_TOKEN;
  const email = process.env.QUIZ_ADMIN_EMAIL;
  const password = process.env.QUIZ_ADMIN_PASSWORD;

  const raw = await readFile(filePath, 'utf8');
  const payload = JSON.parse(raw) as QuizPayload;
  validatePayload(payload);

  const token = tokenFromEnv ?? (email && password ? await login(baseUrl, email, password) : undefined);
  if (!token) {
    throw new Error('Provide QUIZ_ADMIN_TOKEN or QUIZ_ADMIN_EMAIL and QUIZ_ADMIN_PASSWORD');
  }

  const response = await fetch(`${baseUrl}/admin/quizzes`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const bodyText = await response.text();
  if (!response.ok) {
    throw new Error(`Quiz upload failed with ${response.status}: ${bodyText}`);
  }

  console.log(bodyText);
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
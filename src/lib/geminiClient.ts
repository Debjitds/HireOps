// Gemini API client - calls Supabase Edge Functions
// All AI calls go through Edge Functions to keep API keys server-side

import { supabase } from '@/lib/supabaseClient';

interface QuestionContext {
  role: string;
  topic: string;
  difficulty: string;
  persona: string;
  personaTone: string;
  language: string;
  questionNumber: number;
  questionType: string;
  previousScores?: number[];
  weakArea?: string;
  strongArea?: string;
  companyName?: string;
  jobTitle?: string;
  customInstructions?: string;
}

interface EvaluationResult {
  clarity_score: number;
  structure_score: number;
  technical_depth_score: number;
  relevance_score: number;
  confidence_score: number;
  overall_score: number;
  strengths: string;
  weaknesses: string;
  feedback_text: string;
  next_action: string;
}

interface FinalSummary {
  overall_score: number;
  strengths: string;
  weaknesses: string;
  improvement_roadmap: string;
  confidence_summary: string;
  voice_summary_text: string;
}

// Direct Gemini API call (MVP approach - can be migrated to Edge Functions later)
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function callGemini(prompt: string): Promise<string> {
  // Try Edge Function first
  try {
    const { data, error } = await supabase.functions.invoke('gemini-proxy', {
      body: { prompt },
    });
    if (!error && data?.text) return data.text;
  } catch {
    // Fall through to direct call
  }

  // Direct API call as fallback
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const result = await response.json();
  return result.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

export async function generateQuestion(context: QuestionContext): Promise<string> {
  const prompt = `SYSTEM:
You are a professional interviewer conducting a ${context.difficulty} difficulty interview.

RULES:
- Ask only one question
- Stay within the topic: ${context.topic}
- Respect difficulty level: ${context.difficulty}
- Do not provide answers
- Match interviewer persona tone: ${context.personaTone}
- Use language: ${context.language}
${context.companyName ? `- Tailor for company: ${context.companyName}` : ''}
${context.jobTitle ? `- For position: ${context.jobTitle}` : ''}
${context.customInstructions ? `- Additional instructions: ${context.customInstructions}` : ''}

INPUT:
Role: ${context.role}
Topic: ${context.topic}
Difficulty: ${context.difficulty}
Persona: ${context.persona}
Language: ${context.language}
Question number: ${context.questionNumber} of 5
Question type: ${context.questionType}
${context.weakArea ? `Candidate weak area: ${context.weakArea}` : ''}
${context.strongArea ? `Candidate strong area: ${context.strongArea}` : ''}

OUTPUT:
Return a JSON object with exactly this structure:
{"question": "your interview question here"}

Return only the interview question as a JSON object. Do not include any other text.`;

  try {
    const response = await callGemini(prompt);
    const parsed = JSON.parse(response);
    return parsed.question || response;
  } catch {
    // Retry once
    try {
      const response = await callGemini(prompt);
      const parsed = JSON.parse(response);
      return parsed.question || response;
    } catch {
      // Fallback generic question
      return getBackupQuestion(context.questionType, context.topic);
    }
  }
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  difficulty: string,
  language: string
): Promise<EvaluationResult> {
  const prompt = `SYSTEM:
You are evaluating an interview answer.

RULES:
- Score fairly on a scale of 0-10
- Be consistent
- Return structured JSON output
- Use language: ${language} for feedback text

INPUT:
Question: ${question}
Answer: ${answer}
Difficulty: ${difficulty}

OUTPUT:
Return a JSON object with exactly this structure:
{
  "clarity_score": <number 0-10>,
  "structure_score": <number 0-10>,
  "technical_depth_score": <number 0-10>,
  "relevance_score": <number 0-10>,
  "confidence_score": <number 0-10>,
  "overall_score": <number 0-10>,
  "strengths": "<text>",
  "weaknesses": "<text>",
  "feedback_text": "<text>",
  "next_action": "<deeper|clarify|simpler>"
}

Score bands: 0-3 Weak, 4-6 Average, 7-8 Good, 9-10 Strong
overall_score should be the average of all dimension scores.
Return only the JSON object. No other text.`;

  try {
    const response = await callGemini(prompt);
    return JSON.parse(response);
  } catch {
    try {
      const response = await callGemini(prompt);
      return JSON.parse(response);
    } catch {
      return {
        clarity_score: 5,
        structure_score: 5,
        technical_depth_score: 5,
        relevance_score: 5,
        confidence_score: 5,
        overall_score: 5,
        strengths: 'Unable to evaluate - please try again.',
        weaknesses: 'Evaluation failed.',
        feedback_text: 'We encountered an issue evaluating your answer. Your response has been recorded.',
        next_action: 'clarify',
      };
    }
  }
}

export async function generateFinalSummary(
  role: string,
  topic: string,
  difficulty: string,
  language: string,
  answers: Array<{ question: string; answer: string; score: number }>,
  weakArea: string | null,
  strongArea: string | null
): Promise<FinalSummary> {
  const answersText = answers.map((a, i) =>
    `Q${i + 1}: ${a.question}\nAnswer: ${a.answer}\nScore: ${a.score}/10`
  ).join('\n\n');

  const prompt = `SYSTEM:
You are generating a final interview summary report.

INPUT:
Role: ${role}
Topic: ${topic}
Difficulty: ${difficulty}
Language: ${language}
Weak area: ${weakArea || 'None identified'}
Strong area: ${strongArea || 'None identified'}

Interview transcript:
${answersText}

OUTPUT:
Return a JSON object with exactly this structure:
{
  "overall_score": <number 0-10>,
  "strengths": "<detailed strengths summary>",
  "weaknesses": "<detailed weakness summary>",
  "improvement_roadmap": "<actionable improvement steps>",
  "confidence_summary": "<confidence assessment>",
  "voice_summary_text": "<a short 2-3 sentence spoken summary suitable for text-to-speech in ${language}>"
}

Return only the JSON object. No other text.`;

  try {
    const response = await callGemini(prompt);
    return JSON.parse(response);
  } catch {
    return {
      overall_score: answers.reduce((sum, a) => sum + a.score, 0) / answers.length || 5,
      strengths: strongArea || 'Results pending',
      weaknesses: weakArea || 'Results pending',
      improvement_roadmap: 'Review your answers and practice the weak areas.',
      confidence_summary: 'Keep practicing to improve.',
      voice_summary_text: 'Your interview is complete. Check your detailed results for improvement areas.',
    };
  }
}

function getBackupQuestion(questionType: string, topic: string): string {
  const backups: Record<string, string> = {
    fundamental: `Can you explain the fundamental concepts of ${topic}?`,
    applied: `How would you apply ${topic} concepts in a real-world project?`,
    scenario: `Describe a scenario where ${topic} knowledge helped you solve a problem.`,
    followup: `Can you go deeper into your previous answer about ${topic}?`,
    summary: `What are the most important things a developer should know about ${topic}?`,
  };
  return backups[questionType] || `Tell me about your experience with ${topic}.`;
}

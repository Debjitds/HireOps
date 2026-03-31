// Interview Engine - orchestrates the complete interview flow
// This module coordinates between Gemini, Murf, and the database

import {
  getSession,
  storeQuestion,
  storeAnswer,
  storeFeedback,
  updateSession,
  logSessionEvent,
} from '@/services/sessionService';
import { generateQuestion, evaluateAnswer, generateFinalSummary } from '@/lib/geminiClient';
import { speak } from '@/lib/murfClient';
import { getQuestionType } from '@/services/questionEngine';
import { determineWeakArea, determineStrongArea, type AnswerScores } from '@/services/evaluationEngine';

export interface InterviewState {
  questionNumber: number;
  maxQuestions: number;
  averageScore: number;
  weakArea: string | null;
  strongArea: string | null;
  language: string;
  persona: string;
  allScores: AnswerScores[];
  answers: Array<{ question: string; answer: string; score: number }>;
}

export function createInitialState(language: string, persona: string): InterviewState {
  return {
    questionNumber: 0,
    maxQuestions: 5,
    averageScore: 0,
    weakArea: null,
    strongArea: null,
    language,
    persona,
    allScores: [],
    answers: [],
  };
}

export function updateInterviewState(
  state: InterviewState,
  answer: { question: string; answer: string; score: number; scores: AnswerScores }
): InterviewState {
  const newScores = [...state.allScores, answer.scores];
  const newAnswers = [...state.answers, { question: answer.question, answer: answer.answer, score: answer.score }];
  const avgScore = newAnswers.reduce((sum, a) => sum + a.score, 0) / newAnswers.length;

  return {
    ...state,
    allScores: newScores,
    answers: newAnswers,
    averageScore: avgScore,
    weakArea: determineWeakArea(newScores),
    strongArea: determineStrongArea(newScores),
  };
}

export function isInterviewComplete(state: InterviewState): boolean {
  return state.questionNumber >= state.maxQuestions;
}

// Re-export for convenience
export {
  getSession,
  storeQuestion,
  storeAnswer,
  storeFeedback,
  updateSession,
  logSessionEvent,
  generateQuestion,
  evaluateAnswer,
  generateFinalSummary,
  speak,
  getQuestionType,
};

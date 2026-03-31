// Question Engine - manages question type progression

const QUESTION_TYPES = ['fundamental', 'applied', 'scenario', 'followup', 'summary'] as const;

export type QuestionType = typeof QUESTION_TYPES[number];

export function getQuestionType(questionNumber: number, lastScore?: number): QuestionType {
  // Default 5-question pattern
  if (questionNumber <= 5) {
    const baseType = QUESTION_TYPES[questionNumber - 1];

    // Adaptive modification for Q4 (followup)
    if (questionNumber === 4 && lastScore !== undefined) {
      if (lastScore >= 8) return 'followup'; // deeper follow-up
      if (lastScore <= 4) return 'fundamental'; // re-ask basics
      return 'scenario'; // mid-range: ask scenario
    }

    return baseType;
  }

  // Beyond 5 questions (shouldn't happen in MVP)
  return 'summary';
}

export function getQuestionTypeLabel(type: QuestionType): string {
  const labels: Record<QuestionType, string> = {
    fundamental: 'Fundamentals',
    applied: 'Applied Knowledge',
    scenario: 'Scenario',
    followup: 'Deep Follow-up',
    summary: 'Final Evaluation',
  };
  return labels[type] || type;
}

export function getAdaptiveDifficulty(
  baseDifficulty: string,
  lastScore: number
): string {
  if (lastScore >= 8) {
    return baseDifficulty === 'Easy' ? 'Medium' : baseDifficulty === 'Medium' ? 'Hard' : 'Hard';
  }
  if (lastScore <= 4) {
    return baseDifficulty === 'Hard' ? 'Medium' : baseDifficulty === 'Medium' ? 'Easy' : 'Easy';
  }
  return baseDifficulty;
}

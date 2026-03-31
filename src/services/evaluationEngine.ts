// Evaluation Engine - score normalization and analysis

export interface AnswerScores {
  clarity_score: number;
  structure_score: number;
  technical_depth_score: number;
  relevance_score: number;
  confidence_score: number;
  overall_score: number;
}

export function normalizeScore(score: number): number {
  return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
}

export function calculateOverallScore(scores: AnswerScores): number {
  const avg = (
    scores.clarity_score +
    scores.structure_score +
    scores.technical_depth_score +
    scores.relevance_score +
    scores.confidence_score
  ) / 5;
  return normalizeScore(avg);
}

export function getScoreBand(score: number): string {
  if (score >= 9) return 'Strong';
  if (score >= 7) return 'Good';
  if (score >= 4) return 'Average';
  return 'Weak';
}

export function determineWeakArea(allScores: AnswerScores[]): string | null {
  if (allScores.length === 0) return null;

  const dims: Array<keyof AnswerScores> = ['clarity_score', 'structure_score', 'technical_depth_score', 'relevance_score', 'confidence_score'];
  const labels: Record<string, string> = {
    clarity_score: 'Clarity',
    structure_score: 'Structure',
    technical_depth_score: 'Technical Depth',
    relevance_score: 'Relevance',
    confidence_score: 'Confidence',
  };

  let minDim: string = dims[0];
  let minAvg = Infinity;

  for (const dim of dims) {
    const avg = allScores.reduce((sum, s) => sum + (s[dim] || 0), 0) / allScores.length;
    if (avg < minAvg) {
      minAvg = avg;
      minDim = dim;
    }
  }

  return labels[minDim];
}

export function determineStrongArea(allScores: AnswerScores[]): string | null {
  if (allScores.length === 0) return null;

  const dims: Array<keyof AnswerScores> = ['clarity_score', 'structure_score', 'technical_depth_score', 'relevance_score', 'confidence_score'];
  const labels: Record<string, string> = {
    clarity_score: 'Clarity',
    structure_score: 'Structure',
    technical_depth_score: 'Technical Depth',
    relevance_score: 'Relevance',
    confidence_score: 'Confidence',
  };

  let maxDim: string = dims[0];
  let maxAvg = -Infinity;

  for (const dim of dims) {
    const avg = allScores.reduce((sum, s) => sum + (s[dim] || 0), 0) / allScores.length;
    if (avg > maxAvg) {
      maxAvg = avg;
      maxDim = dim;
    }
  }

  return labels[maxDim];
}

export function calculateSessionAverage(scores: number[]): number | null {
  if (scores.length === 0) return null;
  return normalizeScore(scores.reduce((a, b) => a + b, 0) / scores.length);
}

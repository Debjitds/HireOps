import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSession, getSessionAnswers, getSessionFeedback } from '@/services/sessionService';
import { GlassCard } from '@/components/cards/GlassCard';
import { ScoreCard } from '@/components/cards/ScoreCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Trophy,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Volume2,
  Loader2,
  Mic,
  BookOpen,
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface SessionData {
  id: string;
  role: string;
  topic: string;
  difficulty: string;
  language: string;
  overall_score: number | null;
  question_count: number;
  started_at: string;
  ended_at: string | null;
  persona?: { name: string } | null;
}

interface AnswerData {
  id: string;
  transcript: string;
  clarity_score: number | null;
  structure_score: number | null;
  technical_depth_score: number | null;
  relevance_score: number | null;
  confidence_score: number | null;
  overall_score: number | null;
  strengths: string | null;
  weaknesses: string | null;
  feedback_text: string | null;
  question: { question_text: string; question_type: string; question_number: number } | null;
}

interface FeedbackData {
  overall_score: number;
  strengths: string | null;
  weaknesses: string | null;
  improvement_roadmap: string | null;
  confidence_summary: string | null;
  voice_summary_text: string | null;
}

export default function Results() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionData | null>(null);
  const [answers, setAnswers] = useState<AnswerData[]>([]);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [playingVoice, setPlayingVoice] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    Promise.all([
      getSession(sessionId),
      getSessionAnswers(sessionId),
      getSessionFeedback(sessionId),
    ])
      .then(([s, a, f]) => {
        setSession(s as SessionData);
        setAnswers(a as AnswerData[]);
        setFeedback(f as FeedbackData | null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-electric animate-spin" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Session not found.</p>
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="mt-4 cursor-pointer"
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const overallScore = feedback?.overall_score ?? session.overall_score ?? 0;

  const scoreColor = overallScore >= 8 ? 'text-success' : overallScore >= 5 ? 'text-warning' : 'text-danger';
  const scoreBg = overallScore >= 8 ? 'from-success/20' : overallScore >= 5 ? 'from-warning/20' : 'from-danger/20';

  // Average dimension scores across all answers
  const avgScores = {
    clarity: 0, structure: 0, technicalDepth: 0, relevance: 0, confidence: 0,
  };
  const validAnswers = answers.filter(a => a.overall_score !== null);
  if (validAnswers.length > 0) {
    validAnswers.forEach(a => {
      avgScores.clarity += a.clarity_score || 0;
      avgScores.structure += a.structure_score || 0;
      avgScores.technicalDepth += a.technical_depth_score || 0;
      avgScores.relevance += a.relevance_score || 0;
      avgScores.confidence += a.confidence_score || 0;
    });
    Object.keys(avgScores).forEach(k => {
      avgScores[k as keyof typeof avgScores] /= validAnswers.length;
    });
  }

  const handlePlayVoiceSummary = async () => {
    if (!feedback?.voice_summary_text) return;
    setPlayingVoice(true);
    // Voice playback will be handled by Murf integration (Step 12)
    // For now, use browser speech synthesis as fallback
    const utterance = new SpeechSynthesisUtterance(feedback.voice_summary_text);
    utterance.onend = () => setPlayingVoice(false);
    utterance.onerror = () => setPlayingVoice(false);
    speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-start justify-between gap-4"
      >
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="mb-2 text-muted-foreground cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h1 className="text-3xl font-bold">Interview Results</h1>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <Badge variant="outline">{session.role}</Badge>
            <Badge variant="outline">{session.topic}</Badge>
            <Badge variant="outline">{session.difficulty}</Badge>
            <Badge variant="outline">{session.language}</Badge>
          </div>
        </div>
      </motion.div>

      {/* Overall Score */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard glow="blue" className={cn('text-center py-8 bg-gradient-to-b to-transparent', scoreBg)}>
          <Trophy className={cn('w-10 h-10 mx-auto mb-2', scoreColor)} />
          <p className={cn('text-6xl font-bold', scoreColor)}>
            {overallScore.toFixed(1)}
          </p>
          <p className="text-muted-foreground mt-1">Overall Score / 10</p>
          {feedback?.voice_summary_text && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayVoiceSummary}
              disabled={playingVoice}
              className="mt-4 gap-2 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              {playingVoice ? 'Playing...' : 'Play Voice Summary'}
            </Button>
          )}
        </GlassCard>
      </motion.div>

      {/* Dimension Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <GlassCard hover={false}>
          <h2 className="text-lg font-semibold mb-4">Score Breakdown</h2>
          <div className="space-y-4">
            <ScoreCard label="Clarity" score={avgScores.clarity} />
            <ScoreCard label="Structure" score={avgScores.structure} />
            <ScoreCard label="Technical Depth" score={avgScores.technicalDepth} />
            <ScoreCard label="Relevance" score={avgScores.relevance} />
            <ScoreCard label="Confidence" score={avgScores.confidence} />
          </div>
        </GlassCard>
      </motion.div>

      {/* Strengths & Weaknesses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="grid gap-4 md:grid-cols-2"
      >
        <GlassCard hover={false}>
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-success" /> Strengths
          </h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {feedback?.strengths || 'No strengths data available.'}
          </p>
        </GlassCard>
        <GlassCard hover={false}>
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <TrendingDown className="w-5 h-5 text-warning" /> Areas to Improve
          </h3>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {feedback?.weaknesses || 'No improvement data available.'}
          </p>
        </GlassCard>
      </motion.div>

      {/* Improvement Roadmap */}
      {feedback?.improvement_roadmap && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <GlassCard hover={false}>
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-electric" /> Improvement Roadmap
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {feedback.improvement_roadmap}
            </p>
          </GlassCard>
        </motion.div>
      )}

      {/* Per-Question Breakdown */}
      {answers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4">Question Breakdown</h2>
          <div className="space-y-4">
            {answers.map((answer, i) => (
              <GlassCard key={answer.id} hover={false}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <Badge variant="outline" className="mb-2 text-xs">
                      Q{answer.question?.question_number || i + 1} · {answer.question?.question_type}
                    </Badge>
                    <p className="font-medium text-sm">{answer.question?.question_text}</p>
                  </div>
                  {answer.overall_score !== null && (
                    <span className={cn(
                      'text-xl font-bold shrink-0',
                      answer.overall_score >= 8 ? 'text-success' :
                      answer.overall_score >= 5 ? 'text-warning' : 'text-danger'
                    )}>
                      {answer.overall_score.toFixed(1)}
                    </span>
                  )}
                </div>
                <Separator className="my-3 bg-border/30" />
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Your answer:</p>
                  <p className="text-sm bg-secondary/30 p-3 rounded-lg">{answer.transcript}</p>
                  {answer.feedback_text && (
                    <>
                      <p className="text-xs text-muted-foreground mt-2">Feedback:</p>
                      <p className="text-sm text-muted-foreground">{answer.feedback_text}</p>
                    </>
                  )}
                </div>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pb-8">
        <Button
          onClick={() => navigate('/setup')}
          className="bg-electric hover:bg-electric/90 text-white gap-2 cursor-pointer"
        >
          <Mic className="w-4 h-4" /> Practice Again
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate('/history')}
          className="cursor-pointer"
        >
          View History
        </Button>
      </div>
    </div>
  );
}

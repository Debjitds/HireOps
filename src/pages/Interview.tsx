import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpeech } from '@/hooks/useSpeech';
import {
  getSession,
  storeQuestion,
  storeAnswer,
  storeFeedback,
  updateSession,
  logSessionEvent,
} from '@/services/sessionService';
import { generateQuestion, evaluateAnswer, generateFinalSummary } from '@/lib/geminiClient';
import { speak, stopSpeaking } from '@/lib/murfClient';
import { getQuestionType, getQuestionTypeLabel } from '@/services/questionEngine';
import {
  determineWeakArea,
  determineStrongArea,
  type AnswerScores,
} from '@/services/evaluationEngine';
import { GlassCard } from '@/components/cards/GlassCard';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Mic,
  MicOff,
  Send,
  Loader2,
  Volume2,
  ArrowLeft,
  SkipForward,
  AlertCircle,
  Keyboard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const MAX_QUESTIONS = 5;

interface SessionData {
  id: string;
  role: string;
  topic: string;
  difficulty: string;
  language: string;
  persona_id: string | null;
  company_name: string | null;
  job_title: string | null;
  custom_instructions: string | null;
  persona?: { name: string; tone: string; description: string; strictness_level: number } | null;
}

interface StoredAnswer {
  question: string;
  answer: string;
  score: number;
  scores: AnswerScores;
}

type InterviewPhase = 'loading' | 'ready' | 'generating' | 'speaking' | 'listening' | 'evaluating' | 'feedback' | 'complete';

export default function Interview() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const startTimeRef = useRef<number>(0);

  const [session, setSession] = useState<SessionData | null>(null);
  const [phase, setPhase] = useState<InterviewPhase>('loading');
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentQuestionType, setCurrentQuestionType] = useState('');
  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [useTextMode, setUseTextMode] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [feedbackData, setFeedbackData] = useState<{
    score: number;
    feedback: string;
    strengths: string;
    weaknesses: string;
  } | null>(null);
  const [storedAnswers, setStoredAnswers] = useState<StoredAnswer[]>([]);
  const [error, setError] = useState<string | null>(null);

  const language = session?.language || 'English';
  const {
    transcript,
    interimTranscript,
    isRecording,
    error: speechError,
    supported: speechSupported,
    start: startRecording,
    stop: stopRecording,
    reset: resetSpeech,
    setTranscript,
  } = useSpeech({ language });

  // Load session data
  useEffect(() => {
    if (!sessionId) return;
    getSession(sessionId)
      .then(data => {
        setSession(data as SessionData);
        setPhase('ready');
        startTimeRef.current = Date.now();
        logSessionEvent(sessionId, 'session_started');
      })
      .catch(() => {
        setError('Failed to load interview session.');
        setPhase('loading');
      });
  }, [sessionId]);

  const generateNextQuestion = useCallback(async () => {
    if (!session || !sessionId) return;
    setPhase('generating');
    setError(null);
    setFeedbackData(null);
    resetSpeech();
    setManualInput('');

    const qType = getQuestionType(
      questionNumber,
      storedAnswers.length > 0 ? storedAnswers[storedAnswers.length - 1].score : undefined
    );
    setCurrentQuestionType(qType);

    try {
      const question = await generateQuestion({
        role: session.role,
        topic: session.topic,
        difficulty: session.difficulty,
        persona: session.persona?.name || 'Professional Interviewer',
        personaTone: session.persona?.tone || 'professional',
        language: session.language,
        questionNumber,
        questionType: qType,
        previousScores: storedAnswers.map(a => a.score),
        weakArea: determineWeakArea(storedAnswers.map(a => a.scores)) || undefined,
        strongArea: determineStrongArea(storedAnswers.map(a => a.scores)) || undefined,
        companyName: session.company_name || undefined,
        jobTitle: session.job_title || undefined,
        customInstructions: session.custom_instructions || undefined,
      });

      setCurrentQuestion(question);

      // Store question in DB
      const stored = await storeQuestion(
        sessionId,
        questionNumber,
        question,
        qType,
        session.difficulty,
        session.language,
        session.persona_id
      );
      setCurrentQuestionId(stored.id);
      await logSessionEvent(sessionId, 'question_generated', { questionNumber, type: qType });

      // Speak the question
      setPhase('speaking');
      setIsSpeaking(true);
      try {
        await speak(question, session.language);
      } catch {
        // Voice failed - continue with text
      }
      setIsSpeaking(false);
      setPhase('listening');
    } catch (err) {
      console.error('Failed to generate question:', err);
      setError('Failed to generate question. Please try again.');
      setPhase('listening');
    }
  }, [session, sessionId, questionNumber, storedAnswers, resetSpeech]);

  // Auto-start new questions when phase becomes 'ready'
  useEffect(() => {
    if (phase === 'ready' && session) {
      const timer = setTimeout(() => generateNextQuestion(), 0);
      return () => clearTimeout(timer);
    }
  }, [phase, session, generateNextQuestion]);

  const handleSubmitAnswer = useCallback(async () => {
    const answerText = useTextMode ? manualInput.trim() : transcript.trim();
    if (!answerText || !session || !sessionId || !currentQuestionId) return;

    // Check for too-short answers
    if (answerText.split(' ').length < 3) {
      setError('Your answer seems too short. Can you expand your answer?');
      return;
    }

    if (isRecording) stopRecording();
    setPhase('evaluating');
    setError(null);

    try {
      const evaluation = await evaluateAnswer(
        currentQuestion,
        answerText,
        session.difficulty,
        session.language
      );

      // Store answer in DB
      await storeAnswer(
        currentQuestionId,
        sessionId,
        useTextMode ? 'text' : 'voice',
        answerText,
        evaluation
      );
      await logSessionEvent(sessionId, 'answer_scored', {
        questionNumber,
        score: evaluation.overall_score,
      });

      const newStoredAnswers = [...storedAnswers, {
        question: currentQuestion,
        answer: answerText,
        score: evaluation.overall_score,
        scores: evaluation,
      }];
      setStoredAnswers(newStoredAnswers);

      // Update session
      const allScores = newStoredAnswers.map(a => a.scores);
      await updateSession(sessionId, {
        question_count: questionNumber,
        average_score: newStoredAnswers.reduce((s, a) => s + a.score, 0) / newStoredAnswers.length,
        weak_area: determineWeakArea(allScores),
        strong_area: determineStrongArea(allScores),
      });

      setFeedbackData({
        score: evaluation.overall_score,
        feedback: evaluation.feedback_text,
        strengths: evaluation.strengths,
        weaknesses: evaluation.weaknesses,
      });
      setPhase('feedback');
    } catch (err) {
      console.error('Failed to evaluate answer:', err);
      setError('Failed to evaluate your answer. Please try again.');
      setPhase('listening');
    }
  }, [
    useTextMode, manualInput, transcript, session, sessionId, currentQuestionId,
    currentQuestion, isRecording, stopRecording, questionNumber, storedAnswers,
  ]);

  const endInterview = useCallback(async () => {
    if (!sessionId || !session) return;
    setPhase('generating');

    try {
      const summary = await generateFinalSummary(
        session.role,
        session.topic,
        session.difficulty,
        session.language,
        storedAnswers.map(a => ({ question: a.question, answer: a.answer, score: a.score })),
        determineWeakArea(storedAnswers.map(a => a.scores)),
        determineStrongArea(storedAnswers.map(a => a.scores))
      );

      await storeFeedback(sessionId, {
        ...summary,
        language: session.language,
      });

      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);

      await updateSession(sessionId, {
        status: 'completed',
        overall_score: summary.overall_score,
        ended_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
      });

      await logSessionEvent(sessionId, 'session_completed');

      // Play voice summary
      try {
        await speak(summary.voice_summary_text, session.language);
      } catch {
        // Voice failed, continue
      }

      setPhase('complete');
    } catch (err) {
      console.error('Failed to end interview:', err);
      await updateSession(sessionId, { status: 'completed' });
      setPhase('complete');
    }
  }, [sessionId, session, storedAnswers]);

  const handleNextQuestion = useCallback(async () => {
    if (questionNumber >= MAX_QUESTIONS) {
      await endInterview();
      return;
    }
    setQuestionNumber(prev => prev + 1);
    setPhase('ready');
  }, [questionNumber, endInterview]);



  // endInterview is now defined above handleNextQuestion as a useCallback

  const progress = (questionNumber / MAX_QUESTIONS) * 100;
  const currentAnswer = useTextMode ? manualInput : transcript;
  const fullTranscript = transcript + (interimTranscript ? ` ${interimTranscript}` : '');

  if (phase === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        {error ? (
          <div className="text-center">
            <AlertCircle className="w-10 h-10 text-danger mx-auto mb-3" />
            <p className="text-danger">{error}</p>
            <Button variant="ghost" onClick={() => navigate('/dashboard')} className="mt-4 cursor-pointer">
              Back to Dashboard
            </Button>
          </div>
        ) : (
          <Loader2 className="w-8 h-8 text-electric animate-spin" />
        )}
      </div>
    );
  }

  if (phase === 'complete') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Interview Complete!</h1>
          <p className="text-muted-foreground mb-6">
            Your results are ready. See how you performed.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => navigate(`/results/${sessionId}`)}
              className="bg-electric hover:bg-electric/90 text-white cursor-pointer"
            >
              View Results
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="cursor-pointer"
            >
              Dashboard
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Minimal top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border/30 bg-background/90 backdrop-blur-xl">
        <div className="flex items-center justify-between h-14 px-4 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Leave this interview? Progress will be saved.')) {
                stopSpeaking();
                if (isRecording) stopRecording();
                navigate('/dashboard');
              }
            }}
            className="text-muted-foreground cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Exit
          </Button>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              Q{questionNumber}/{MAX_QUESTIONS}
            </Badge>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex">
              {session?.topic}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {session?.difficulty} · {session?.language}
            </span>
          </div>
        </div>
        <Progress value={progress} className="h-1" />
      </header>

      {/* Main interview area */}
      <main className="pt-20 pb-8 px-4 sm:px-6 flex flex-col items-center" style={{ minHeight: 'calc(100vh - 5rem)' }}>
        <div className="w-full" style={{ maxWidth: 'min(800px, 100%)' }}>
          {/* Question Panel */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`question-${questionNumber}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <GlassCard glow="blue" className="text-center py-8 relative">
                {/* Speaking indicator */}
                {isSpeaking && (
                  <div className="absolute top-4 right-4">
                    <Volume2 className="w-5 h-5 text-electric animate-pulse" />
                  </div>
                )}

                <Badge className="mb-4 bg-electric/10 text-electric border-electric/20">
                  {getQuestionTypeLabel(currentQuestionType as 'fundamental')}
                </Badge>

                {phase === 'generating' ? (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <Loader2 className="w-6 h-6 text-electric animate-spin" />
                    <span className="text-muted-foreground">Generating question...</span>
                  </div>
                ) : (
                  <p className="text-lg sm:text-xl font-medium leading-relaxed px-2">
                    {currentQuestion}
                  </p>
                )}
              </GlassCard>
            </motion.div>
          </AnimatePresence>

          {/* Voice Controls + Input */}
          {(phase === 'listening' || phase === 'speaking') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Mode toggle */}
              <div className="flex justify-center gap-2 mb-2">
                <Button
                  variant={!useTextMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUseTextMode(false)}
                  disabled={!speechSupported}
                  className={cn(!useTextMode && 'bg-electric text-white', 'cursor-pointer gap-1')}
                >
                  <Mic className="w-3.5 h-3.5" /> Voice
                </Button>
                <Button
                  variant={useTextMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUseTextMode(true)}
                  className={cn(useTextMode && 'bg-electric text-white', 'cursor-pointer gap-1')}
                >
                  <Keyboard className="w-3.5 h-3.5" /> Type
                </Button>
              </div>

              {!useTextMode ? (
                /* Voice mode */
                <div className="text-center space-y-4">
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={phase === 'speaking'}
                    className={cn(
                      'w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all cursor-pointer',
                      isRecording
                        ? 'bg-danger/20 text-danger animate-pulse-ring'
                        : 'bg-electric/20 text-electric hover:bg-electric/30'
                    )}
                  >
                    {isRecording ? (
                      <MicOff className="w-8 h-8" />
                    ) : (
                      <Mic className="w-8 h-8" />
                    )}
                  </button>
                  <p className="text-sm text-muted-foreground">
                    {isRecording ? 'Recording... tap to stop' : 'Tap to start recording'}
                  </p>

                  {/* Live transcript */}
                  {(fullTranscript) && (
                    <GlassCard hover={false} className="text-left">
                      <p className="text-xs text-muted-foreground mb-1">Transcript:</p>
                      <p className="text-sm">
                        {transcript}
                        {interimTranscript && (
                          <span className="text-muted-foreground"> {interimTranscript}</span>
                        )}
                      </p>
                    </GlassCard>
                  )}

                  {/* Editable transcript */}
                  {transcript && !isRecording && (
                    <Textarea
                      value={transcript}
                      onChange={e => setTranscript(e.target.value)}
                      className="bg-secondary/50 min-h-[60px] text-sm"
                      placeholder="Edit your transcript if needed..."
                    />
                  )}
                </div>
              ) : (
                /* Text mode */
                <div>
                  <Textarea
                    value={manualInput}
                    onChange={e => setManualInput(e.target.value)}
                    placeholder="Type your answer here..."
                    className="bg-secondary/50 min-h-[120px] text-sm"
                  />
                </div>
              )}

              {/* Error display */}
              {(error || speechError) && (
                <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error || speechError}
                </div>
              )}

              {/* Submit button */}
              <div className="flex justify-center gap-3">
                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim() || phase !== 'listening'}
                  className="bg-electric hover:bg-electric/90 text-white gap-2 cursor-pointer px-8"
                >
                  <Send className="w-4 h-4" />
                  Submit Answer
                </Button>
              </div>
            </motion.div>
          )}

          {/* Evaluating state */}
          {phase === 'evaluating' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8"
            >
              <Loader2 className="w-8 h-8 text-electric animate-spin mx-auto mb-3" />
              <p className="text-muted-foreground">Evaluating your answer...</p>
            </motion.div>
          )}

          {/* Feedback Panel */}
          {phase === 'feedback' && feedbackData && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <GlassCard
                hover={false}
                className={cn(
                  'text-center py-6',
                  feedbackData.score >= 8 ? 'border-success/30' :
                  feedbackData.score >= 5 ? 'border-warning/30' : 'border-danger/30'
                )}
              >
                <p className={cn(
                  'text-4xl font-bold',
                  feedbackData.score >= 8 ? 'text-success' :
                  feedbackData.score >= 5 ? 'text-warning' : 'text-danger'
                )}>
                  {feedbackData.score.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">Score for this answer</p>
              </GlassCard>

              <div className="grid gap-4 sm:grid-cols-2">
                <GlassCard hover={false}>
                  <p className="text-xs text-success font-medium mb-1">Strengths</p>
                  <p className="text-sm text-muted-foreground">{feedbackData.strengths}</p>
                </GlassCard>
                <GlassCard hover={false}>
                  <p className="text-xs text-warning font-medium mb-1">Areas to Improve</p>
                  <p className="text-sm text-muted-foreground">{feedbackData.weaknesses}</p>
                </GlassCard>
              </div>

              <GlassCard hover={false}>
                <p className="text-xs text-electric font-medium mb-1">Feedback</p>
                <p className="text-sm text-muted-foreground">{feedbackData.feedback}</p>
              </GlassCard>

              <div className="flex justify-center">
                <Button
                  onClick={handleNextQuestion}
                  className="bg-electric hover:bg-electric/90 text-white gap-2 cursor-pointer px-8"
                >
                  {questionNumber >= MAX_QUESTIONS ? (
                    <>Finish Interview</>
                  ) : (
                    <>Next Question <SkipForward className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

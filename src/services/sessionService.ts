import { supabase } from '@/lib/supabaseClient';

export interface CreateSessionInput {
  userId: string;
  role: string;
  topic: string;
  difficulty: string;
  language: string;
  personaId: string | null;
  companyName?: string;
  jobTitle?: string;
  customInstructions?: string;
}

export async function createSession(input: CreateSessionInput) {
  const { data, error } = await supabase
    .from('interview_sessions')
    .insert({
      user_id: input.userId,
      role: input.role,
      topic: input.topic,
      difficulty: input.difficulty,
      language: input.language,
      persona_id: input.personaId,
      company_name: input.companyName || null,
      job_title: input.jobTitle || null,
      custom_instructions: input.customInstructions || null,
      status: 'in_progress',
      question_count: 0,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSession(sessionId: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('interview_sessions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSession(sessionId: string) {
  const { data, error } = await supabase
    .from('interview_sessions')
    .select('*, persona:interview_personas(name, tone, description, strictness_level)')
    .eq('id', sessionId)
    .single();

  if (error) throw error;
  return data;
}

export async function getSessionQuestions(sessionId: string) {
  const { data, error } = await supabase
    .from('interview_questions')
    .select('*')
    .eq('session_id', sessionId)
    .order('question_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getSessionAnswers(sessionId: string) {
  const { data, error } = await supabase
    .from('interview_answers')
    .select('*, question:interview_questions(question_text, question_type, question_number)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getSessionFeedback(sessionId: string) {
  const { data, error } = await supabase
    .from('interview_feedback')
    .select('*')
    .eq('session_id', sessionId)
    .single();

  if (error) return null;
  return data;
}

export async function getPersonas() {
  const { data, error } = await supabase
    .from('interview_personas')
    .select('*')
    .order('name');

  if (error) throw error;
  return data || [];
}

export async function logSessionEvent(
  sessionId: string,
  eventType: string,
  eventData?: Record<string, unknown>
) {
  await supabase
    .from('session_events')
    .insert({
      session_id: sessionId,
      event_type: eventType,
      event_data: eventData || null,
    });
}

export async function storeQuestion(
  sessionId: string,
  questionNumber: number,
  questionText: string,
  questionType: string,
  difficulty: string,
  language: string,
  personaId: string | null
) {
  const { data, error } = await supabase
    .from('interview_questions')
    .insert({
      session_id: sessionId,
      question_number: questionNumber,
      question_text: questionText,
      question_type: questionType,
      difficulty,
      language,
      persona_id: personaId,
      generated_by: 'gemini',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function storeAnswer(
  questionId: string,
  sessionId: string,
  answerMode: string,
  transcript: string,
  evaluation: {
    clarity_score: number;
    structure_score: number;
    technical_depth_score: number;
    relevance_score: number;
    confidence_score: number;
    overall_score: number;
    strengths: string;
    weaknesses: string;
    feedback_text: string;
    next_action?: string;
  }
) {
  const { data, error } = await supabase
    .from('interview_answers')
    .insert({
      question_id: questionId,
      session_id: sessionId,
      answer_mode: answerMode,
      transcript,
      ...evaluation,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function storeFeedback(
  sessionId: string,
  feedback: {
    overall_score: number;
    strengths: string;
    weaknesses: string;
    improvement_roadmap: string;
    confidence_summary: string;
    language: string;
    voice_summary_text: string;
  }
) {
  const { data, error } = await supabase
    .from('interview_feedback')
    .insert({
      session_id: sessionId,
      ...feedback,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

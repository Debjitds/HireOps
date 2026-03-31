import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from './useAuth';

export interface InterviewSession {
  id: string;
  user_id: string;
  role: string;
  topic: string;
  difficulty: string;
  language: string;
  persona_id: string | null;
  company_name: string | null;
  job_title: string | null;
  custom_instructions: string | null;
  status: string;
  question_count: number;
  average_score: number | null;
  overall_score: number | null;
  weak_area: string | null;
  strong_area: string | null;
  duration_seconds: number | null;
  started_at: string;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
  persona?: { name: string; tone: string } | null;
}

interface SessionStats {
  totalSessions: number;
  completedSessions: number;
  averageScore: number | null;
  topWeakArea: string | null;
  preferredLanguage: string;
}

export function useSessions() {
  const { user } = useAuth();
  const [recentSessions, setRecentSessions] = useState<InterviewSession[]>([]);
  const [allSessions, setAllSessions] = useState<InterviewSession[]>([]);
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    completedSessions: 0,
    averageScore: null,
    topWeakArea: null,
    preferredLanguage: 'English',
  });
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('interview_sessions')
        .select('*, persona:interview_personas(name, tone)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const sessions = (data || []) as InterviewSession[];
      setAllSessions(sessions);
      setRecentSessions(sessions.slice(0, 5));

      // Calculate stats
      const completed = sessions.filter(s => s.status === 'completed');
      const scores = completed
        .map(s => s.overall_score)
        .filter((s): s is number => s !== null);
      const avgScore = scores.length > 0
        ? scores.reduce((a, b) => a + b, 0) / scores.length
        : null;

      // Find most common weak area
      const weakAreas = completed
        .map(s => s.weak_area)
        .filter((w): w is string => w !== null);
      const weakAreaCounts: Record<string, number> = {};
      weakAreas.forEach(w => { weakAreaCounts[w] = (weakAreaCounts[w] || 0) + 1; });
      const topWeak = Object.entries(weakAreaCounts)
        .sort(([, a], [, b]) => b - a)[0]?.[0] || null;

      setStats({
        totalSessions: sessions.length,
        completedSessions: completed.length,
        averageScore: avgScore ? Math.round(avgScore * 10) / 10 : null,
        topWeakArea: topWeak,
        preferredLanguage: sessions[0]?.language || 'English',
      });
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  return {
    recentSessions,
    allSessions,
    stats,
    loading,
    refetch: fetchSessions,
  };
}

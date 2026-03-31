import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { InterviewSession } from '@/hooks/useSessions';

interface SessionCardProps {
  session: InterviewSession;
  className?: string;
}

export function SessionCard({ session, className }: SessionCardProps) {
  const navigate = useNavigate();

  const scoreColor = session.overall_score
    ? session.overall_score >= 8
      ? 'text-success'
      : session.overall_score >= 5
        ? 'text-warning'
        : 'text-danger'
    : 'text-muted-foreground';

  const statusColors: Record<string, string> = {
    completed: 'bg-success/10 text-success border-success/20',
    in_progress: 'bg-electric/10 text-electric border-electric/20',
    abandoned: 'bg-danger/10 text-danger border-danger/20',
  };

  const formattedDate = new Date(session.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const destination = session.status === 'completed'
    ? `/results/${session.id}`
    : session.status === 'in_progress'
      ? `/interview/${session.id}`
      : `/results/${session.id}`;

  return (
    <button
      onClick={() => navigate(destination)}
      className={cn(
        'glass-card glass-card-hover p-5 w-full text-left transition-all duration-200 cursor-pointer group',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">{session.role}</h3>
          <p className="text-sm text-muted-foreground truncate">{session.topic}</p>
        </div>
        {session.overall_score !== null && (
          <span className={cn('text-2xl font-bold', scoreColor)}>
            {session.overall_score.toFixed(1)}
          </span>
        )}
      </div>

      <div className="flex items-center flex-wrap gap-2">
        <Badge variant="outline" className={statusColors[session.status] || ''}>
          {session.status.replace('_', ' ')}
        </Badge>
        <Badge variant="outline" className="text-muted-foreground border-border">
          {session.difficulty}
        </Badge>
        <Badge variant="outline" className="text-muted-foreground border-border">
          {session.language}
        </Badge>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-electric transition-colors" />
      </div>
    </button>
  );
}

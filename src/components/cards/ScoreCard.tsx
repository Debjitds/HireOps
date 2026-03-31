import { cn } from '@/lib/utils';

interface ScoreCardProps {
  label: string;
  score: number;
  maxScore?: number;
  className?: string;
}

export function ScoreCard({ label, score, maxScore = 10, className }: ScoreCardProps) {
  const percentage = (score / maxScore) * 100;
  const color =
    score >= 8 ? 'text-success' :
    score >= 5 ? 'text-warning' :
    'text-danger';
  const barColor =
    score >= 8 ? 'bg-success' :
    score >= 5 ? 'bg-warning' :
    'bg-danger';

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className={cn('text-sm font-semibold', color)}>
          {score.toFixed(1)}/{maxScore}
        </span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
